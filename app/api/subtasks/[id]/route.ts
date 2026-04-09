import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { subtaskDB, todoDB } from '@/lib/db'

async function getSubtaskForUser(id: number, userId: number) {
  const subtask = subtaskDB.findById(id)
  if (!subtask) return null
  const todo = todoDB.findById(subtask.todo_id)
  if (!todo || todo.user_id !== userId) return null
  return subtask
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { id } = await params
  const subtask = await getSubtaskForUser(parseInt(id), session.userId)
  if (!subtask) return NextResponse.json({ error: 'Subtask not found' }, { status: 404 })

  try {
    const body = await request.json()
    const updated = subtaskDB.update(parseInt(id), body)
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update subtask error:', error)
    return NextResponse.json({ error: 'Failed to update subtask' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { id } = await params
  const subtask = await getSubtaskForUser(parseInt(id), session.userId)
  if (!subtask) return NextResponse.json({ error: 'Subtask not found' }, { status: 404 })

  subtaskDB.delete(parseInt(id))
  return NextResponse.json({ success: true })
}
