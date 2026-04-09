import { describe, it, expect } from 'vitest'
import { calcProgress } from '../utils/progress'

describe('calcProgress', () => {
  it('returns null when subtasks array is empty', () => {
    const result = calcProgress([])
    expect(result).toBeNull()
  })

  it('returns 0% when no subtasks are completed', () => {
    const subtasks = [
      { completed: 0 },
      { completed: 0 },
      { completed: 0 }
    ]
    const result = calcProgress(subtasks)
    expect(result).not.toBeNull()
    expect(result!.done).toBe(0)
    expect(result!.total).toBe(3)
    expect(result!.pct).toBe(0)
  })

  it('returns correct percentage for partial completion', () => {
    const subtasks = [
      { completed: 1 },
      { completed: 0 },
      { completed: 0 }
    ]
    const result = calcProgress(subtasks)
    expect(result).not.toBeNull()
    expect(result!.done).toBe(1)
    expect(result!.total).toBe(3)
    expect(result!.pct).toBe(33)
  })

  it('returns 100% when all subtasks are completed', () => {
    const subtasks = [
      { completed: 1 },
      { completed: 1 },
      { completed: 1 }
    ]
    const result = calcProgress(subtasks)
    expect(result).not.toBeNull()
    expect(result!.done).toBe(3)
    expect(result!.total).toBe(3)
    expect(result!.pct).toBe(100)
  })

  it('rounds percentage to nearest integer', () => {
    // 2 out of 3 = 66.67% → rounds to 67
    const subtasks = [
      { completed: 1 },
      { completed: 1 },
      { completed: 0 }
    ]
    const result = calcProgress(subtasks)
    expect(result!.pct).toBe(67)
  })

  it('handles a single completed subtask', () => {
    const result = calcProgress([{ completed: 1 }])
    expect(result!.done).toBe(1)
    expect(result!.total).toBe(1)
    expect(result!.pct).toBe(100)
  })
})
