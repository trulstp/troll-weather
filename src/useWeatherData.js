import { useState, useEffect } from 'react'
import { fetchWeather } from './api'

const CACHE_KEY = 'troll-weather:v1'
// The station reports every minute; refreshing every 5 minutes is plenty.
const MAX_AGE = 5 * 60 * 1000

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY))
  } catch {
    return null
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }))
  } catch {
    // Storage full or blocked (private mode) – caching is optional.
  }
}

// Stale-while-revalidate: show cached data instantly, then refresh it in the
// background when it is older than MAX_AGE. Keeps polling while the page is open.
export function useWeatherData() {
  const [cached] = useState(readCache)
  const [data, setData] = useState(cached?.data ?? null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const refresh = async () => {
      try {
        const fresh = await fetchWeather()
        if (cancelled) return
        setData(fresh)
        setError(null)
        writeCache(fresh)
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }

    const age = cached ? Date.now() - cached.savedAt : Infinity
    const firstRefresh = setTimeout(refresh, Math.max(0, MAX_AGE - age))
    const interval = setInterval(refresh, MAX_AGE)

    return () => {
      cancelled = true
      clearTimeout(firstRefresh)
      clearInterval(interval)
    }
  }, [cached])

  return { data, error, loading: !data && !error }
}
