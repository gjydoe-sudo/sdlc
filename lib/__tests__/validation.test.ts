import { describe, it, expect } from 'vitest'
import { isOverdue, formatDate, REMINDER_OPTIONS } from '../../app/components/types'
import type { Todo } from '../../app/components/types'

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 1,
    title: 'Test todo',
    completed: 0,
    due_date: null,
    priority: 'medium',
    is_recurring: 0,
    recurrence_pattern: null,
    reminder_minutes: null,
    last_notification_sent: null,
    created_at: new Date().toISOString(),
    subtasks: [],
    tags: [],
    ...overrides
  }
}

describe('isOverdue', () => {
  it('returns false when todo has no due date', () => {
    expect(isOverdue(makeTodo({ due_date: null }))).toBe(false)
  })

  it('returns false when todo is completed regardless of due date', () => {
    const pastDate = new Date(Date.now() - 60_000).toISOString()
    expect(isOverdue(makeTodo({ due_date: pastDate, completed: 1 }))).toBe(false)
  })

  it('returns true when due date is in the past and todo is incomplete', () => {
    const pastDate = new Date(Date.now() - 60_000).toISOString()
    expect(isOverdue(makeTodo({ due_date: pastDate, completed: 0 }))).toBe(true)
  })

  it('returns false when due date is in the future', () => {
    const futureDate = new Date(Date.now() + 60_000 * 60).toISOString()
    expect(isOverdue(makeTodo({ due_date: futureDate, completed: 0 }))).toBe(false)
  })
})

describe('formatDate', () => {
  it('returns empty string for null input', () => {
    expect(formatDate(null)).toBe('')
  })

  it('returns a non-empty string for a valid ISO date', () => {
    const result = formatDate('2025-06-15T10:00:00.000Z')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('formats date using Singapore locale', () => {
    const result = formatDate('2025-01-01T00:00:00.000Z')
    expect(result).toMatch(/Jan|2025/)
  })
})

describe('REMINDER_OPTIONS', () => {
  it('has exactly 7 options', () => {
    expect(REMINDER_OPTIONS).toHaveLength(7)
  })

  it('all options have label and value fields', () => {
    for (const opt of REMINDER_OPTIONS) {
      expect(typeof opt.label).toBe('string')
      expect(typeof opt.value).toBe('number')
      expect(opt.value).toBeGreaterThan(0)
    }
  })

  it('options are in ascending order of minutes', () => {
    for (let i = 1; i < REMINDER_OPTIONS.length; i++) {
      expect(REMINDER_OPTIONS[i].value).toBeGreaterThan(REMINDER_OPTIONS[i - 1].value)
    }
  })

  it('includes 15 minutes and 1 week options', () => {
    const values = REMINDER_OPTIONS.map((o) => o.value)
    expect(values).toContain(15)
    expect(values).toContain(10080)
  })
})
