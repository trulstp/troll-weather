import { describe, it, expect } from 'vitest'
import { summariseDays } from './forecast'
import { stationTime } from './format'

// November: Troll station time is UTC+0, so UTC hours equal station hours.
const entry = (time, temp, wind, { one, six } = {}) => ({
  time,
  data: {
    instant: { details: { air_temperature: temp, wind_speed: wind } },
    ...(one && { next_1_hours: { summary: { symbol_code: one[0] }, details: { precipitation_amount: one[1] } } }),
    ...(six && { next_6_hours: { summary: { symbol_code: six[0] }, details: { precipitation_amount: six[1] } } }),
  },
})

describe('summariseDays', () => {
  const timeseries = [
    entry('2026-11-10T10:00:00Z', -20, 4, { one: ['cloudy', 0.5], six: ['cloudy', 9] }),
    entry('2026-11-10T11:00:00Z', -18, 6, { one: ['lightsnow', 0.5], six: ['cloudy', 9] }),
    // Switch from hourly to 6-hourly steps: use the 6-hour block from here on.
    entry('2026-11-10T12:00:00Z', -17, 5, { one: ['snow', 0.2], six: ['snow', 2] }),
    entry('2026-11-10T18:00:00Z', -22, 3, { six: ['cloudy', 1] }),
    entry('2026-11-11T00:00:00Z', -25, 2, { six: ['clearsky_night', 3] }),
  ]

  it('sums precipitation without double counting overlapping blocks', () => {
    const [day1, day2] = summariseDays(timeseries)
    expect(day1.precipitation).toBe(4) // 0.5 + 0.5 + 2 + 1
    expect(day2.precipitation).toBe(3)
  })

  it('computes daily temperature range and max wind', () => {
    const [day1] = summariseDays(timeseries)
    expect(day1).toMatchObject({ date: '2026-11-10', min: -22, max: -17, maxWind: 6 })
  })

  it('picks the symbol closest to midday', () => {
    const [day1, day2] = summariseDays(timeseries)
    expect(day1.symbol).toBe('snow')
    expect(day2.symbol).toBe('clearsky_night')
  })

  it('falls back to a later symbol when the first period has none', () => {
    const [day] = summariseDays([
      entry('2026-11-10T00:00:00Z', -20, 1),
      entry('2026-11-10T06:00:00Z', -20, 1, { six: ['fair_day', 0] }),
    ])
    expect(day.symbol).toBe('fair_day')
  })

  it('limits the number of days', () => {
    expect(summariseDays(timeseries, 1)).toHaveLength(1)
  })

  it('splits each day into 6-hour periods that add up to the day total', () => {
    const [day1, day2] = summariseDays(timeseries)
    // Day 1 starts mid-period at 10:00, then 6-hour periods from 12:00 and 18:00.
    expect(day1.periods.map((p) => [p.time.slice(11, 16), p.precipitation, p.symbol])).toEqual([
      ['10:00', 1, 'cloudy'],
      ['12:00', 2, 'snow'],
      ['18:00', 1, 'cloudy'],
    ])
    expect(day2.periods).toHaveLength(1)
    for (const day of [day1, day2]) {
      const sum = day.periods.reduce((s, p) => s + p.precipitation, 0)
      expect(sum).toBeCloseTo(day.precipitation, 5)
    }
  })

  it('aligns periods to 02/08/14/20 during Troll summer time (UTC+2, late March–October)', () => {
    const summer = [
      entry('2026-07-10T00:00:00Z', -25, 1, { one: ['fair_day', 0], six: ['fair_day', 0] }), // 02:00 local
      entry('2026-07-10T04:00:00Z', -25, 1, { one: ['fair_day', 0], six: ['fair_day', 0] }), // 06:00 local – not a boundary in summer
      entry('2026-07-10T06:00:00Z', -24, 1, { six: ['cloudy', 0] }), // 08:00 local, 6-hourly from here
      entry('2026-07-10T12:00:00Z', -23, 1, { six: ['cloudy', 0] }), // 14:00 local
    ]
    const [day] = summariseDays(summer)
    expect(day.periods.map((p) => stationTime(p.time).hour)).toEqual([2, 8, 14])
  })
})
