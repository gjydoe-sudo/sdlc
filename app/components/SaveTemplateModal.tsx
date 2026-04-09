'use client'

import { type Todo } from './types'

interface Props {
  todo: Todo
  name: string
  description: string
  category: string
  onNameChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onCategoryChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
}

export function SaveTemplateModal({
  todo, name, description, category,
  onNameChange, onDescriptionChange, onCategoryChange,
  onSave, onCancel
}: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-template-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-xl">
        <h3 id="save-template-modal-title" className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
          Save as Template
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 truncate">
          From: <span className="font-medium">{todo.title}</span>
        </p>
        <div className="space-y-3">
          <div>
            <label htmlFor="template-name" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Template Name <span aria-hidden="true">*</span>
            </label>
            <input
              id="template-name"
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Weekly Review"
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
            />
          </div>
          <div>
            <label htmlFor="template-desc" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Description</label>
            <input
              id="template-desc"
              type="text"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
            />
          </div>
          <div>
            <label htmlFor="template-category" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Category</label>
            <input
              id="template-category"
              type="text"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              placeholder="e.g. Work, Personal"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!name.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
