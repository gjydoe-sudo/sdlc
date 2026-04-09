import { NextRequest, NextResponse } from 'next/server'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { userDB, authenticatorDB } from '@/lib/db'

const RP_NAME = 'Todo App'
const RP_ID = process.env.RP_ID || 'localhost'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username || typeof username !== 'string' || !username.trim()) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const existingUser = userDB.findByUsername(username.trim())
    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const user = userDB.create(username.trim())
    const existingAuthenticators = authenticatorDB.findByUserId(user.id)

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userName: user.username,
      attestationType: 'none',
      excludeCredentials: existingAuthenticators.map((auth) => ({
        id: auth.credential_id,
        transports: auth.transports ? JSON.parse(auth.transports) : undefined
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred'
      }
    })

    return NextResponse.json(options)
  } catch (error) {
    console.error('Register options error:', error)
    return NextResponse.json({ error: 'Failed to generate registration options' }, { status: 500 })
  }
}
