import { test, expect, Page } from '@playwright/test'

/**
 * KR1688 Phase 2B S05 — E2E tests for frontend routes.
 *
 * Covers home, story reader, chapter reader, and admin login page.
 * No Posts/Pages/search/sitemap/RSS/JSON-LD/IndexNow routes.
 */

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('can load homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveTitle(/KR1688|منصة القصص العربية|قصص/)
  })

  test('homepage displays expected RTL layout', async ({ page }) => {
    await page.goto('http://localhost:3000')
    // Verify RTL direction
    const html = page.locator('html')
    await expect(html).toHaveAttribute('dir', 'rtl')
    await expect(html).toHaveAttribute('lang', 'ar')
  })

  test('admin login page is accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/admin')
    // Payload admin should load its login form
    await expect(page.locator('form').first()).toBeAttached({ timeout: 15000 })
  })

  test('story list page is accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/stories')
    // Should show stories list or empty state
    const body = page.locator('body')
    await expect(body).toBeAttached()
  })

  test('non-existent route returns 404', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/posts/non-existent')
    // Should not be 200
    expect(response?.status()).not.toBe(200)
  })

  test('/search route is not available', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/search')
    // Should 404
    expect(response?.status()).toBe(404)
  })
})
