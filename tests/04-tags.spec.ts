import { test, expect } from '@playwright/test'
import { setupVirtualAuthenticator, registerUser, uniqueUsername } from './helpers'

test.describe('Tags', () => {
  test.beforeEach(async ({ page }) => {
    await setupVirtualAuthenticator(page)
    await registerUser(page, uniqueUsername())
  })

  test('can create a new tag', async ({ page }) => {
    await page.click('button[aria-label="Manage tags"]')
    await page.fill('input[placeholder="Tag name"]', 'Work')
    await page.click('button:has-text("Add Tag")')

    await expect(page.getByText('Work')).toBeVisible()
  })

  test('tag assigned to todo shows as badge', async ({ page }) => {
    // Create a tag first
    await page.click('button[aria-label="Manage tags"]')
    await page.fill('input[placeholder="Tag name"]', 'Personal')
    await page.click('button:has-text("Add Tag")')
    await page.click('button[aria-label="Close tags modal"]')

    // Create a todo with the tag selected
    await page.fill('#new-todo-title', 'Tagged todo')
    // Tag selector appears after tags exist — click to select
    await page.click('button[aria-pressed="false"]:has-text("Personal")')
    await page.click('button[type="submit"]:has-text("Add")')

    await expect(page.getByText('Tagged todo')).toBeVisible()
    // The tag badge should appear on the todo card
    const todoCard = page.locator('div').filter({ hasText: 'Tagged todo' }).first()
    await expect(todoCard.locator('button[aria-label*="Filter by tag: Personal"]')).toBeVisible()
  })

  test('clicking tag badge filters by that tag', async ({ page }) => {
    // Create tag and two todos
    await page.click('button[aria-label="Manage tags"]')
    await page.fill('input[placeholder="Tag name"]', 'Urgent')
    await page.click('button:has-text("Add Tag")')
    await page.click('button[aria-label="Close tags modal"]')

    // Todo with tag
    await page.fill('#new-todo-title', 'Urgent todo')
    await page.click('button[aria-pressed="false"]:has-text("Urgent")')
    await page.click('button[type="submit"]:has-text("Add")')

    // Todo without tag
    await page.fill('#new-todo-title', 'Regular todo')
    await page.click('button[type="submit"]:has-text("Add")')

    await expect(page.getByText('Urgent todo')).toBeVisible()
    await expect(page.getByText('Regular todo')).toBeVisible()

    // Click the tag badge to filter
    await page.click('button[aria-label="Filter by tag: Urgent"]')

    await expect(page.getByText('Urgent todo')).toBeVisible()
    await expect(page.getByText('Regular todo')).not.toBeVisible()
  })

  test('can delete a tag', async ({ page }) => {
    await page.click('button[aria-label="Manage tags"]')
    await page.fill('input[placeholder="Tag name"]', 'ToDelete')
    await page.click('button:has-text("Add Tag")')
    await expect(page.getByText('ToDelete')).toBeVisible()

    await page.click('button[aria-label*="Delete tag: ToDelete"]')

    await expect(page.getByText('ToDelete')).not.toBeVisible()
  })
})
