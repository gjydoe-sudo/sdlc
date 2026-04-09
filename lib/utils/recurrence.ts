export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly'

/**
 * Calculates the next due date for a recurring todo based on the recurrence pattern.
 * @param dueDate - ISO 8601 date string of the current due date
 * @param pattern - Recurrence pattern
 * @returns ISO 8601 string for the next due date
 */
export function calcNextDueDate(dueDate: string, pattern: RecurrencePattern): string {
  const d = new Date(dueDate)

  switch (pattern) {
    case 'daily':
      d.setDate(d.getDate() + 1)
      break
    case 'weekly':
      d.setDate(d.getDate() + 7)
      break
    case 'monthly':
      d.setMonth(d.getMonth() + 1)
      break
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1)
      break
  }

  return d.toISOString()
}
