import { describe, it, expect } from 'vitest'
import { formatRelative, formatNumber, stationTime, formatWeekday } from './format'

describe('formatRelative', () => {
  const now = new Date('2026-10-19T12:00:00Z').getTime()
  const ago = (ms) => new Date(now - ms).toISOString()

  it.each([
    [20 * 1000, 'just now'],
    [5 * 60 * 1000, '5 minutes ago'],
    [2 * 60 * 60 * 1000, '2 hours ago'],
    [30 * 60 * 60 * 1000, 'yesterday'],
    [3 * 24 * 60 * 60 * 1000, '3 days ago'],
  ])('%i ms ago → %s', (ms, expected) => {
    expect(formatRelative(ago(ms), now)).toBe(expected)
  })
})

describe('formatNumber', () => {
  it('uses a typographic minus sign', () => {
    expect(formatNumber(-20.4)).toBe('−20.4')
    expect(formatNumber(3)).toBe('3')
  })

  it('shows a dash for missing values', () => {
    expect(formatNumber(null)).toBe('–')
  })
})

describe('stationTime', () => {
  it('uses Troll summer time (UTC+2), which can change the date', () => {
    expect(stationTime('2026-07-01T22:30:00Z')).toEqual({ date: '2026-07-02', hour: 0 })
  })

  it('uses UTC+0 outside summer time', () => {
    expect(stationTime('2026-11-10T23:30:00Z')).toEqual({ date: '2026-11-10', hour: 23 })
  })
})

describe('formatWeekday', () => {
  it('formats a station date key', () => {
    expect(formatWeekday('2026-10-27')).toBe('Tue 27 Oct')
  })
})
