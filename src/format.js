const LOCALE = 'en-GB'

// All dates are shown in the station's own time zone, like Yr does for a location.
export const STATION_TZ = 'Antarctica/Troll'

export const formatDay = (iso) =>
  new Date(iso).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', timeZone: STATION_TZ })

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(LOCALE, {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: STATION_TZ, timeZoneName: 'short',
  })

const dateParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: STATION_TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
})

/** Calendar date ('2026-10-27') and hour (0–23) of an instant, in station time. */
export function stationTime(iso) {
  const p = Object.fromEntries(dateParts.formatToParts(new Date(iso)).map(({ type, value }) => [type, value]))
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) }
}

/** '2026-10-27' → 'Tue 27 Oct' (the date key is already in station time). */
export const formatWeekday = (dateKey) =>
  new Date(`${dateKey}T12:00:00Z`).toLocaleDateString(LOCALE, {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
  })

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/** "just now", "5 minutes ago", "2 hours ago", "yesterday"… */
export function formatRelative(iso, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000)
  if (Math.abs(seconds) < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return relative.format(hours, 'hour')
  return relative.format(Math.round(hours / 24), 'day')
}

/** Uses a real minus sign (−) so negative numbers read and align nicely. */
export const formatNumber = (value) => (value == null ? '–' : String(value).replace('-', '−'))
