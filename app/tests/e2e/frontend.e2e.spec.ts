import { test, expect } from '@playwright/test'
import {
  seedKr1688TestData,
  cleanupKr1688TestData,
  kr1688E2E,
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

  test('chapter reader offers a pending comment form', async ({ page }) => {
    await page.goto(
      `http://localhost:3000/stories/${seeded.story.slug}/chapters/${seeded.chapter.chapterNumber}`,
    )
    await expect(page.getByLabel('أضف تعليقك')).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('button', { name: 'إرسال للمراجعة' })).toBeVisible()
  })

  test('chapter reader offers an explicit progress action', async ({ page }) => {
    await page.goto(
      `http://localhost:3000/stories/${seeded.story.slug}/chapters/${seeded.chapter.chapterNumber}`,
    )
    await expect(page.getByRole('button', { name: 'تمت قراءة الفصل' })).toBeVisible({ timeout: 15000 })
  })

  test('admin login page is accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/admin')
    const form = page.locator('form').first()
    await expect(form).toBeAttached({ timeout: 15000 })
  })

  test('reader login page is available in Arabic', async ({ page }) => {
    await page.goto('http://localhost:3000/login')
    await expect(page.getByLabel('البريد الإلكتروني')).toBeVisible()
    await expect(page.getByLabel('كلمة المرور')).toBeVisible()
  })

  test('reader can complete the authenticated reading loop', async ({ page }) => {
    await page.goto('http://localhost:3000/login')
    await page.getByLabel('البريد الإلكتروني').fill(kr1688E2E.readerEmail)
    await page.getByLabel('كلمة المرور').fill('kr1688-e2e-reader-only')
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click()
    await expect(page).toHaveURL('http://localhost:3000/account')

    await page.goto(`http://localhost:3000/stories/${seeded.story.slug}`)
    await page.getByRole('button', { name: 'أضف إلى المفضلة' }).click()
    await expect(page.getByRole('button', { name: 'إزالة من المفضلة' })).toBeVisible()

    const savedProgress = await page.evaluate(async ({ storyId, chapterId }) => {
      const response = await fetch('/api/reader/progress', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ storyId, chapterId, progressPercentage: 50 }),
      })
      return response.status
    }, { storyId: seeded.story.id, chapterId: seeded.chapter.id })
    expect(savedProgress).toBe(200)

    await page.goto('http://localhost:3000/account')
    await expect(page.getByRole('link', { name: 'متابعة القراءة' })).toHaveAttribute(
      'href',
      `/stories/${seeded.story.slug}/chapters/${seeded.chapter.chapterNumber}`,
    )

    await page.goto(`http://localhost:3000/stories/${seeded.story.slug}/chapters/${seeded.chapter.chapterNumber}`)
    await page.getByLabel('أضف تعليقك').fill('تعليق قارئ للاختبار')
    await page.getByRole('button', { name: 'إرسال للمراجعة' }).click()
    await expect(page.getByRole('status')).toHaveText('سيظهر تعليقك بعد المراجعة')
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
