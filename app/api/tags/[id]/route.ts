import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { tagDB } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { id } = await params
  const tag = tagDB.findById(parseInt(id))
  if (!tag || tag.user_id !== session.userId) {
    return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const updated = tagDB.update(parseInt(id), body)
    return NextResponse.json(updated)
  } catch (error: unknown) {
    if (error instanceof Error && error.message?.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Tag name already exists' }, { status: 409 })
    }
    console.error('Update tag error:', error)
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { id } = await params
  const tag = tagDB.findById(parseInt(id))
  if (!tag || tag.user_id !== session.userId) {
    return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
  }

  tagDB.delete(parseInt(id))
  return NextResponse.json({ success: true })
}
