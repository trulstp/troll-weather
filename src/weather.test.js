import { describe, it, expect } from 'vitest'
import { windChill, compassDirection, temperatureTrend } from './weather'

describe('windChill', () => {
  it('matches the Environment Canada formula (−20 °C, 20 km/h → −30.5 °C)', () => {
    // 13.12 + 0.6215·T − 11.37·V^0.16 + 0.3965·T·V^0.16 = −30.48 (table value rounds to −30)
    expect(windChill(-20, 20 / 3.6)).toBe(-30.5)
  })

  it('is undefined in calm wind or warm weather', () => {
    expect(windChill(-20, 1)).toBeNull()
    expect(windChill(15, 10)).toBeNull()
  })

  it('handles missing readings', () => {
    expect(windChill(null, 5)).toBeNull()
    expect(windChill(-10, null)).toBeNull()
  })
})

describe('compassDirection', () => {
  it.each([
    [0, 'N'], [11, 'N'], [12, 'NNE'], [90, 'E'], [180, 'S'], [270, 'W'], [349, 'N'], [360, 'N'], [-90, 'W'],
  ])('%i° → %s', (degrees, expected) => {
    expect(compassDirection(degrees)).toBe(expected)
  })

  it('returns null for missing data', () => {
    expect(compassDirection(null)).toBeNull()
  })
})

describe('temperatureTrend', () => {
  const series = [
    { time: '2026-10-18T12:00:00.000Z', temp: -21 },
    { time: '2026-10-18T13:00:00.000Z', temp: -20 },
  ]

  it('compares with the hourly average 24 h earlier', () => {
    const latest = { measured: '2026-10-19T12:30:00Z', TA1_0: -18.5 }
    expect(temperatureTrend(series, latest)).toBe(2.5)
  })

  it('returns null when that hour is missing', () => {
    const latest = { measured: '2026-10-19T20:00:00Z', TA1_0: -18 }
    expect(temperatureTrend(series, latest)).toBeNull()
  })

  it('returns null without a current temperature', () => {
    expect(temperatureTrend(series, { measured: '2026-10-19T12:30:00Z', TA1_0: null })).toBeNull()
  })
})
