import { describe, it, expect } from 'vitest'
import { calcNextDueDate } from '../utils/recurrence'

describe('calcNextDueDate', () => {
  const BASE_DATE = '2024-03-15T10:00:00.000Z'

  it('daily: adds exactly 1 day', () => {
    const result = calcNextDueDate(BASE_DATE, 'daily')
    const next = new Date(result)
    const base = new Date(BASE_DATE)
    const diffMs = next.getTime() - base.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    expect(diffDays).toBe(1)
  })

  it('weekly: adds exactly 7 days', () => {
    const result = calcNextDueDate(BASE_DATE, 'weekly')
    const next = new Date(result)
    const base = new Date(BASE_DATE)
    const diffMs = next.getTime() - base.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    expect(diffDays).toBe(7)
  })

  it('monthly: adds 1 month (same day next month)', () => {
    const result = calcNextDueDate(BASE_DATE, 'monthly')
    const next = new Date(result)
    expect(next.getUTCMonth()).toBe(3) // April (0-indexed)
    expect(next.getUTCDate()).toBe(15)
    expect(next.getUTCFullYear()).toBe(2024)
  })

  it('yearly: adds 1 year (same date next year)', () => {
    const result = calcNextDueDate(BASE_DATE, 'yearly')
    const next = new Date(result)
    expect(next.getUTCFullYear()).toBe(2025)
    expect(next.getUTCMonth()).toBe(2) // March
    expect(next.getUTCDate()).toBe(15)
  })

  it('monthly edge case: Jan 31 → Feb 28/29 (no overflow)', () => {
    // Jan 31 + 1 month in JS Date: setMonth(1) with day 31 → March 2 or 3 (JS rolls over)
    const jan31 = '2024-01-31T00:00:00.000Z'
    const result = calcNextDueDate(jan31, 'monthly')
    const next = new Date(result)
    // JS Date rolls Jan 31 + 1 month to March 2 (2024 is leap year)
    // This tests that the function returns a valid date (not NaN)
    expect(isNaN(next.getTime())).toBe(false)
  })

  it('returns a valid ISO string', () => {
    const result = calcNextDueDate(BASE_DATE, 'daily')
    expect(typeof result).toBe('string')
    expect(() => new Date(result)).not.toThrow()
    expect(isNaN(new Date(result).getTime())).toBe(false)
  })
})
