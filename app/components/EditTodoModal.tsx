'use client'

import { type Priority, type RecurrencePattern, type Tag, REMINDER_OPTIONS } from './types'

interface Props {
  title: string
  dueDate: string
  priority: Priority
  isRecurring: boolean
  recurrencePattern: RecurrencePattern
  reminderMinutes: number | ''
  tagIds: number[]
  allTags: Tag[]
  onTitleChange: (v: string) => void
  onDueDateChange: (v: string) => void
  onPriorityChange: (v: Priority) => void
  onIsRecurringChange: (v: boolean) => void
  onRecurrencePatternChange: (v: RecurrencePattern) => void
  onReminderMinutesChange: (v: number | '') => void
  onTagIdsChange: (v: number[]) => void
  onSave: () => void
  onCancel: () => void
}

export function EditTodoModal({
  title, dueDate, priority, isRecurring, recurrencePattern,
  reminderMinutes, tagIds, allTags,
  onTitleChange, onDueDateChange, onPriorityChange, onIsRecurringChange,
  onRecurrencePatternChange, onReminderMinutesChange, onTagIdsChange,
  onSave, onCancel
}: Props) {
  function toggleTag(id: number) {
    onTagIdsChange(tagIds.includes(id) ? tagIds.filter((t) => t !== id) : [...tagIds, id])
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 id="edit-modal-title" className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Edit Todo
        </h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="edit-title" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Title</label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-priority" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Priority</label>
              <select
                id="edit-priority"
                value={priority}
                onChange={(e) => onPriorityChange(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label htmlFor="edit-due" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Due Date</label>
              <input
                id="edit-due"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => onDueDateChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-reminder" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Reminder</label>
              <select
                id="edit-reminder"
                value={reminderMinutes}
                onChange={(e) => onReminderMinutesChange(e.target.value === '' ? '' : parseInt(e.target.value))}
                disabled={!dueDate}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white disabled:opacity-50"
              >
                <option value="">No reminder</option>
                {REMINDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => onIsRecurringChange(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Recurring</span>
              </label>
            </div>
          </div>
          {isRecurring && (
            <div>
              <label htmlFor="edit-pattern" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Pattern</label>
              <select
                id="edit-pattern"
                value={recurrencePattern}
                onChange={(e) => onRecurrencePatternChange(e.target.value as RecurrencePattern)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}
          {allTags.length > 0 && (
            <div>
              <span className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Tags</span>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    style={{
                      backgroundColor: tag.color + (tagIds.includes(tag.id) ? 'ff' : '22'),
                      borderColor: tag.color,
                      color: tagIds.includes(tag.id) ? 'white' : tag.color
                    }}
                    aria-pressed={tagIds.includes(tag.id)}
                    className="px-2 py-0.5 rounded-full border text-xs font-medium"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
