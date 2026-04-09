import { NextRequest, NextResponse } from 'next/server'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
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

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: () => true,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: false
    })

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
    }

    const { credential: registrationCredential } = verification.registrationInfo

    const credentialId = Buffer.from(registrationCredential.id).toString('base64url')
    const credentialPublicKey = Buffer.from(registrationCredential.publicKey).toString('base64url')

    authenticatorDB.create({
      user_id: user.id,
      credential_id: credentialId,
      credential_public_key: credentialPublicKey,
      counter: registrationCredential.counter ?? 0,
      transports: credential.response.transports ? JSON.stringify(credential.response.transports) : undefined
    })

    await createSession(user.id, user.username)

    return NextResponse.json({ verified: true })
  } catch (error) {
    console.error('Register verify error:', error)
    return NextResponse.json({ error: 'Registration verification failed' }, { status: 500 })
  }
}
