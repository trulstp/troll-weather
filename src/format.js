const LOCALE = 'en-GB'

export const formatDay = (iso) =>
  new Date(iso).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(LOCALE, {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
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
