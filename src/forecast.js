import { stationTime } from './format'

// MET Norway Locationforecast – the same forecast Yr shows. Licensed CC BY 4.0.
// Terms: https://api.met.no/doc/TermsOfService – identify yourself and respect the
// Expires header. Browsers identify the app by its Origin, and a plain GET lets the
// browser's HTTP cache honour Expires, so repeated calls never hit MET early.
const FORECAST_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=-72.01&lon=2.53&altitude=1270'

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

/** Groups the raw timeseries into one summary per day (station time). */
export function summariseDays(timeseries, days = 7) {
  const byDate = new Map()

  timeseries.forEach((entry, i) => {
    const { date, hour } = stationTime(entry.time)
    const { air_temperature: temp, wind_speed: wind } = entry.data.instant.details
    const { precipitation, symbol } = period(timeseries, i)

    if (!byDate.has(date)) {
      byDate.set(date, { date, min: temp, max: temp, precipitation: 0, maxWind: wind, symbol, symbolHour: hour })
    }
    const day = byDate.get(date)
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
  }))
}

export async function fetchForecast() {
  const response = await fetch(FORECAST_URL)
  if (!response.ok) throw new Error(`Forecast error: ${response.status}`)
  const result = await response.json()
  return {
    updatedAt: result.properties.meta.updated_at,
    days: summariseDays(result.properties.timeseries),
  }
}
