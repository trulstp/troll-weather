const LOCALE = 'en-GB'

export const formatDay = (iso) =>
  new Date(iso).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(LOCALE, {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
