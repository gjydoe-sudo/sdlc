import { test, expect } from '@playwright/test'
import { setupVirtualAuthenticator, registerUser, uniqueUsername } from './helpers'

test.describe('Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    await setupVirtualAuthenticator(page)
    await registerUser(page, uniqueUsername())

    // Create several todos with different priorities
    const todos = [
      { title: 'Buy groceries', priority: 'low' },
      { title: 'Finish report', priority: 'high' },
      { title: 'Call dentist', priority: 'medium' }
    ]
    for (const todo of todos) {
      await page.fill('#new-todo-title', todo.title)
      await page.selectOption('#new-priority', todo.priority)
      await page.click('button[type="submit"]:has-text("Add")')
      await expect(page.getByText(todo.title)).toBeVisible()
    }
  })

  test('search by title filters todos', async ({ page }) => {
    await page.fill('#search-todos', 'grocery')

    await expect(page.getByText('Buy groceries')).toBeVisible()
    await expect(page.getByText('Finish report')).not.toBeVisible()
    await expect(page.getByText('Call dentist')).not.toBeVisible()
  })

  test('search is case-insensitive', async ({ page }) => {
    await page.fill('#search-todos', 'REPORT')

    await expect(page.getByText('Finish report')).toBeVisible()
    await expect(page.getByText('Buy groceries')).not.toBeVisible()
  })

  test('filter by priority works', async ({ page }) => {
    await page.selectOption('#filter-priority', 'high')

    await expect(page.getByText('Finish report')).toBeVisible()
    await expect(page.getByText('Buy groceries')).not.toBeVisible()
    await expect(page.getByText('Call dentist')).not.toBeVisible()
  })

  test('clear all filters restores full list', async ({ page }) => {
    await page.fill('#search-todos', 'report')
    await expect(page.getByText('Buy groceries')).not.toBeVisible()

    await page.click('button:has-text("Clear all")')

    await expect(page.getByText('Buy groceries')).toBeVisible()
    await expect(page.getByText('Finish report')).toBeVisible()
    await expect(page.getByText('Call dentist')).toBeVisible()
  })

  test('empty state shown when no results match search', async ({ page }) => {
    await page.fill('#search-todos', 'nonexistentxyz')

    await expect(page.getByText(/No todos match your filters/)).toBeVisible()
  })
})
