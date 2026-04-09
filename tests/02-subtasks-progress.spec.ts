import { test, expect } from '@playwright/test'
import { setupVirtualAuthenticator, registerUser, uniqueUsername } from './helpers'

test.describe('Subtasks and Progress', () => {
  test.beforeEach(async ({ page }) => {
    await setupVirtualAuthenticator(page)
    await registerUser(page, uniqueUsername())

    // Create a parent todo
    await page.fill('#new-todo-title', 'Parent todo')
    await page.click('button[type="submit"]:has-text("Add")')
    await expect(page.getByText('Parent todo')).toBeVisible()
  })

  test('can expand a todo and add subtasks', async ({ page }) => {
    await page.click('button[aria-label="Expand subtasks"]')
    await page.fill('input[aria-label="New subtask title"]', 'First subtask')
    await page.click('button:has-text("Add"):not([type="submit"])')

    await expect(page.getByText('First subtask')).toBeVisible()
  })

  test('progress bar appears after adding subtasks', async ({ page }) => {
    await page.click('button[aria-label="Expand subtasks"]')
    await page.fill('input[aria-label="New subtask title"]', 'Subtask A')
    await page.click('button:has-text("Add"):not([type="submit"])')
    await page.fill('input[aria-label="New subtask title"]', 'Subtask B')
    await page.click('button:has-text("Add"):not([type="submit"])')

    // Progress bar text should show 0/2
    await expect(page.getByText('0/2')).toBeVisible()
  })

  test('can toggle subtask completion and progress updates', async ({ page }) => {
    await page.click('button[aria-label="Expand subtasks"]')
    await page.fill('input[aria-label="New subtask title"]', 'Checkable subtask')
    await page.click('button:has-text("Add"):not([type="submit"])')

    // Expand again after page refresh
    await page.click('button[aria-label*="subtasks"]')
    await page.click('input[aria-label*="Checkable subtask"]')

    // Progress should show 1/1 (100%)
    await expect(page.getByText('1/1')).toBeVisible()
  })

  test('can delete a subtask', async ({ page }) => {
    await page.click('button[aria-label="Expand subtasks"]')
    await page.fill('input[aria-label="New subtask title"]', 'Delete me subtask')
    await page.click('button:has-text("Add"):not([type="submit"])')
    await expect(page.getByText('Delete me subtask')).toBeVisible()

    await page.click('button[aria-label*="Delete subtask"]')

    await expect(page.getByText('Delete me subtask')).not.toBeVisible()
  })
})
