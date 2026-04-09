'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { TodoCard, type TodoCardCallbacks } from '@/app/components/TodoCard'
import { EditTodoModal } from '@/app/components/EditTodoModal'
import { TagsModal } from '@/app/components/TagsModal'
import { TemplatesModal } from '@/app/components/TemplatesModal'
import { SaveTemplateModal } from '@/app/components/SaveTemplateModal'
import {
  type Todo, type Tag, type Template,
  type Priority, type RecurrencePattern,
  REMINDER_OPTIONS, isOverdue
} from '@/app/components/types'

export default function HomePage() {
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  // Create form state
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('daily')
  const [reminderMinutes, setReminderMinutes] = useState<number | ''>('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])

  // Search + filter state
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [filterPriority, setFilterPriority] = useState<Priority | ''>('')
  const [filterTagId, setFilterTagId] = useState<number | ''>('')

  // Subtask expansion + input
  const [expandedTodos, setExpandedTodos] = useState<Set<number>>(new Set())
  const [newSubtaskText, setNewSubtaskText] = useState<Record<number, string>>({})

  // Edit modal
  const [editTodo, setEditTodo] = useState<Todo | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editPriority, setEditPriority] = useState<Priority>('medium')
  const [editIsRecurring, setEditIsRecurring] = useState(false)
  const [editRecurrencePattern, setEditRecurrencePattern] = useState<RecurrencePattern>('daily')
  const [editReminderMinutes, setEditReminderMinutes] = useState<number | ''>('')
  const [editTagIds, setEditTagIds] = useState<number[]>([])

  // Modal visibility
  const [showTagsModal, setShowTagsModal] = useState(false)
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false)
  const [saveTemplateTodo, setSaveTemplateTodo] = useState<Todo | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [templateDesc, setTemplateDesc] = useState('')
  const [templateCategory, setTemplateCategory] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  // Notifications (custom hook)
  const { permission: notifPermission, requestPermission: requestNotifPermission } = useNotifications()

  // Import file input ref
  const importInputRef = useRef<HTMLInputElement>(null)

  // Dark mode persistence
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

  // Auth check + initial data load
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

  // ── Todo CRUD ──────────────────────────────────────────────────────────────

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
      setReminderMinutes('')
      setSelectedTagIds([])
      fetchTodos()
    }
  }

  async function toggleTodo(id: number, completed: number) {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: completed ? 0 : 1 } : t))
    await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: completed ? 0 : 1 })
    })
    fetchTodos()
  }

  async function deleteTodo(id: number) {
    setDeleteConfirm(null)
    setTodos((prev) => prev.filter((t) => t.id !== id))
    await fetch(`/api/todos/${id}`, { method: 'DELETE' })
  }

  // ── Edit ───────────────────────────────────────────────────────────────────

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
    await fetch(`/api/todos/${editTodo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle.trim(),
        priority: editPriority,
        is_recurring: editIsRecurring ? 1 : 0,
        recurrence_pattern: editIsRecurring ? editRecurrencePattern : null,
        reminder_minutes: editReminderMinutes !== '' ? editReminderMinutes : null,
        due_date: editDueDate ? new Date(editDueDate).toISOString() : null,
        tag_ids: editTagIds
      })
    })
    setEditTodo(null)
    fetchTodos()
  }

  // ── Subtasks ───────────────────────────────────────────────────────────────

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

  // ── Tags ───────────────────────────────────────────────────────────────────

  async function createTag(name: string, color: string) {
    await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color })
    })
    fetchTags()
  }

  async function updateTag(tag: Tag) {
    await fetch(`/api/tags/${tag.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tag.name, color: tag.color })
    })
    fetchTags()
    fetchTodos()
  }

  async function deleteTag(id: number) {
    await fetch(`/api/tags/${id}`, { method: 'DELETE' })
    fetchTags()
    fetchTodos()
  }

  // ── Templates ──────────────────────────────────────────────────────────────

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
    if (res.ok) { setShowTemplatesModal(false); fetchTodos() }
  }

  async function deleteTemplate(id: number) {
    await fetch(`/api/templates/${id}`, { method: 'DELETE' })
    fetchTemplates()
  }

  // ── Export / Import ────────────────────────────────────────────────────────

  async function exportTodos() {
    const res = await fetch('/api/todos/export')
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `todos-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

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

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  // ── Filtering (debounced search) ───────────────────────────────────────────

  const filteredTodos = todos.filter((todo) => {
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
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

  const activeFilters = [
    filterPriority,
    filterTagId ? allTags.find((t) => t.id === filterTagId)?.name : '',
    debouncedSearch
  ].filter(Boolean)

  // ── TodoCard callbacks ─────────────────────────────────────────────────────

  const cardCallbacks: TodoCardCallbacks = {
    onToggle: toggleTodo,
    onDelete: (id) => setDeleteConfirm(id),
    onEdit: openEdit,
    onSaveTemplate: (todo) => { setSaveTemplateTodo(todo); setShowSaveTemplateModal(true) },
    onToggleExpand: toggleExpand,
    onSubtaskTextChange: (todoId, text) =>
      setNewSubtaskText((prev) => ({ ...prev, [todoId]: text })),
    onAddSubtask: addSubtask,
    onToggleSubtask: toggleSubtask,
    onDeleteSubtask: deleteSubtask,
    onFilterByTag: setFilterTagId
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  function Section({ title: sTitle, items, color }: { title: string; items: Todo[]; color: string }) {
    if (items.length === 0) return null
    return (
      <section aria-label={sTitle} className="mb-6">
        <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${color}`}>
          {sTitle} ({items.length})
        </h2>
        <div className="space-y-2">
          {items.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              expanded={expandedTodos.has(todo.id)}
              newSubtaskText={newSubtaskText[todo.id] ?? ''}
              filterTagId={filterTagId}
              callbacks={cardCallbacks}
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 pb-12">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📝 Todo App</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/calendar')}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            📅 Calendar
          </button>
          <button
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">Hi, {username}</span>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Notification bar */}
      {'Notification' in (typeof window !== 'undefined' ? window : {}) && notifPermission !== 'granted' && (
        <div
          role="status"
          className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-center justify-between"
        >
          <span className="text-sm text-yellow-800 dark:text-yellow-200">
            Enable notifications to get todo reminders
          </span>
          <button
            onClick={requestNotifPermission}
            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
          >
            Enable
          </button>
        </div>
      )}

      {/* Create todo form */}
      <form onSubmit={addTodo} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
        <div className="flex gap-2">
          <label htmlFor="new-todo-title" className="sr-only">New todo title</label>
          <input
            id="new-todo-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            Add
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>
            <label htmlFor="new-priority" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Priority</label>
            <select
              id="new-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label htmlFor="new-due" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Due Date</label>
            <input
              id="new-due"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="new-reminder" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Reminder</label>
            <select
              id="new-reminder"
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(e.target.value === '' ? '' : parseInt(e.target.value))}
              disabled={!dueDate}
              className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white disabled:opacity-50"
            >
              <option value="">No reminder</option>
              {REMINDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col justify-between">
            <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Recurring</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-gray-700 dark:text-gray-300 text-sm">Repeat</span>
            </label>
          </div>
        </div>

        {isRecurring && (
          <div className="text-sm">
            <label htmlFor="new-pattern" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Recurrence Pattern</label>
            <select
              id="new-pattern"
              value={recurrencePattern}
              onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)}
              className="px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}

        {allTags.length > 0 && (
          <fieldset>
            <legend className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tags</legend>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() =>
                    setSelectedTagIds((prev) =>
                      prev.includes(tag.id)
                        ? prev.filter((id) => id !== tag.id)
                        : [...prev, tag.id]
                    )
                  }
                  aria-pressed={selectedTagIds.includes(tag.id)}
                  style={{
                    backgroundColor: tag.color + (selectedTagIds.includes(tag.id) ? 'ff' : '22'),
                    color: selectedTagIds.includes(tag.id) ? 'white' : tag.color,
                    borderColor: tag.color
                  }}
                  className="px-2 py-0.5 rounded-full border text-xs font-medium"
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </fieldset>
        )}
      </form>

      {/* Toolbar */}
      <div role="search" className="flex flex-wrap gap-2 mb-4">
        <label htmlFor="search-todos" className="sr-only">Search todos and tags</label>
        <input
          id="search-todos"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search todos and tags..."
          className="flex-1 min-w-48 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
        />
        <label htmlFor="filter-priority" className="sr-only">Filter by priority</label>
        <select
          id="filter-priority"
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
          <>
            <label htmlFor="filter-tag" className="sr-only">Filter by tag</label>
            <select
              id="filter-tag"
              value={filterTagId}
              onChange={(e) => setFilterTagId(e.target.value ? parseInt(e.target.value) : '')}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
            >
              <option value="">All tags</option>
              {allTags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </>
        )}
        <button
          onClick={() => setShowTagsModal(true)}
          aria-label="Manage tags"
          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          🏷️ Tags
        </button>
        <button
          onClick={() => setShowTemplatesModal(true)}
          aria-label="Use a template"
          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          📋 Templates
        </button>
        <button
          onClick={exportTodos}
          aria-label="Export todos as JSON"
          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          ⬇️ Export
        </button>
        <button
          onClick={() => importInputRef.current?.click()}
          aria-label="Import todos from JSON"
          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          ⬆️ Import
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept=".json"
          onChange={importTodos}
          aria-label="Select JSON file to import"
          className="hidden"
        />
      </div>

      {/* Active filter indicator */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 mb-4" role="status" aria-live="polite">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Filtering by: {activeFilters.join(', ')}
          </span>
          <button
            onClick={() => { setSearch(''); setFilterPriority(''); setFilterTagId('') }}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Todo sections */}
      <main>
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
      </main>

      {/* Delete confirmation */}
      {deleteConfirm !== null && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 id="delete-confirm-title" className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Delete Todo?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              This will also delete all subtasks. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTodo(deleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editTodo && (
        <EditTodoModal
          title={editTitle}
          dueDate={editDueDate}
          priority={editPriority}
          isRecurring={editIsRecurring}
          recurrencePattern={editRecurrencePattern}
          reminderMinutes={editReminderMinutes}
          tagIds={editTagIds}
          allTags={allTags}
          onTitleChange={setEditTitle}
          onDueDateChange={setEditDueDate}
          onPriorityChange={setEditPriority}
          onIsRecurringChange={setEditIsRecurring}
          onRecurrencePatternChange={setEditRecurrencePattern}
          onReminderMinutesChange={setEditReminderMinutes}
          onTagIdsChange={setEditTagIds}
          onSave={saveEdit}
          onCancel={() => setEditTodo(null)}
        />
      )}

      {/* Tags modal */}
      {showTagsModal && (
        <TagsModal
          tags={allTags}
          onCreate={createTag}
          onUpdate={updateTag}
          onDelete={deleteTag}
          onClose={() => setShowTagsModal(false)}
        />
      )}

      {/* Templates modal */}
      {showTemplatesModal && (
        <TemplatesModal
          templates={templates}
          onUse={useTemplate}
          onDelete={deleteTemplate}
          onClose={() => setShowTemplatesModal(false)}
        />
      )}

      {/* Save as template modal */}
      {showSaveTemplateModal && saveTemplateTodo && (
        <SaveTemplateModal
          todo={saveTemplateTodo}
          name={templateName}
          description={templateDesc}
          category={templateCategory}
          onNameChange={setTemplateName}
          onDescriptionChange={setTemplateDesc}
          onCategoryChange={setTemplateCategory}
          onSave={saveTemplate}
          onCancel={() => { setShowSaveTemplateModal(false); setSaveTemplateTodo(null) }}
        />
      )}
    </div>
  )
}
