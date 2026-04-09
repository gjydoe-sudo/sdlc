import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'
const COOKIE_NAME = 'session'
const EXPIRY_DAYS = 7

export interface Session {
  userId: number
  username: string
}

export async function createSession(userId: number, username: string): Promise<string> {
  const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: `${EXPIRY_DAYS}d` })

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: EXPIRY_DAYS * 24 * 60 * 60,
    path: '/'
  })

  return token
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Session
    return { userId: decoded.userId, username: decoded.username }
  } catch {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
