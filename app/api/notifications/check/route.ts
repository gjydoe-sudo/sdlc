import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { todoDB } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const dueTodos = todoDB.findDueForNotification()
    // Filter to only this user's todos
    const userTodos = dueTodos.filter((t) => t.user_id === session.userId)

    // Mark them as notified
    const now = new Date().toISOString()
    for (const todo of userTodos) {
      todoDB.update(todo.id, { last_notification_sent: now })
    }

    return NextResponse.json(userTodos.map((t) => ({ id: t.id, title: t.title, due_date: t.due_date })))
  } catch (error) {
    console.error('Notifications check error:', error)
    return NextResponse.json({ error: 'Failed to check notifications' }, { status: 500 })
  }
}
