import { describe, it, expect } from 'vitest'
import { parseResponse } from './api'

const bucket = (time, temp, wind = 1, pressure = 840) => ({
  key_as_string: time,
  temp: { value: temp },
  wind: { value: wind },
  pressure: { value: pressure },
})

describe('parseResponse', () => {
  it('extracts the latest reading, rounded hourly series and 24 h range', () => {
    const result = parseResponse({
      hits: { hits: [{ _source: { measured: '2026-10-19T12:00:00Z', TA1_0: -20.1 } }] },
      aggregations: {
        hourly: { buckets: [bucket('2026-10-19T11:00:00.000Z', -19.96666, 2.04, 839.25)] },
        last24h: { min: { value: -21.62 }, max: { value: -17.31 } },
      },
    })

    expect(result.latest.TA1_0).toBe(-20.1)
    expect(result.series).toEqual([
      { time: '2026-10-19T11:00:00.000Z', temp: -20, wind: 2, pressure: 839.3 },
    ])
    expect(result.range24h).toEqual({ min: -21.6, max: -17.3 })
  })

  it('keeps gaps as null and handles an empty result', () => {
    const result = parseResponse({
      hits: { hits: [] },
      aggregations: {
        hourly: { buckets: [bucket('2026-10-19T11:00:00.000Z', null, null, null)] },
        last24h: { min: { value: null }, max: { value: null } },
      },
    })

    expect(result.latest).toBeNull()
    expect(result.series[0]).toMatchObject({ temp: null, wind: null, pressure: null })
    expect(result.range24h).toEqual({ min: null, max: null })
  })
})
