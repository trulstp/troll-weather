import { describe, it, expect, vi, afterEach } from 'vitest'
import { readCache, writeCache } from './useCachedData'

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

    writeCache('test', { latest: { TA1_0: -20 } })

    expect(readCache('test')).toEqual({
      savedAt: new Date('2026-10-19T12:00:00Z').getTime(),
      data: { latest: { TA1_0: -20 } },
    })
  })

  it('returns null when nothing is cached', () => {
    vi.stubGlobal('localStorage', fakeStorage())
    expect(readCache('test')).toBeNull()
  })

  it('never throws when storage is unavailable', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('SecurityError') },
      setItem: () => { throw new Error('QuotaExceededError') },
    })
    expect(readCache('test')).toBeNull()
    expect(() => writeCache('test', {})).not.toThrow()
  })

  it('ignores corrupted cache entries', () => {
    const storage = fakeStorage()
    storage.setItem('test', '{not json')
    vi.stubGlobal('localStorage', storage)
    expect(readCache('test')).toBeNull()
  })
})
