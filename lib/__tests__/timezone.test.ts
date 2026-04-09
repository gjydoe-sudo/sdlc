import { describe, it, expect } from 'vitest'
import { getSingaporeNow, formatSingaporeDate, toSingaporeISO } from '../timezone'

describe('getSingaporeNow', () => {
  it('returns a Date object', () => {
    const result = getSingaporeNow()
    expect(result).toBeInstanceOf(Date)
  })

  it('returns a valid date (not NaN)', () => {
    const result = getSingaporeNow()
    expect(isNaN(result.getTime())).toBe(false)
  })

  it('is within 1 second of current time adjusted to SGT', () => {
    const now = new Date()
    const sgOffset = 8 * 60
    const utcOffset = now.getTimezoneOffset()
    const diff = sgOffset + utcOffset
    const expected = new Date(now.getTime() + diff * 60 * 1000)
    const result = getSingaporeNow()
    expect(Math.abs(result.getTime() - expected.getTime())).toBeLessThan(1000)
  })
})

describe('formatSingaporeDate', () => {
  it('accepts a Date object and returns a string', () => {
    const result = formatSingaporeDate(new Date('2024-01-15T10:00:00Z'))
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('accepts an ISO string and returns a string', () => {
    const result = formatSingaporeDate('2024-06-01T00:00:00Z')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('formats date with Singapore locale (en-SG timezone)', () => {
    // 2024-01-15T10:00:00Z is 2024-01-15 18:00:00 in SGT
    const result = formatSingaporeDate('2024-01-15T10:00:00Z')
    // en-SG formatting should include 2024
    expect(result).toContain('2024')
  })
})

describe('toSingaporeISO', () => {
  it('returns an ISO-like string (contains T)', () => {
    const result = toSingaporeISO(new Date('2024-01-15T00:00:00Z'))
    expect(result).toContain('T')
  })

  it('returns a string in sv-SE format (YYYY-MM-DDTHH:MM:SS)', () => {
    const result = toSingaporeISO(new Date('2024-01-15T00:00:00Z'))
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('converts UTC midnight to SGT (UTC+8)', () => {
    // 2024-01-15T00:00:00Z → 2024-01-15T08:00:00 in SGT
    const result = toSingaporeISO(new Date('2024-01-15T00:00:00Z'))
    expect(result.startsWith('2024-01-15T08:00:00')).toBe(true)
  })
})
