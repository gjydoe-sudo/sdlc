import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { todoDB, subtaskDB, tagDB, type Priority, type RecurrencePattern } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const todos = todoDB.findByUserId(session.userId)
  const result = todos.map((todo) => ({
    ...todo,
    subtasks: subtaskDB.findByTodoId(todo.id),
    tags: tagDB.findByTodoId(todo.id)
  }))

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, due_date, priority, is_recurring, recurrence_pattern, reminder_minutes } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const validPriorities: Priority[] = ['high', 'medium', 'low']
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
    }

    const validPatterns: RecurrencePattern[] = ['daily', 'weekly', 'monthly', 'yearly']
    if (recurrence_pattern && !validPatterns.includes(recurrence_pattern)) {
      return NextResponse.json({ error: 'Invalid recurrence pattern' }, { status: 400 })
    }

    if (is_recurring && !due_date) {
      return NextResponse.json({ error: 'Recurring todos require a due date' }, { status: 400 })
    }

    const todo = todoDB.create({
      user_id: session.userId,
      title: title.trim(),
      due_date: due_date ?? null,
      priority: priority ?? 'medium',
      is_recurring: is_recurring ? 1 : 0,
      recurrence_pattern: recurrence_pattern ?? null,
      reminder_minutes: reminder_minutes ?? null
    })

    return NextResponse.json({
      ...todo,
      subtasks: [],
      tags: []
    }, { status: 201 })
  } catch (error) {
    console.error('Create todo error:', error)
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 })
  }
}
