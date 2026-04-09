import { NextRequest, NextResponse } from 'next/server'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { userDB, authenticatorDB } from '@/lib/db'

const RP_ID = process.env.RP_ID || 'localhost'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username || typeof username !== 'string' || !username.trim()) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const user = userDB.findByUsername(username.trim())
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const authenticators = authenticatorDB.findByUserId(user.id)
    if (authenticators.length === 0) {
      userDB.delete(user.id)
      return NextResponse.json({ error: 'No passkeys registered for this user. Account has been removed — please register again.' }, { status: 400 })
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: authenticators.map((auth) => ({
        id: auth.credential_id,
        transports: auth.transports ? JSON.parse(auth.transports) : undefined
      })),
      userVerification: 'preferred'
    })

    return NextResponse.json(options)
  } catch (error) {
    console.error('Login options error:', error)
    return NextResponse.json({ error: 'Failed to generate login options' }, { status: 500 })
  }
}
