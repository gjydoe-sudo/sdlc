'use client'

import { useState } from 'react'
import { type Template, PRIORITY_COLORS } from './types'

interface Props {
  templates: Template[]
  onUse: (id: number) => void
  onDelete: (id: number) => void
  onClose: () => void
}

export function TemplatesModal({ templates, onUse, onDelete, onClose }: Props) {
  const categories = [...new Set(templates.map((t) => t.category).filter(Boolean))] as string[]
  const [filter, setFilter] = useState('')

  const visible = filter ? templates.filter((t) => t.category === filter) : templates

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="templates-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[80vh] overflow-y-auto">
        <h3 id="templates-modal-title" className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Todo Templates
        </h3>
        {categories.length > 0 && (
          <div className="mb-3">
            <label htmlFor="template-category-filter" className="sr-only">Filter by category</label>
            <select
              id="template-category-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        <div className="space-y-2">
          {visible.map((tmpl) => (
            <div key={tmpl.id} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-800 dark:text-white">{tmpl.name}</div>
                  {tmpl.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tmpl.description}</div>
                  )}
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${PRIORITY_COLORS[tmpl.priority]}`}>
                      {tmpl.priority}
                    </span>
                    {tmpl.category && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        {tmpl.category}
                      </span>
                    )}
                    {!!tmpl.is_recurring && (
                      <span className="text-xs text-purple-600 dark:text-purple-400">
                        🔄 {tmpl.recurrence_pattern}
                      </span>
                    )}
                    {tmpl.subtasks_json && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {JSON.parse(tmpl.subtasks_json).length} subtasks
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onUse(tmpl.id)}
                    aria-label={`Use template: ${tmpl.name}`}
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Use
                  </button>
                  <button
                    onClick={() => onDelete(tmpl.id)}
                    aria-label={`Delete template: ${tmpl.name}`}
                    className="px-2 py-1 text-red-500 hover:text-red-700 text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
              No templates yet. Save a todo as a template using the 📋 button.
            </p>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
