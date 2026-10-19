// Pure weather helpers – kept free of React so they are easy to unit test.

/**
 * Wind chill ("feels like") using the North American / UK formula.
 * Only defined for temperatures ≤ 10 °C and wind above 4.8 km/h;
 * returns null outside that range.
 */
export function windChill(tempC, windMs) {
  if (tempC == null || windMs == null) return null
  const kmh = windMs * 3.6
  if (tempC > 10 || kmh <= 4.8) return null
  const v = kmh ** 0.16
  return Math.round((13.12 + 0.6215 * tempC - 11.37 * v + 0.3965 * tempC * v) * 10) / 10
}

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']

/** Converts a wind direction in degrees to a 16-point compass label. */
export function compassDirection(degrees) {
  if (degrees == null) return null
  const index = Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16
  return COMPASS[index]
}

/**
 * Change between the latest temperature and the hourly average
 * 24 hours earlier. Returns null when there is no data for that hour.
 */
export function temperatureTrend(series, latest) {
  if (!latest || latest.TA1_0 == null) return null
  const target = new Date(latest.measured).getTime() - 24 * 60 * 60 * 1000
  const HOUR = 60 * 60 * 1000
  const bucket = series.find((b) => {
    const start = new Date(b.time).getTime()
    return target >= start && target < start + HOUR
  })
  if (!bucket || bucket.temp == null) return null
  return Math.round((latest.TA1_0 - bucket.temp) * 10) / 10
}
