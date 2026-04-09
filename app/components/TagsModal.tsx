'use client'

import { useState } from 'react'
import { type Tag } from './types'

interface Props {
  tags: Tag[]
  onCreate: (name: string, color: string) => void
  onUpdate: (tag: Tag) => void
  onDelete: (id: number) => void
  onClose: () => void
}

export function TagsModal({ tags, onCreate, onUpdate, onDelete, onClose }: Props) {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#3B82F6')
  const [editingTag, setEditingTag] = useState<Tag | null>(null)

  function handleCreate() {
    if (!newName.trim()) return
    onCreate(newName.trim(), newColor)
    setNewName('')
    setNewColor('#3B82F6')
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tags-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl max-h-[80vh] overflow-y-auto">
        <h3 id="tags-modal-title" className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Manage Tags
        </h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Tag name"
            aria-label="New tag name"
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            aria-label="Tag color"
            className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
          />
          <button
            onClick={handleCreate}
            className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
              {editingTag?.id === tag.id ? (
                <>
                  <input
                    type="text"
                    value={editingTag.name}
                    onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                    aria-label="Edit tag name"
                    className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                  <input
                    type="color"
                    value={editingTag.color}
                    onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                    aria-label="Edit tag color"
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <button
                    onClick={() => { onUpdate(editingTag); setEditingTag(null) }}
                    className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingTag(null)}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs rounded"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div style={{ backgroundColor: tag.color }} className="w-4 h-4 rounded-full flex-shrink-0" aria-hidden="true" />
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{tag.name}</span>
                  <button
                    onClick={() => setEditingTag(tag)}
                    aria-label={`Edit tag: ${tag.name}`}
                    className="text-blue-500 hover:text-blue-700 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(tag.id)}
                    aria-label={`Delete tag: ${tag.name}`}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          ))}
          {tags.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No tags yet</p>
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
