import { useState, useEffect } from 'react'

export function readCache(key) {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch {
    return null
  }
}

export function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }))
  } catch {
    // Storage full or blocked (private mode) – caching is optional.
  }
}

/**
 * Stale-while-revalidate: show cached data instantly, then refresh it in the
 * background when it is older than `maxAge`. Keeps polling while the tab is visible.
 * `fetcher` must be a stable function (e.g. defined at module level).
 */
export function useCachedData(key, fetcher, maxAge) {
  const [cached] = useState(() => readCache(key))
  const [data, setData] = useState(cached?.data ?? null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const refresh = async () => {
      try {
        const fresh = await fetcher()
        if (cancelled) return
        setData(fresh)
        setError(null)
        writeCache(key, fresh)
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }

    // Only poll while the tab is visible – a background tab shouldn't keep
    // downloading data nobody is looking at. Catch up when it becomes visible.
    let lastFetch = cached ? cached.savedAt : 0
    let timer
    const schedule = () => {
      clearTimeout(timer)
      if (document.hidden) return
      timer = setTimeout(async () => {
        lastFetch = Date.now()
        await refresh()
        if (!cancelled) schedule()
      }, Math.max(0, maxAge - (Date.now() - lastFetch)))
    }
    schedule()
    document.addEventListener('visibilitychange', schedule)

    return () => {
      cancelled = true
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', schedule)
    }
  }, [cached, key, fetcher, maxAge])

  return { data, error, loading: !data && !error }
}
