export type Priority = 'high' | 'medium' | 'low'
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Subtask {
  id: number
  todo_id: number
  title: string
  completed: number
  position: number
}

export interface Tag {
  id: number
  user_id?: number
  name: string
  color: string
}

export interface Todo {
  id: number
  title: string
  completed: number
  due_date: string | null
  priority: Priority
  is_recurring: number
  recurrence_pattern: RecurrencePattern | null
  reminder_minutes: number | null
  last_notification_sent: string | null
  created_at: string
  subtasks: Subtask[]
  tags: Tag[]
}

export interface Template {
  id: number
  name: string
  description: string | null
  category: string | null
  title_template: string
  priority: Priority
  is_recurring: number
  recurrence_pattern: RecurrencePattern | null
  reminder_minutes: number | null
  subtasks_json: string | null
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
}

export const REMINDER_OPTIONS = [
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '2 hours before', value: 120 },
  { label: '1 day before', value: 1440 },
  { label: '2 days before', value: 2880 },
  { label: '1 week before', value: 10080 }
]

export function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-SG', {
    timeZone: 'Asia/Singapore',
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

export function isOverdue(todo: Todo): boolean {
  if (!todo.due_date || todo.completed) return false
  return new Date(todo.due_date) < new Date()
}
