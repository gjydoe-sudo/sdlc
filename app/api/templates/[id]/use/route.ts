import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { templateDB, todoDB, subtaskDB, type Priority, type RecurrencePattern } from '@/lib/db'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { id } = await params
  const template = templateDB.findById(parseInt(id))
  if (!template || template.user_id !== session.userId) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  try {
    const todo = todoDB.create({
      user_id: session.userId,
      title: template.title_template,
      priority: template.priority as Priority,
      is_recurring: template.is_recurring,
      recurrence_pattern: template.recurrence_pattern as RecurrencePattern | null,
      reminder_minutes: template.reminder_minutes
    })

    if (template.subtasks_json) {
      const subtaskTitles: string[] = JSON.parse(template.subtasks_json)
      for (const title of subtaskTitles) {
        subtaskDB.create({ todo_id: todo.id, title })
      }
    }

    return NextResponse.json({
      ...todo,
      subtasks: template.subtasks_json ? JSON.parse(template.subtasks_json).map((title: string, i: number) => ({
        id: -(i + 1), todo_id: todo.id, title, completed: 0, position: i
      })) : [],
      tags: []
    }, { status: 201 })
  } catch (error) {
    console.error('Use template error:', error)
    return NextResponse.json({ error: 'Failed to create todo from template' }, { status: 500 })
  }
}
