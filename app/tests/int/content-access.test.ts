import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'

let payload: Payload

async function createReader() {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return payload.create({
    collection: 'users',
    data: {
      email: `content-reader-${suffix}@kr1688.test`,
      password: 'content-reader-password',
      role: 'reader',
    },
    disableVerificationEmail: true,
    overrideAccess: true,
  } as never)
}

async function createAdmin() {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return payload.create({
    collection: 'users',
    data: {
      email: `content-admin-${suffix}@kr1688.test`,
      password: 'content-admin-password',
      role: 'admin',
    },
    disableVerificationEmail: true,
    overrideAccess: true,
    req: { user: { id: 'content-access-test-admin', role: 'admin' } },
  } as never)
}

async function createStory(contentStatus: 'draft' | 'published') {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return payload.create({
    collection: 'stories',
    data: {
      titleAr: `قصة وصول ${contentStatus} ${suffix}`,
      contentStatus,
      demoOnly: true,
    },
    overrideAccess: true,
  } as never)
}

async function createChapter(
  story: Awaited<ReturnType<typeof createStory>>,
  status: 'draft' | 'published' | 'archived',
) {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return payload.create({
    collection: 'chapters',
    data: {
      titleAr: `فصل وصول ${status} ${suffix}`,
      chapterNumber: 1,
      story: story.id,
      status,
    },
    overrideAccess: true,
  } as never)
}

describe('E05 — content access boundary', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  it('denies generic reader story and chapter writes', async () => {
    const reader = await createReader()
    const story = await createStory('draft')
    const chapter = await createChapter(story, 'draft')

    await expect(
      payload.create({
        collection: 'stories',
        data: { titleAr: 'محاولة إنشاء قارئ', contentStatus: 'published' },
        req: { user: reader },
        overrideAccess: false,
      } as never),
    ).rejects.toThrow()

    await expect(
      payload.update({
        collection: 'stories',
        id: story.id,
        data: { contentStatus: 'published' },
        req: { user: reader },
        overrideAccess: false,
      } as never),
    ).rejects.toThrow()

    await expect(
      payload.delete({
        collection: 'chapters',
        id: chapter.id,
        req: { user: reader },
        overrideAccess: false,
      } as never),
    ).rejects.toThrow()
  })

  it('shows non-admins only published stories and published chapters of published stories', async () => {
    const reader = await createReader()
    const publishedStory = await createStory('published')
    const draftStory = await createStory('draft')
    const publishedChapter = await createChapter(publishedStory, 'published')
    const archivedChapter = await createChapter(publishedStory, 'archived')
    const draftStoryChapter = await createChapter(draftStory, 'published')

    const publicStories = await payload.find({ collection: 'stories', overrideAccess: false })
    const publicStoryIds = publicStories.docs.map((story) => story.id)
    expect(publicStoryIds).toContain(publishedStory.id)
    expect(publicStoryIds).not.toContain(draftStory.id)

    const readerChapters = await payload.find({
      collection: 'chapters',
      req: { user: reader },
      overrideAccess: false,
    } as never)
    const readerChapterIds = readerChapters.docs.map((chapter) => chapter.id)
    expect(readerChapterIds).toContain(publishedChapter.id)
    expect(readerChapterIds).not.toContain(archivedChapter.id)
    expect(readerChapterIds).not.toContain(draftStoryChapter.id)

    const publicChapters = await payload.find({ collection: 'chapters', overrideAccess: false })
    const publicChapterIds = publicChapters.docs.map((chapter) => chapter.id)
    expect(publicChapterIds).toContain(publishedChapter.id)
    expect(publicChapterIds).not.toContain(archivedChapter.id)
    expect(publicChapterIds).not.toContain(draftStoryChapter.id)
  })

  it('retains administrator content management and draft visibility', async () => {
    const admin = await createAdmin()
    const draftStory = await createStory('draft')

    const updated = await payload.update({
      collection: 'stories',
      id: draftStory.id,
      data: { titleAr: 'قصة مسودة يديرها المسؤول' },
      req: { user: admin },
      overrideAccess: false,
    } as never)
    expect(updated.id).toBe(draftStory.id)

    const visibleToAdmin = await payload.findByID({
      collection: 'stories',
      id: draftStory.id,
      req: { user: admin },
      overrideAccess: false,
    } as never)
    expect(visibleToAdmin.id).toBe(draftStory.id)
  })
})
