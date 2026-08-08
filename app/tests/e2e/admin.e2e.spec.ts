import { test, expect } from '@playwright/test'

test.describe('Admin Panel', () => {
  test('admin login is accessible', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin(?:\/login)?$/)
    await expect(page.locator('form').first()).toBeAttached({ timeout: 15_000 })
  })
})
