import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { todoDB, tagDB } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { id } = await params
  const todo = todoDB.findById(parseInt(id))
  if (!todo || todo.user_id !== session.userId) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
  }

  try {
    const { tag_id } = await request.json()
    if (!tag_id) return NextResponse.json({ error: 'tag_id is required' }, { status: 400 })

    const tag = tagDB.findById(tag_id)
    if (!tag || tag.user_id !== session.userId) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    tagDB.addToTodo(parseInt(id), tag_id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Add tag to todo error:', error)
    return NextResponse.json({ error: 'Failed to add tag' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { id } = await params
  const todo = todoDB.findById(parseInt(id))
  if (!todo || todo.user_id !== session.userId) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
  }

  try {
    const { tag_id } = await request.json()
    if (!tag_id) return NextResponse.json({ error: 'tag_id is required' }, { status: 400 })

    tagDB.removeFromTodo(parseInt(id), tag_id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove tag from todo error:', error)
    return NextResponse.json({ error: 'Failed to remove tag' }, { status: 500 })
  }
}
