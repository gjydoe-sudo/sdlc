import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { todoDB, subtaskDB, tagDB, type Priority } from '@/lib/db'
import { calcNextDueDate } from '@/lib/utils/recurrence'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { id } = await params
  const todo = todoDB.findById(parseInt(id))

  if (!todo || todo.user_id !== session.userId) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
  }

  return NextResponse.json({
    ...todo,
    subtasks: subtaskDB.findByTodoId(todo.id),
    tags: tagDB.findByTodoId(todo.id)
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { id } = await params
  const todoId = parseInt(id)
  const todo = todoDB.findById(todoId)

  if (!todo || todo.user_id !== session.userId) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const { tag_ids, ...updateData } = body

    const validPriorities: Priority[] = ['high', 'medium', 'low']
    if (updateData.priority && !validPriorities.includes(updateData.priority)) {
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
    }

    // When completing a recurring todo, create next instance
    if (updateData.completed === 1 && todo.completed === 0 && todo.is_recurring && todo.due_date && todo.recurrence_pattern) {
      const nextDue = calcNextDueDate(todo.due_date, todo.recurrence_pattern)
      const existingSubtasks = subtaskDB.findByTodoId(todoId)
      const existingTags = tagDB.findByTodoId(todoId)

      const newTodo = todoDB.create({
        user_id: session.userId,
        title: todo.title,
        due_date: nextDue,
        priority: todo.priority,
        is_recurring: 1,
        recurrence_pattern: todo.recurrence_pattern,
        reminder_minutes: todo.reminder_minutes
      })

      for (const sub of existingSubtasks) {
        subtaskDB.create({ todo_id: newTodo.id, title: sub.title })
      }

      if (existingTags.length > 0) {
        tagDB.setTodoTags(newTodo.id, existingTags.map((t) => t.id))
      }
    }

    // Update tag assignments if provided
    if (Array.isArray(tag_ids)) {
      tagDB.setTodoTags(todoId, tag_ids)
    }

    const updated = todoDB.update(todoId, updateData)
    return NextResponse.json({
      ...updated,
      subtasks: subtaskDB.findByTodoId(todoId),
      tags: tagDB.findByTodoId(todoId)
    })
  } catch (error) {
    console.error('Update todo error:', error)
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { id } = await params
  const todo = todoDB.findById(parseInt(id))

  if (!todo || todo.user_id !== session.userId) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
  }

  todoDB.delete(parseInt(id))
  return NextResponse.json({ success: true })
}

