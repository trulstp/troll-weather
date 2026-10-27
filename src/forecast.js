import { stationTime } from './format'

// MET Norway Locationforecast – the same forecast Yr shows. Licensed CC BY 4.0.
// Terms: https://api.met.no/doc/TermsOfService – identify yourself and respect the
// Expires header. Browsers identify the app by its Origin, and a plain GET lets the
// browser's HTTP cache honour Expires, so repeated calls never hit MET early.
export const FORECAST_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=-72.01&lon=2.53&altitude=1270'

const HOUR = 60 * 60 * 1000
const round1 = (v) => Math.round(v * 10) / 10

/**
 * Precipitation and symbol for the period starting at entry `i`.
 * The forecast is hourly for the first ~2.5 days and 6-hourly after that,
 * so the period length is decided by the gap to the next entry.
 */
function period(timeseries, i) {
  const { data } = timeseries[i]
  const next = timeseries[i + 1]
  const gap = next ? (new Date(next.time) - new Date(timeseries[i].time)) / HOUR : null
  const block = gap === 1 ? data.next_1_hours : (data.next_6_hours ?? data.next_1_hours)
  return {
    precipitation: block?.details?.precipitation_amount ?? 0,
    symbol: block?.summary?.symbol_code ?? null,
  }
}

/**
 * Hour (in station time) that the 6-hour periods are aligned to. MET's 6-hourly
 * steps start at 00/06/12/18 UTC, which is 02/08/14/20 during Troll summer time.
 */
function periodOffset(timeseries) {
  const i = timeseries.findIndex((e, j) => {
    const next = timeseries[j + 1]
    return next && new Date(next.time) - new Date(e.time) >= 6 * HOUR
  })
  return i === -1 ? 0 : stationTime(timeseries[i].time).hour % 6
}

/** Groups the raw timeseries into one summary per day (station time). */
export function summariseDays(timeseries, days = 7) {
  const byDate = new Map()
  const offset = periodOffset(timeseries)

  timeseries.forEach((entry, i) => {
    const { date, hour } = stationTime(entry.time)
    const { air_temperature: temp, wind_speed: wind } = entry.data.instant.details
    const { precipitation, symbol } = period(timeseries, i)

    if (!byDate.has(date)) {
      byDate.set(date, { date, min: temp, max: temp, precipitation: 0, maxWind: wind, symbol, symbolHour: hour, periods: [] })
    }
    const day = byDate.get(date)

    // 6-hour breakdown (like Yr's expanded day). A period starts at each aligned
    // hour, and also at the first entry of a day, so "rest of today" and days that
    // start mid-period are covered. Precipitation reuses period() above, so the
    // periods always add up to the day total.
    if (!day.periods.length || hour % 6 === offset) {
      const block = entry.data.next_6_hours ?? entry.data.next_1_hours
      day.periods.push({ time: entry.time, symbol: block?.summary?.symbol_code ?? null, precipitation: 0, temp, wind })
    }
    day.periods.at(-1).precipitation += precipitation
    day.min = Math.min(day.min, temp)
    day.max = Math.max(day.max, temp)
    day.maxWind = Math.max(day.maxWind, wind)
    day.precipitation += precipitation
    // Like Yr, use the weather around midday to represent the day.
    if (symbol && (!day.symbol || Math.abs(hour - 12) < Math.abs(day.symbolHour - 12))) {
      day.symbol = symbol
      day.symbolHour = hour
    }
  })

  return [...byDate.values()].slice(0, days).map((day) => ({
    date: day.date,
    symbol: day.symbol,
    min: round1(day.min),
    max: round1(day.max),
    maxWind: round1(day.maxWind),
    precipitation: round1(day.precipitation),
    periods: day.periods.map((p) => ({ ...p, precipitation: round1(p.precipitation) })),
  }))
}

export async function fetchForecast() {
  const response = await fetch(FORECAST_URL)
  if (!response.ok) throw new Error(`Forecast error: ${response.status}`)
  // MET's terms: 203 means this API version is deprecated – log it so it gets noticed.
  if (response.status === 203) console.warn('MET Norway: Locationforecast 2.0 is deprecated, see https://api.met.no/')
  const result = await response.json()
  return {
    updatedAt: result.properties.meta.updated_at,
    days: summariseDays(result.properties.timeseries),
  }
}
