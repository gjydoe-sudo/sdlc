import { type Page, type CDPSession } from '@playwright/test'

/**
 * Sets up a virtual WebAuthn authenticator via CDP for passkey-free testing.
 * Returns the authenticator ID.
 */
export async function setupVirtualAuthenticator(page: Page): Promise<string> {
  const client: CDPSession = await page.context().newCDPSession(page)
  await client.send('WebAuthn.enable', { enableUI: false })
  const { authenticatorId } = await client.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true
    }
  })
  return authenticatorId
}

/** Returns a unique username for test isolation. */
export function uniqueUsername(): string {
  return `test-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

/**
 * Registers a new user via the login page.
 * Navigates to /login, fills the username, clicks Register, awaits redirect to /.
 */
export async function registerUser(page: Page, username: string): Promise<void> {
  await page.goto('/login')
  await page.fill('input[placeholder="Enter username"]', username)
  await page.click('button:has-text("Register")')
  await page.waitForURL('/', { timeout: 15000 })
}

/**
 * Logs in an existing user via the login page.
 * Navigates to /login, fills the username, clicks Login, awaits redirect to /.
 */
export async function loginUser(page: Page, username: string): Promise<void> {
  await page.goto('/login')
  await page.fill('input[placeholder="Enter username"]', username)
  await page.click('button:has-text("Login")')
  await page.waitForURL('/', { timeout: 15000 })
}
