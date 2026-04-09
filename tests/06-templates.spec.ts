import { test, expect } from '@playwright/test'
import { setupVirtualAuthenticator, registerUser, uniqueUsername } from './helpers'

test.describe('Templates', () => {
  test.beforeEach(async ({ page }) => {
    await setupVirtualAuthenticator(page)
    await registerUser(page, uniqueUsername())
  })

  test('can save a todo as a template', async ({ page }) => {
    await page.fill('#new-todo-title', 'Weekly review')
    await page.click('button[type="submit"]:has-text("Add")')
    await expect(page.getByText('Weekly review')).toBeVisible()

    await page.click('button[aria-label="Save as template"]')

    await expect(page.getByRole('dialog', { name: 'Save as Template' })).toBeVisible()
    await page.fill('#template-name', 'My Weekly Template')
    await page.click('button:has-text("Save")')

    await expect(page.getByRole('dialog', { name: 'Save as Template' })).not.toBeVisible()
  })

  test('saved template appears in templates modal', async ({ page }) => {
    await page.fill('#new-todo-title', 'Daily standup')
    await page.click('button[type="submit"]:has-text("Add")')
    await page.click('button[aria-label="Save as template"]')
    await page.fill('#template-name', 'Standup Template')
    await page.click('button:has-text("Save")')

    await page.click('button[aria-label="Use a template"]')
    await expect(page.getByRole('dialog', { name: 'Todo Templates' })).toBeVisible()
    await expect(page.getByText('Standup Template')).toBeVisible()
  })

  test('can use a template to create a new todo', async ({ page }) => {
    await page.fill('#new-todo-title', 'Template source todo')
    await page.click('button[type="submit"]:has-text("Add")')
    await page.click('button[aria-label="Save as template"]')
    await page.fill('#template-name', 'Reusable Template')
    await page.click('button:has-text("Save")')

    await page.click('button[aria-label="Use a template"]')
    await expect(page.getByRole('dialog', { name: 'Todo Templates' })).toBeVisible()
    await page.click('button[aria-label="Use template: Reusable Template"]')

    await expect(page.getByRole('dialog', { name: 'Todo Templates' })).not.toBeVisible()
    await expect(page.getByText('Template source todo')).toHaveCount(2)
  })

  test('can delete a template', async ({ page }) => {
    await page.fill('#new-todo-title', 'Deletable todo')
    await page.click('button[type="submit"]:has-text("Add")')
    await page.click('button[aria-label="Save as template"]')
    await page.fill('#template-name', 'ToDeleteTemplate')
    await page.click('button:has-text("Save")')

    await page.click('button[aria-label="Use a template"]')
    await expect(page.getByText('ToDeleteTemplate')).toBeVisible()

    await page.click('button[aria-label="Delete template: ToDeleteTemplate"]')

    await expect(page.getByText('ToDeleteTemplate')).not.toBeVisible()
  })

  test('empty state shown when no templates exist', async ({ page }) => {
    await page.click('button[aria-label="Use a template"]')
    await expect(page.getByText(/No templates yet/i)).toBeVisible()
  })
})
