export interface ProgressInfo {
  done: number
  total: number
  pct: number
}

/**
 * Calculates completion progress for a list of subtasks.
 * Returns null when there are no subtasks.
 */
export function calcProgress(subtasks: { completed: number }[]): ProgressInfo | null {
  if (subtasks.length === 0) return null

  const done = subtasks.filter((s) => s.completed).length
  const pct = Math.round((done / subtasks.length) * 100)

  return { done, total: subtasks.length, pct }
}
