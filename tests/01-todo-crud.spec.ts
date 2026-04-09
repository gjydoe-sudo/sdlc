import { test, expect } from '@playwright/test'
import { setupVirtualAuthenticator, registerUser, uniqueUsername } from './helpers'

test.describe('Todo CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await setupVirtualAuthenticator(page)
    await registerUser(page, uniqueUsername())
  })

  test('can create a todo with title only', async ({ page }) => {
    await page.fill('#new-todo-title', 'My first todo')
    await page.click('button[type="submit"]:has-text("Add")')

    await expect(page.getByText('My first todo')).toBeVisible()
  })

  test('can create a todo with priority and recurring', async ({ page }) => {
    await page.fill('#new-todo-title', 'Recurring high-priority')
    await page.selectOption('#new-priority', 'high')
    await page.check('input[type="checkbox"][aria-label*="Repeat"], label:has-text("Repeat") input')
    await page.click('button[type="submit"]:has-text("Add")')

    await expect(page.getByText('Recurring high-priority')).toBeVisible()
  })

  test('new todos appear in Active section', async ({ page }) => {
    await page.fill('#new-todo-title', 'Active todo test')
    await page.click('button[type="submit"]:has-text("Add")')

    const activeSection = page.locator('section[aria-label*="Active"]')
    await expect(activeSection).toBeVisible()
    await expect(activeSection.getByText('Active todo test')).toBeVisible()
  })

  test('can edit a todo title', async ({ page }) => {
    await page.fill('#new-todo-title', 'Original title')
    await page.click('button[type="submit"]:has-text("Add")')
    await expect(page.getByText('Original title')).toBeVisible()

    await page.click(`button[aria-label*="Edit todo"]`)
    await page.fill('input#edit-title', 'Updated title')
    await page.click('button:has-text("Save")')

    await expect(page.getByText('Updated title')).toBeVisible()
    await expect(page.getByText('Original title')).not.toBeVisible()
  })

  test('can toggle completion (moves to Completed section)', async ({ page }) => {
    await page.fill('#new-todo-title', 'Todo to complete')
    await page.click('button[type="submit"]:has-text("Add")')
    await expect(page.getByText('Todo to complete')).toBeVisible()

    await page.click('input[type="checkbox"][aria-label*="Todo to complete"]')

    const completedSection = page.locator('section[aria-label*="Completed"]')
    await expect(completedSection).toBeVisible()
    await expect(completedSection.getByText('Todo to complete')).toBeVisible()
  })

  test('can delete a todo with confirmation', async ({ page }) => {
    await page.fill('#new-todo-title', 'Todo to delete')
    await page.click('button[type="submit"]:has-text("Add")')
    await expect(page.getByText('Todo to delete')).toBeVisible()

    await page.click('button[aria-label*="Delete todo"]')
    await page.click('button:has-text("Delete"):not(:has-text("Cancel"))')

    await expect(page.getByText('Todo to delete')).not.toBeVisible()
  })

  test('shows empty state when no todos', async ({ page }) => {
    await expect(page.getByText(/No todos yet/)).toBeVisible()
  })
})
