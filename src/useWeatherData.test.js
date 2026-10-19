import { describe, it, expect, vi, afterEach } from 'vitest'
import { readCache, writeCache } from './useWeatherData'

function fakeStorage() {
  const store = new Map()
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('weather cache', () => {
  it('round-trips data with a timestamp', () => {
    vi.stubGlobal('localStorage', fakeStorage())
    vi.useFakeTimers({ now: new Date('2026-10-19T12:00:00Z') })

    writeCache({ latest: { TA1_0: -20 } })

    expect(readCache()).toEqual({
      savedAt: new Date('2026-10-19T12:00:00Z').getTime(),
      data: { latest: { TA1_0: -20 } },
    })
  })

  it('returns null when nothing is cached', () => {
    vi.stubGlobal('localStorage', fakeStorage())
    expect(readCache()).toBeNull()
  })

  it('never throws when storage is unavailable', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('SecurityError') },
      setItem: () => { throw new Error('QuotaExceededError') },
    })
    expect(readCache()).toBeNull()
    expect(() => writeCache({})).not.toThrow()
  })

  it('ignores corrupted cache entries', () => {
    const storage = fakeStorage()
    storage.setItem('troll-weather:v2', '{not json')
    vi.stubGlobal('localStorage', storage)
    expect(readCache()).toBeNull()
  })
})
