import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { todoDB, subtaskDB, tagDB } from '@/lib/db'

interface ImportSubtask { title: string; completed?: number }
interface ImportTodo {
  title: string
  completed?: number
  due_date?: string | null
  priority?: string
  is_recurring?: number
  recurrence_pattern?: string | null
  reminder_minutes?: number | null
  subtasks?: ImportSubtask[]
  tags?: string[]
}
interface ImportTag { name: string; color?: string }
interface ImportData {
  version: number
  todos: ImportTodo[]
  tags?: ImportTag[]
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const body: ImportData = await request.json()

    if (!body || body.version === undefined || !Array.isArray(body.todos)) {
      return NextResponse.json({ error: 'Invalid import format' }, { status: 400 })
    }

    // Build tag name → id map, creating missing tags
    const tagNameToId = new Map<string, number>()
    const existingTags = tagDB.findByUserId(session.userId)
    for (const t of existingTags) tagNameToId.set(t.name.toLowerCase(), t.id)

    if (Array.isArray(body.tags)) {
      for (const t of body.tags) {
        if (!t.name) continue
        const key = t.name.toLowerCase()
        if (!tagNameToId.has(key)) {
          const created = tagDB.create({ user_id: session.userId, name: t.name, color: t.color })
          tagNameToId.set(key, created.id)
        }
      }
    }

    let todoCount = 0
    let subtaskCount = 0

    for (const item of body.todos) {
      if (!item.title) continue

      const todo = todoDB.create({
        user_id: session.userId,
        title: item.title,
        due_date: item.due_date ?? null,
        priority: (item.priority as 'high' | 'medium' | 'low') ?? 'medium',
        is_recurring: item.is_recurring ?? 0,
        recurrence_pattern: (item.recurrence_pattern as 'daily' | 'weekly' | 'monthly' | 'yearly') ?? null,
        reminder_minutes: item.reminder_minutes ?? null
      })

      if (item.completed) {
        todoDB.update(todo.id, { completed: 1 })
      }

      if (Array.isArray(item.subtasks)) {
        for (const sub of item.subtasks) {
          if (!sub.title) continue
          const s = subtaskDB.create({ todo_id: todo.id, title: sub.title })
          if (sub.completed) subtaskDB.update(s.id, { completed: 1 })
          subtaskCount++
        }
      }

      if (Array.isArray(item.tags) && item.tags.length > 0) {
        const tagIds = item.tags
          .map((name) => tagNameToId.get(name.toLowerCase()))
          .filter((id): id is number => id !== undefined)
        if (tagIds.length > 0) tagDB.setTodoTags(todo.id, tagIds)
      }

      todoCount++
    }

    return NextResponse.json({
      success: true,
      imported: { todos: todoCount, subtasks: subtaskCount }
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Failed to import todos. Check file format.' }, { status: 400 })
  }
}
