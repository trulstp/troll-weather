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
 * background when it is older than `maxAge`. Keeps polling while the page is open.
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

    const age = cached ? Date.now() - cached.savedAt : Infinity
    const firstRefresh = setTimeout(refresh, Math.max(0, maxAge - age))
    const interval = setInterval(refresh, maxAge)

    return () => {
      cancelled = true
      clearTimeout(firstRefresh)
      clearInterval(interval)
    }
  }, [cached, key, fetcher, maxAge])

  return { data, error, loading: !data && !error }
}
