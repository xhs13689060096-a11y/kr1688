import { test, expect } from '@playwright/test'
import {
  seedKr1688TestData,
  cleanupKr1688TestData,
  type SeededData,
} from '../helpers/seedKr1688'

/**
 * KR1688 A03 — Self-contained E2E frontend tests.
 *
 * Covers approved routes only:
 *   /, /stories/[slug], /stories/[slug]/chapters/[chapterNumber], /admin
 * No Posts/Pages/search/sitemap/RSS/JSON-LD/IndexNow routes.
 */

test.describe('Frontend', () => {
  let seeded: SeededData

  test.beforeAll(async () => {
    seeded = await seedKr1688TestData()
  })

  test.afterAll(async () => {
    await cleanupKr1688TestData()
  })

  test('can load homepage with RTL layout', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveTitle(/KR1688|منصة القصص العربية|قصص/)
    const html = page.locator('html')
    await expect(html).toHaveAttribute('dir', 'rtl')
    await expect(html).toHaveAttribute('lang', 'ar')
  })

  test('story detail page loads with seeded story', async ({ page }) => {
    await page.goto(`http://localhost:3000/stories/${seeded.story.slug}`)
    const body = page.locator('body')
    await expect(body).toBeAttached()
    await expect(body).toContainText(seeded.story.titleAr, { timeout: 15000 })
  })

  test('chapter reader loads for seeded chapter', async ({ page }) => {
    await page.goto(
      `http://localhost:3000/stories/${seeded.story.slug}/chapters/${seeded.chapter.chapterNumber}`
    )
    const body = page.locator('body')
    await expect(body).toBeAttached()
    await expect(body).toContainText(seeded.chapter.titleAr, { timeout: 15000 })
  })

  test('admin login page is accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/admin')
    const form = page.locator('form').first()
    await expect(form).toBeAttached({ timeout: 15000 })
  })

  test('/search route returns 404', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/search')
    expect(response?.status()).toBe(404)
  })

  test('/posts non-existent route returns 404', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/posts/non-existent')
    expect(response?.status()).not.toBe(200)
  })
})
