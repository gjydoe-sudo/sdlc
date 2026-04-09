import { test, expect } from '@playwright/test'
import { setupVirtualAuthenticator, registerUser, loginUser, uniqueUsername } from './helpers'

test.describe('Authentication', () => {
  test('can register a new user and land on home page', async ({ page }) => {
    await setupVirtualAuthenticator(page)
    const username = uniqueUsername()

    await page.goto('/login')
    await page.fill('input[placeholder="Enter username"]', username)
    await page.click('button:has-text("Register")')

    await page.waitForURL('/', { timeout: 15000 })
    await expect(page).toHaveURL('/')
  })

  test('can login with an existing user', async ({ page }) => {
    await setupVirtualAuthenticator(page)
    const username = uniqueUsername()

    await registerUser(page, username)
    await page.goto('/login')
    await page.fill('input[placeholder="Enter username"]', username)
    await page.click('button:has-text("Login")')

    await page.waitForURL('/', { timeout: 15000 })
    await expect(page).toHaveURL('/')
  })

  test('logged-in user sees their username in header', async ({ page }) => {
    await setupVirtualAuthenticator(page)
    const username = uniqueUsername()

    await registerUser(page, username)
    await expect(page.getByText(`Hi, ${username}`)).toBeVisible()
  })

  test('logout redirects to login page', async ({ page }) => {
    await setupVirtualAuthenticator(page)
    await registerUser(page, uniqueUsername())

    await page.click('button:has-text("Logout")')
    await page.waitForURL('/login', { timeout: 10000 })
    await expect(page).toHaveURL('/login')
  })

  test('unauthenticated user is redirected from / to /login', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL('/login', { timeout: 10000 })
    await expect(page).toHaveURL('/login')
  })

  test('authenticated user visiting /login is redirected to /', async ({ page }) => {
    await setupVirtualAuthenticator(page)
    await registerUser(page, uniqueUsername())

    await page.goto('/login')
    await page.waitForURL('/', { timeout: 10000 })
    await expect(page).toHaveURL('/')
  })

  test('shows error for unknown username on login', async ({ page }) => {
    await setupVirtualAuthenticator(page)

    await page.goto('/login')
    await page.fill('input[placeholder="Enter username"]', 'nonexistent-user-xyz')
    await page.click('button:has-text("Login")')

    await expect(page.getByText(/User not found/i)).toBeVisible({ timeout: 5000 })
  })
})
