'use client'

import { calcProgress } from '@/lib/utils/progress'
import {
  type Todo,
  type Tag,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  REMINDER_OPTIONS,
  formatDate,
  isOverdue
} from './types'

export interface TodoCardCallbacks {
  onToggle: (id: number, completed: number) => void
  onDelete: (id: number) => void
  onEdit: (todo: Todo) => void
  onSaveTemplate: (todo: Todo) => void
  onToggleExpand: (id: number) => void
  onSubtaskTextChange: (todoId: number, text: string) => void
  onAddSubtask: (todoId: number) => void
  onToggleSubtask: (subtaskId: number, completed: number) => void
  onDeleteSubtask: (subtaskId: number) => void
  onFilterByTag: (tagId: number | '') => void
}

interface Props {
  todo: Todo
  expanded: boolean
  newSubtaskText: string
  filterTagId: number | ''
  callbacks: TodoCardCallbacks
}

export function TodoCard({ todo, expanded, newSubtaskText, filterTagId, callbacks }: Props) {
  const progress = calcProgress(todo.subtasks)
  const overdue = isOverdue(todo)

  return (
    <div
      className={`p-4 rounded-lg shadow-sm border ${
        overdue
          ? 'border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-700'
          : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={todo.completed === 1}
          onChange={() => callbacks.onToggle(todo.id, todo.completed)}
          aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
          className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`flex-1 font-medium ${
                todo.completed
                  ? 'line-through text-gray-400 dark:text-gray-500'
                  : 'text-gray-800 dark:text-white'
              }`}
            >
              {todo.title}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[todo.priority]}`}>
              {PRIORITY_LABELS[todo.priority]}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500 dark:text-gray-400">
            {todo.due_date && (
              <span className={overdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                📅 {formatDate(todo.due_date)}
              </span>
            )}
            {!!todo.is_recurring && (
              <span className="text-purple-600 dark:text-purple-400">
                🔄 {todo.recurrence_pattern}
              </span>
            )}
            {todo.reminder_minutes && (
              <span>
                🔔{' '}
                {REMINDER_OPTIONS.find((r) => r.value === todo.reminder_minutes)?.label ??
                  `${todo.reminder_minutes}m`}
              </span>
            )}
            {todo.tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => callbacks.onFilterByTag(filterTagId === tag.id ? '' : tag.id)}
                style={{ backgroundColor: tag.color + '33', color: tag.color, borderColor: tag.color }}
                className="px-2 py-0.5 rounded-full border text-xs font-medium"
                aria-label={`Filter by tag: ${tag.name}`}
              >
                {tag.name}
              </button>
            ))}
          </div>

          {progress && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    role="progressbar"
                    aria-valuenow={progress.pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Subtask completion progress"
                    className={`h-full rounded-full transition-all ${
                      progress.pct === 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress.pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {progress.done}/{progress.total} ({progress.pct}%)
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => callbacks.onToggleExpand(todo.id)}
            aria-label={expanded ? 'Collapse subtasks' : 'Expand subtasks'}
            aria-expanded={expanded}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs"
          >
            {expanded ? '▲' : '▼'}{' '}
            {todo.subtasks.length > 0 && `(${todo.subtasks.length})`}
          </button>
          <button
            onClick={() => callbacks.onEdit(todo)}
            aria-label={`Edit todo: ${todo.title}`}
            className="p-1.5 text-blue-500 hover:text-blue-700 text-sm"
          >
            ✏️
          </button>
          <button
            onClick={() => callbacks.onSaveTemplate(todo)}
            aria-label="Save as template"
            className="p-1.5 text-gray-400 hover:text-gray-600 text-sm"
          >
            📋
          </button>
          <button
            onClick={() => callbacks.onDelete(todo.id)}
            aria-label={`Delete todo: ${todo.title}`}
            className="p-1.5 text-red-500 hover:text-red-700 text-sm"
          >
            🗑️
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 ml-8 space-y-2">
          {todo.subtasks.map((sub) => (
            <div key={sub.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sub.completed === 1}
                onChange={() => callbacks.onToggleSubtask(sub.id, sub.completed)}
                aria-label={`Mark subtask "${sub.title}" as ${sub.completed ? 'incomplete' : 'complete'}`}
                className="w-4 h-4 rounded border-gray-300 text-blue-500 cursor-pointer"
              />
              <span
                className={`flex-1 text-sm ${
                  sub.completed
                    ? 'line-through text-gray-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {sub.title}
              </span>
              <button
                onClick={() => callbacks.onDeleteSubtask(sub.id)}
                aria-label={`Delete subtask: ${sub.title}`}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newSubtaskText}
              onChange={(e) => callbacks.onSubtaskTextChange(todo.id, e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && callbacks.onAddSubtask(todo.id)}
              placeholder="Add subtask..."
              aria-label="New subtask title"
              className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
            <button
              onClick={() => callbacks.onAddSubtask(todo.id)}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
