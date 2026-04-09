import { test, expect } from '@playwright/test'
import { setupVirtualAuthenticator, registerUser, uniqueUsername } from './helpers'

test.describe('Calendar View', () => {
  test.beforeEach(async ({ page }) => {
    await setupVirtualAuthenticator(page)
    await registerUser(page, uniqueUsername())
  })

  test('can navigate to calendar from home page', async ({ page }) => {
    await page.click('button:has-text("Calendar")')
    await page.waitForURL('/calendar**', { timeout: 10000 })
    await expect(page).toHaveURL(/\/calendar/)
  })

  test('calendar shows current month and year', async ({ page }) => {
    await page.goto('/calendar')

    const now = new Date()
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']

    await expect(page.getByText(`${monthNames[now.getMonth()]} ${now.getFullYear()}`)).toBeVisible()
  })

  test('can navigate to next month', async ({ page }) => {
    await page.goto('/calendar')

    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']

    await page.click('button:has-text("›")')

    await expect(page.getByText(`${monthNames[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`)).toBeVisible()
  })

  test('can navigate to previous month', async ({ page }) => {
    await page.goto('/calendar')

    const now = new Date()
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']

    await page.click('button:has-text("‹")')

    await expect(page.getByText(`${monthNames[prevMonth.getMonth()]} ${prevMonth.getFullYear()}`)).toBeVisible()
  })

  test('Today button returns to current month after navigating away', async ({ page }) => {
    await page.goto('/calendar')

    const now = new Date()
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']

    await page.click('button:has-text("›")')
    await page.click('button:has-text("Today")')

    await expect(page.getByText(`${monthNames[now.getMonth()]} ${now.getFullYear()}`)).toBeVisible()
  })

  test('calendar shows day headers (Sun through Sat)', async ({ page }) => {
    await page.goto('/calendar')

    for (const day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
      await expect(page.getByText(day)).toBeVisible()
    }
  })

  test('back button returns to home page', async ({ page }) => {
    await page.goto('/calendar')
    await page.click('text=← Back')
    await page.waitForURL('/', { timeout: 10000 })
    await expect(page).toHaveURL('/')
  })

  test('todo with due date appears on calendar', async ({ page }) => {
    const now = new Date()
    const todayISO = now.toISOString().slice(0, 16)

    await page.goto('/')
    await page.fill('#new-todo-title', 'Calendar visible todo')
    await page.fill('#new-due', todayISO)
    await page.click('button[type="submit"]:has-text("Add")')
    await expect(page.getByText('Calendar visible todo')).toBeVisible()

    await page.goto('/calendar')
    await expect(page.getByText('Calendar visible todo').first()).toBeVisible({ timeout: 8000 })
  })
})
