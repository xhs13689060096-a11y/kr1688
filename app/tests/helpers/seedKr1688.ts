import type { FullConfig } from '@playwright/test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export const kr1688E2E = {
  prefix: 'kr1688-e2e-',
  storySlug: 'kr1688-e2e-story',
  storyTitleAr: 'قصة اختبار KR1688',
  chapterNumber: 1,
  chapterTitleAr: 'الفصل التجريبي الأول',
  readerEmail: 'kr1688-e2e-reader@example.test',
}

export async function cleanupKr1688TestData() {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'chapters', where: { slug: { like: `${kr1688E2E.prefix}%` } }, overrideAccess: true })
  await payload.delete({ collection: 'stories', where: { slug: { like: `${kr1688E2E.prefix}%` } }, overrideAccess: true })
  await payload.delete({ collection: 'users', where: { email: { equals: kr1688E2E.readerEmail } }, overrideAccess: true })
}

export async function seedKr1688TestData() {
  const payload = await getPayload({ config })
  await cleanupKr1688TestData()
  await payload.create({ collection: 'users', data: { email: kr1688E2E.readerEmail, password: 'kr1688-e2e-reader-only', role: 'reader' }, overrideAccess: true })
  const story = await payload.create({
    collection: 'stories',
    data: { titleAr: kr1688E2E.storyTitleAr, slug: kr1688E2E.storySlug, contentStatus: 'published', demoOnly: true, totalChapters: 1 },
    overrideAccess: true,
  })
  await payload.create({
    collection: 'chapters',
    data: { titleAr: kr1688E2E.chapterTitleAr, slug: `${kr1688E2E.prefix}chapter-1`, chapterNumber: kr1688E2E.chapterNumber, story: story.id, status: 'published', demoOnly: true },
    overrideAccess: true,
  })
}

export default async function globalSetup(_config: FullConfig) {
  await seedKr1688TestData()
  return cleanupKr1688TestData
}
