import { test, expect } from '@playwright/test'
import { setupVirtualAuthenticator, registerUser, uniqueUsername } from './helpers'
import path from 'path'
import fs from 'fs'
import os from 'os'

test.describe('Export and Import', () => {
  test.beforeEach(async ({ page }) => {
    await setupVirtualAuthenticator(page)
    await registerUser(page, uniqueUsername())

    await page.fill('#new-todo-title', 'Export test todo')
    await page.click('button[type="submit"]:has-text("Add")')
    await expect(page.getByText('Export test todo')).toBeVisible()
  })

  test('can export todos as JSON download', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button[aria-label="Export todos as JSON"]')
    ])

    expect(download.suggestedFilename()).toMatch(/^todos-\d{4}-\d{2}-\d{2}\.json$/)
  })

  test('exported JSON contains todo data', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button[aria-label="Export todos as JSON"]')
    ])

    const filePath = await download.path()
    const content = fs.readFileSync(filePath!, 'utf-8')
    const data = JSON.parse(content)

    expect(data).toHaveProperty('version')
    expect(data).toHaveProperty('todos')
    expect(Array.isArray(data.todos)).toBe(true)
    expect(data.todos.some((t: { title: string }) => t.title === 'Export test todo')).toBe(true)
  })

  test('can import todos from a JSON file', async ({ page }) => {
    const importData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      todos: [
        {
          id: 999,
          title: 'Imported todo',
          completed: 0,
          due_date: null,
          priority: 'high',
          is_recurring: 0,
          recurrence_pattern: null,
          reminder_minutes: null,
          subtasks: [],
          tags: []
        }
      ],
      tags: []
    }

    const tmpFile = path.join(os.tmpdir(), `import-test-${Date.now()}.json`)
    fs.writeFileSync(tmpFile, JSON.stringify(importData))

    page.once('dialog', (dialog) => dialog.accept())

    const fileInput = page.locator('input[aria-label="Select JSON file to import"]')
    await fileInput.setInputFiles(tmpFile)

    await expect(page.getByText('Imported todo')).toBeVisible({ timeout: 10000 })

    fs.unlinkSync(tmpFile)
  })

  test('shows error for invalid JSON import', async ({ page }) => {
    const tmpFile = path.join(os.tmpdir(), `bad-import-${Date.now()}.json`)
    fs.writeFileSync(tmpFile, 'not valid json at all')

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toMatch(/Invalid JSON/i)
      await dialog.accept()
    })

    const fileInput = page.locator('input[aria-label="Select JSON file to import"]')
    await fileInput.setInputFiles(tmpFile)

    fs.unlinkSync(tmpFile)
  })
})
