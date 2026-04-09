import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { isoBase64URL } from '@simplewebauthn/server/helpers'
import { userDB, authenticatorDB } from '@/lib/db'
import { createSession } from '@/lib/auth'

const RP_ID = process.env.RP_ID || 'localhost'
const ORIGIN = process.env.ORIGIN || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const { username, credential } = await request.json()

    if (!username || !credential) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = userDB.findByUsername(username.trim())
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const authenticators = authenticatorDB.findByUserId(user.id)
    const authenticator = authenticators.find(
      (auth) => auth.credential_id === credential.id
    )

    if (!authenticator) {
      return NextResponse.json({ error: 'Authenticator not found' }, { status: 400 })
    }

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: () => true,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: false,
      credential: {
        id: authenticator.credential_id,
        publicKey: isoBase64URL.toBuffer(authenticator.credential_public_key),
        counter: authenticator.counter ?? 0,
        transports: authenticator.transports ? JSON.parse(authenticator.transports) : undefined
      }
    })

    if (!verification.verified) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 400 })
    }

    authenticatorDB.updateCounter(
      authenticator.id,
      verification.authenticationInfo.newCounter ?? 0
    )

    await createSession(user.id, user.username)

    return NextResponse.json({ verified: true })
  } catch (error) {
    console.error('Login verify error:', error)
    return NextResponse.json({ error: 'Authentication verification failed' }, { status: 500 })
  }
}
