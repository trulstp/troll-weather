import { describe, it, expect } from 'vitest'
import { formatRelative, formatNumber } from './format'

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
