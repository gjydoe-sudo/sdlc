'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Priority = 'high' | 'medium' | 'low'
type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly'

interface Subtask {
  id: number
  todo_id: number
  title: string
  completed: number
  position: number
}

interface Tag {
  id: number
  user_id?: number
  name: string
  color: string
}

interface Todo {
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

interface Template {
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

const PRIORITY_LABELS: Record<Priority, string> = { high: 'High', medium: 'Medium', low: 'Low' }
const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
}

const REMINDER_OPTIONS = [
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '2 hours before', value: 120 },
  { label: '1 day before', value: 1440 },
  { label: '2 days before', value: 2880 },
  { label: '1 week before', value: 10080 }
]

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-SG', { timeZone: 'Asia/Singapore', dateStyle: 'medium', timeStyle: 'short' })
}

function isOverdue(todo: Todo) {
  if (!todo.due_date || todo.completed) return false
  return new Date(todo.due_date) < new Date()
}

export default function HomePage() {
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')

  // Form state
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('daily')
  const [reminderMinutes, setReminderMinutes] = useState<number | ''>('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])

  // UI state
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState<Priority | ''>('')
  const [filterTagId, setFilterTagId] = useState<number | ''>('')
  const [expandedTodos, setExpandedTodos] = useState<Set<number>>(new Set())
  const [newSubtaskText, setNewSubtaskText] = useState<Record<number, string>>({})
  const [darkMode, setDarkMode] = useState(false)

  // Modal state
  const [editTodo, setEditTodo] = useState<Todo | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editPriority, setEditPriority] = useState<Priority>('medium')
  const [editIsRecurring, setEditIsRecurring] = useState(false)
  const [editRecurrencePattern, setEditRecurrencePattern] = useState<RecurrencePattern>('daily')
  const [editReminderMinutes, setEditReminderMinutes] = useState<number | ''>('')
  const [editTagIds, setEditTagIds] = useState<number[]>([])

  const [showTagsModal, setShowTagsModal] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3B82F6')
  const [editingTag, setEditingTag] = useState<Tag | null>(null)

  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false)
  const [saveTemplateTodo, setSaveTemplateTodo] = useState<Todo | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [templateDesc, setTemplateDesc] = useState('')
  const [templateCategory, setTemplateCategory] = useState('')
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('')

  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default')
  const notifInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // Dark mode
  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved === 'true') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  function toggleDarkMode() {
    const next = !darkMode
    setDarkMode(next)
    localStorage.setItem('darkMode', String(next))
    document.documentElement.classList.toggle('dark', next)
  }

  // Auth check
  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) { router.push('/login'); return }
      const data = await res.json()
      setUsername(data.username)
      await Promise.all([fetchTodos(), fetchTags(), fetchTemplates()])
    } catch {
      router.push('/login')
    }
  }

  async function fetchTodos() {
    const res = await fetch('/api/todos')
    if (res.ok) setTodos(await res.json())
    setLoading(false)
  }

  async function fetchTags() {
    const res = await fetch('/api/tags')
    if (res.ok) setAllTags(await res.json())
  }

  async function fetchTemplates() {
    const res = await fetch('/api/templates')
    if (res.ok) setTemplates(await res.json())
  }

  // Notifications
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission)
    }
  }, [])

  const checkNotifications = useCallback(async () => {
    if (notifPermission !== 'granted') return
    const res = await fetch('/api/notifications/check')
    if (!res.ok) return
    const due: { id: number; title: string; due_date: string }[] = await res.json()
    for (const item of due) {
      new Notification('Todo Reminder', {
        body: `${item.title} is due at ${formatDate(item.due_date)}`
      })
    }
  }, [notifPermission])

  useEffect(() => {
    if (notifPermission === 'granted') {
      notifInterval.current = setInterval(checkNotifications, 30000)
      checkNotifications()
    }
    return () => { if (notifInterval.current) clearInterval(notifInterval.current) }
  }, [notifPermission, checkNotifications])

  async function requestNotifPermission() {
    const perm = await Notification.requestPermission()
    setNotifPermission(perm)
  }

  // Create todo
  async function addTodo(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    const body: Record<string, unknown> = {
      title: trimmed,
      priority,
      is_recurring: isRecurring ? 1 : 0
    }
    if (dueDate) body.due_date = new Date(dueDate).toISOString()
    if (isRecurring && recurrencePattern) body.recurrence_pattern = recurrencePattern
    if (reminderMinutes !== '') body.reminder_minutes = reminderMinutes
    if (selectedTagIds.length > 0) body.tag_ids = selectedTagIds

    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (res.ok) {
      const newTodo: Todo = await res.json()
      if (selectedTagIds.length > 0) {
        await fetch(`/api/todos/${newTodo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag_ids: selectedTagIds })
        })
      }
      setTitle('')
      setDueDate('')
      setPriority('medium')
      setIsRecurring(false)
      setRecurrencePattern('daily')
      setReminderMinutes('')
      setSelectedTagIds([])
      fetchTodos()
    }
  }

  // Toggle completion
  async function toggleTodo(id: number, completed: number) {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: completed ? 0 : 1 } : t))
    await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: completed ? 0 : 1 })
    })
    fetchTodos()
  }

  // Delete todo
  async function deleteTodo(id: number) {
    setDeleteConfirm(null)
    setTodos((prev) => prev.filter((t) => t.id !== id))
    await fetch(`/api/todos/${id}`, { method: 'DELETE' })
  }

  // Edit todo
  function openEdit(todo: Todo) {
    setEditTodo(todo)
    setEditTitle(todo.title)
    setEditDueDate(todo.due_date ? new Date(todo.due_date).toISOString().slice(0, 16) : '')
    setEditPriority(todo.priority)
    setEditIsRecurring(!!todo.is_recurring)
    setEditRecurrencePattern(todo.recurrence_pattern ?? 'daily')
    setEditReminderMinutes(todo.reminder_minutes ?? '')
    setEditTagIds(todo.tags.map((t) => t.id))
  }

  async function saveEdit() {
    if (!editTodo || !editTitle.trim()) return
    const body: Record<string, unknown> = {
      title: editTitle.trim(),
      priority: editPriority,
      is_recurring: editIsRecurring ? 1 : 0,
      recurrence_pattern: editIsRecurring ? editRecurrencePattern : null,
      reminder_minutes: editReminderMinutes !== '' ? editReminderMinutes : null,
      due_date: editDueDate ? new Date(editDueDate).toISOString() : null,
      tag_ids: editTagIds
    }
    const res = await fetch(`/api/todos/${editTodo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (res.ok) {
      setEditTodo(null)
      fetchTodos()
    }
  }

  // Subtasks
  function toggleExpand(id: number) {
    setExpandedTodos((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function addSubtask(todoId: number) {
    const text = newSubtaskText[todoId]?.trim()
    if (!text) return
    await fetch(`/api/todos/${todoId}/subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: text })
    })
    setNewSubtaskText((prev) => ({ ...prev, [todoId]: '' }))
    fetchTodos()
  }

  async function toggleSubtask(subtaskId: number, completed: number) {
    await fetch(`/api/subtasks/${subtaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: completed ? 0 : 1 })
    })
    fetchTodos()
  }

  async function deleteSubtask(subtaskId: number) {
    await fetch(`/api/subtasks/${subtaskId}`, { method: 'DELETE' })
    fetchTodos()
  }

  // Tags CRUD
  async function createTag() {
    if (!newTagName.trim()) return
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTagName.trim(), color: newTagColor })
    })
    if (res.ok) {
      setNewTagName('')
      setNewTagColor('#3B82F6')
      fetchTags()
    }
  }

  async function saveEditTag() {
    if (!editingTag) return
    await fetch(`/api/tags/${editingTag.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingTag.name, color: editingTag.color })
    })
    setEditingTag(null)
    fetchTags()
    fetchTodos()
  }

  async function deleteTag(id: number) {
    await fetch(`/api/tags/${id}`, { method: 'DELETE' })
    fetchTags()
    fetchTodos()
  }

  // Templates
  async function saveTemplate() {
    if (!saveTemplateTodo || !templateName.trim()) return
    const subtaskTitles = saveTemplateTodo.subtasks.map((s) => s.title)
    await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: templateName.trim(),
        description: templateDesc || null,
        category: templateCategory || null,
        title_template: saveTemplateTodo.title,
        priority: saveTemplateTodo.priority,
        is_recurring: saveTemplateTodo.is_recurring,
        recurrence_pattern: saveTemplateTodo.recurrence_pattern,
        reminder_minutes: saveTemplateTodo.reminder_minutes,
        subtasks_json: subtaskTitles.length > 0 ? JSON.stringify(subtaskTitles) : null
      })
    })
    setShowSaveTemplateModal(false)
    setTemplateName('')
    setTemplateDesc('')
    setTemplateCategory('')
    setSaveTemplateTodo(null)
    fetchTemplates()
  }

  async function useTemplate(templateId: number) {
    const res = await fetch(`/api/templates/${templateId}/use`, { method: 'POST' })
    if (res.ok) {
      setShowTemplatesModal(false)
      fetchTodos()
    }
  }

  async function deleteTemplate(id: number) {
    await fetch(`/api/templates/${id}`, { method: 'DELETE' })
    fetchTemplates()
  }

  // Export / Import
  async function exportTodos() {
    const res = await fetch('/api/todos/export')
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `todos-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importInputRef = useRef<HTMLInputElement>(null)

  async function importTodos(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    let json
    try { json = JSON.parse(text) } catch { alert('Invalid JSON file'); return }
    const res = await fetch('/api/todos/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(json)
    })
    if (res.ok) {
      const data = await res.json()
      alert(`Imported ${data.imported.todos} todos and ${data.imported.subtasks} subtasks`)
      fetchTodos()
      fetchTags()
    } else {
      const err = await res.json()
      alert(`Import failed: ${err.error}`)
    }
    e.target.value = ''
  }

  // Filtering
  const filteredTodos = todos.filter((todo) => {
    if (search) {
      const q = search.toLowerCase()
      const matchTitle = todo.title.toLowerCase().includes(q)
      const matchTag = todo.tags.some((t) => t.name.toLowerCase().includes(q))
      if (!matchTitle && !matchTag) return false
    }
    if (filterPriority && todo.priority !== filterPriority) return false
    if (filterTagId && !todo.tags.some((t) => t.id === filterTagId)) return false
    return true
  })

  const overdueTodos = filteredTodos.filter((t) => isOverdue(t))
  const activeTodos = filteredTodos.filter((t) => !t.completed && !isOverdue(t))
  const completedTodos = filteredTodos.filter((t) => t.completed)

  function progressInfo(subtasks: Subtask[]) {
    if (subtasks.length === 0) return null
    const done = subtasks.filter((s) => s.completed).length
    const pct = Math.round((done / subtasks.length) * 100)
    return { done, total: subtasks.length, pct }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  const templateCategories = [...new Set(templates.map((t) => t.category).filter(Boolean))]

  function TodoCard({ todo }: { todo: Todo }) {
    const expanded = expandedTodos.has(todo.id)
    const progress = progressInfo(todo.subtasks)
    const overdue = isOverdue(todo)

    return (
      <div className={`p-4 rounded-lg shadow-sm border ${overdue ? 'border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-700' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={todo.completed === 1}
            onChange={() => toggleTodo(todo.id, todo.completed)}
            className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`flex-1 font-medium ${todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-white'}`}>
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
              {todo.is_recurring && (
                <span className="text-purple-600 dark:text-purple-400">🔄 {todo.recurrence_pattern}</span>
              )}
              {todo.reminder_minutes && (
                <span>🔔 {REMINDER_OPTIONS.find((r) => r.value === todo.reminder_minutes)?.label ?? `${todo.reminder_minutes}m`}</span>
              )}
              {todo.tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setFilterTagId(filterTagId === tag.id ? '' : tag.id)}
                  style={{ backgroundColor: tag.color + '33', color: tag.color, borderColor: tag.color }}
                  className="px-2 py-0.5 rounded-full border text-xs font-medium"
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
                      className={`h-full rounded-full transition-all ${progress.pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${progress.pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{progress.done}/{progress.total} ({progress.pct}%)</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => toggleExpand(todo.id)}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs"
              title="Subtasks"
            >
              {expanded ? '▲' : '▼'} {todo.subtasks.length > 0 && `(${todo.subtasks.length})`}
            </button>
            <button onClick={() => openEdit(todo)} className="p-1.5 text-blue-500 hover:text-blue-700 text-sm" title="Edit">✏️</button>
            <button
              onClick={() => { setSaveTemplateTodo(todo); setShowSaveTemplateModal(true) }}
              className="p-1.5 text-gray-400 hover:text-gray-600 text-sm"
              title="Save as template"
            >📋</button>
            <button
              onClick={() => setDeleteConfirm(todo.id)}
              className="p-1.5 text-red-500 hover:text-red-700 text-sm"
              title="Delete"
            >🗑️</button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 ml-8 space-y-2">
            {todo.subtasks.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sub.completed === 1}
                  onChange={() => toggleSubtask(sub.id, sub.completed)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-500 cursor-pointer"
                />
                <span className={`flex-1 text-sm ${sub.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {sub.title}
                </span>
                <button onClick={() => deleteSubtask(sub.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newSubtaskText[todo.id] ?? ''}
                onChange={(e) => setNewSubtaskText((prev) => ({ ...prev, [todo.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && addSubtask(todo.id)}
                placeholder="Add subtask..."
                className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
              <button
                onClick={() => addSubtask(todo.id)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >Add</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  function Section({ title: sTitle, items, color }: { title: string; items: Todo[]; color: string }) {
    if (items.length === 0) return null
    return (
      <div className="mb-6">
        <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${color}`}>{sTitle} ({items.length})</h2>
        <div className="space-y-2">
          {items.map((todo) => <TodoCard key={todo.id} todo={todo} />)}
        </div>
      </div>
    )
  }

  const activeFilters = [filterPriority, filterTagId ? allTags.find((t) => t.id === filterTagId)?.name : '', search].filter(Boolean)

  return (
    <div className="max-w-3xl mx-auto p-4 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📝 Todo App</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/calendar')} className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">📅 Calendar</button>
          <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Toggle dark mode">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">Hi, {username}</span>
          <button onClick={logout} className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">Logout</button>
        </div>
      </div>

      {/* Notification bar */}
      {'Notification' in window && notifPermission !== 'granted' && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-center justify-between">
          <span className="text-sm text-yellow-800 dark:text-yellow-200">Enable notifications to get todo reminders</span>
          <button onClick={requestNotifPermission} className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600">Enable</button>
        </div>
      )}

      {/* Create todo form */}
      <form onSubmit={addTodo} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">Add</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Due Date</label>
            <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Reminder</label>
            <select
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(e.target.value === '' ? '' : parseInt(e.target.value))}
              disabled={!dueDate}
              className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white disabled:opacity-50"
            >
              <option value="">No reminder</option>
              {REMINDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col justify-between">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Recurring</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="w-4 h-4" />
              <span className="text-gray-700 dark:text-gray-300 text-sm">Repeat</span>
            </label>
          </div>
        </div>

        {isRecurring && (
          <div className="text-sm">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Recurrence Pattern</label>
            <select value={recurrencePattern} onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)} className="px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}

        {allTags.length > 0 && (
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Tags</label>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTagIds((prev) => prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id])}
                  style={{ backgroundColor: tag.color + (selectedTagIds.includes(tag.id) ? 'ff' : '22'), color: tag.color, borderColor: tag.color }}
                  className={`px-2 py-0.5 rounded-full border text-xs font-medium transition-all ${selectedTagIds.includes(tag.id) ? 'text-white' : ''}`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search todos and tags..."
          className="flex-1 min-w-48 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
        />
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as Priority | '')}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
        >
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {allTags.length > 0 && (
          <select
            value={filterTagId}
            onChange={(e) => setFilterTagId(e.target.value ? parseInt(e.target.value) : '')}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
          >
            <option value="">All tags</option>
            {allTags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
        <button onClick={() => setShowTagsModal(true)} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">🏷️ Tags</button>
        <button onClick={() => setShowTemplatesModal(true)} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">📋 Templates</button>
        <button onClick={exportTodos} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">⬇️ Export</button>
        <button onClick={() => importInputRef.current?.click()} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">⬆️ Import</button>
        <input ref={importInputRef} type="file" accept=".json" onChange={importTodos} className="hidden" />
      </div>

      {/* Active filters indicator */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">Filtering by: {activeFilters.join(', ')}</span>
          <button onClick={() => { setSearch(''); setFilterPriority(''); setFilterTagId('') }} className="text-sm text-blue-500 hover:text-blue-700">Clear all</button>
        </div>
      )}

      {/* Todo sections */}
      {filteredTodos.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">
          {todos.length === 0 ? 'No todos yet. Add one above!' : 'No todos match your filters.'}
        </p>
      ) : (
        <>
          <Section title="⚠️ Overdue" items={overdueTodos} color="text-red-600 dark:text-red-400" />
          <Section title="📌 Active" items={activeTodos} color="text-gray-700 dark:text-gray-300" />
          <Section title="✅ Completed" items={completedTodos} color="text-green-600 dark:text-green-400" />
        </>
      )}

      {/* Delete confirmation */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Delete Todo?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This will also delete all subtasks. This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm">Cancel</button>
              <button onClick={() => deleteTodo(deleteConfirm)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editTodo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Edit Todo</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Title</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Priority</label>
                  <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as Priority)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Due Date</label>
                  <input type="datetime-local" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Reminder</label>
                  <select
                    value={editReminderMinutes}
                    onChange={(e) => setEditReminderMinutes(e.target.value === '' ? '' : parseInt(e.target.value))}
                    disabled={!editDueDate}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white disabled:opacity-50"
                  >
                    <option value="">No reminder</option>
                    {REMINDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editIsRecurring} onChange={(e) => setEditIsRecurring(e.target.checked)} className="w-4 h-4" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Recurring</span>
                  </label>
                </div>
              </div>
              {editIsRecurring && (
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Pattern</label>
                  <select value={editRecurrencePattern} onChange={(e) => setEditRecurrencePattern(e.target.value as RecurrencePattern)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}
              {allTags.length > 0 && (
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => setEditTagIds((prev) => prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id])}
                        style={{ backgroundColor: tag.color + (editTagIds.includes(tag.id) ? 'ff' : '22'), borderColor: tag.color, color: editTagIds.includes(tag.id) ? 'white' : tag.color }}
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
              <button onClick={() => setEditTodo(null)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm">Cancel</button>
              <button onClick={saveEdit} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Tags management modal */}
      {showTagsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Manage Tags</h3>
            <div className="flex gap-2 mb-4">
              <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createTag()} placeholder="Tag name" className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
              <input type="color" value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} className="w-10 h-10 rounded border border-gray-300 cursor-pointer" />
              <button onClick={createTag} className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600">Add</button>
            </div>
            <div className="space-y-2">
              {allTags.map((tag) => (
                <div key={tag.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                  {editingTag?.id === tag.id ? (
                    <>
                      <input type="text" value={editingTag.name} onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })} className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
                      <input type="color" value={editingTag.color} onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" />
                      <button onClick={saveEditTag} className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">Save</button>
                      <button onClick={() => setEditingTag(null)} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300">Cancel</button>
                    </>
                  ) : (
                    <>
                      <div style={{ backgroundColor: tag.color }} className="w-4 h-4 rounded-full flex-shrink-0" />
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{tag.name}</span>
                      <button onClick={() => setEditingTag(tag)} className="text-blue-500 hover:text-blue-700 text-xs">Edit</button>
                      <button onClick={() => deleteTag(tag.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                    </>
                  )}
                </div>
              ))}
              {allTags.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No tags yet</p>}
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowTagsModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Templates modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Todo Templates</h3>
            {templateCategories.length > 0 && (
              <div className="mb-3">
                <select value={templateCategoryFilter} onChange={(e) => setTemplateCategoryFilter(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                  <option value="">All categories</option>
                  {templateCategories.map((c) => <option key={c} value={c!}>{c}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-2">
              {templates
                .filter((t) => !templateCategoryFilter || t.category === templateCategoryFilter)
                .map((tmpl) => (
                  <div key={tmpl.id} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-800 dark:text-white">{tmpl.name}</div>
                        {tmpl.description && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tmpl.description}</div>}
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${PRIORITY_COLORS[tmpl.priority]}`}>{tmpl.priority}</span>
                          {tmpl.category && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">{tmpl.category}</span>}
                          {tmpl.is_recurring && <span className="text-xs text-purple-600 dark:text-purple-400">🔄 {tmpl.recurrence_pattern}</span>}
                          {tmpl.subtasks_json && <span className="text-xs text-gray-500">{JSON.parse(tmpl.subtasks_json).length} subtasks</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => useTemplate(tmpl.id)} className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">Use</button>
                        <button onClick={() => deleteTemplate(tmpl.id)} className="px-2 py-1 text-red-500 hover:text-red-700 text-xs">✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              {templates.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No templates yet. Save a todo as a template using the 📋 button.</p>}
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowTemplatesModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Save as template modal */}
      {showSaveTemplateModal && saveTemplateTodo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Save as Template</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Template Name *</label>
                <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g. Weekly Review" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Description</label>
                <input type="text" value={templateDesc} onChange={(e) => setTemplateDesc(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Category</label>
                <input type="text" value={templateCategory} onChange={(e) => setTemplateCategory(e.target.value)} placeholder="e.g. Work, Personal" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm" />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => { setShowSaveTemplateModal(false); setSaveTemplateTodo(null) }} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm">Cancel</button>
              <button onClick={saveTemplate} disabled={!templateName.trim()} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
