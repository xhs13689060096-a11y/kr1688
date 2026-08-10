import { describe, expect, it } from 'vitest'
import { getPayload } from 'payload'

import { Stories } from '@/collections/Stories'
import config from '@/payload.config'
import { createPublishedComment } from '@/utilities/readerComments'

import { assertReaderRole, requireReader } from '@/utilities/readerRequest'
import { createFavorite, removeFavorite } from '@/utilities/readerFavorites'
import { saveProgress, validateProgressInput } from '@/utilities/readerProgress'

describe('E01 — operator publishing state', () => {
  it('offers only draft and published story choices', () => {
    const tabs = (
      Stories.fields[0] as {
        tabs: { fields: { name?: string; options?: { value: string }[] }[] }[]
      }
    ).tabs
    const field = tabs.flatMap((tab) => tab.fields).find((item) => item.name === 'contentStatus')

    expect(field?.options?.map((item) => item.value)).toEqual(['draft', 'published'])
  })
})

describe('D01 — reader request boundary', () => {
  it('rejects an anonymous request without revealing authentication details', async () => {
    await expect(requireReader(new Request('http://localhost/reader'))).rejects.toThrow(
      'Authentication required',
    )
  })

  it('rejects an administrator from reader-only state changes', () => {
    expect(() => assertReaderRole({ role: 'admin' } as never)).toThrow('Reader role required')
  })
})

describe('D03 — reader progress', () => {
  it('accepts only bounded integer progress values', () => {
    expect(() =>
      validateProgressInput({ storyId: 1, chapterId: 2, progressPercentage: 100 }),
    ).not.toThrow()
    expect(() =>
      validateProgressInput({ storyId: 1, chapterId: 2, progressPercentage: 101 }),
    ).toThrow('Invalid progress')
  })

  it('rejects a chapter that does not belong to the requested story', async () => {
    const payload = await getPayload({ config })
    const suffix = Date.now()
    const reader = await payload.create({
      collection: 'users',
      data: {
        email: `progress-reader-${suffix}@kr1688.test`,
        password: 'reader-progress-password',
        role: 'reader',
      },
      disableVerificationEmail: true,
      overrideAccess: true,
    })
    const firstStory = await payload.create({
      collection: 'stories',
      data: { titleAr: `القصة الأولى ${suffix}`, contentStatus: 'published', demoOnly: true },
      overrideAccess: true,
    })
    const secondStory = await payload.create({
      collection: 'stories',
      data: { titleAr: `القصة الثانية ${suffix}`, contentStatus: 'published', demoOnly: true },
      overrideAccess: true,
    })
    const chapter = await payload.create({
      collection: 'chapters',
      data: {
        titleAr: `فصل مختلف ${suffix}`,
        chapterNumber: 1,
        story: secondStory.id,
        status: 'published',
      },
      overrideAccess: true,
    })

    await expect(
      saveProgress(
        { payload, req: { user: reader } as never, user: reader },
        { storyId: firstStory.id, chapterId: chapter.id, progressPercentage: 50 },
      ),
    ).rejects.toThrow('Invalid chapter progress')
  })
})

describe('D02 — reader favorites', () => {
  it('rejects non-positive story identifiers before any favorite operation', async () => {
    await expect(createFavorite({} as never, 0)).rejects.toThrow('Invalid story ID')
    await expect(removeFavorite({} as never, -1)).rejects.toThrow('Invalid story ID')
  })
})

describe('D04 — immediately published reader comments', () => {
  it.each(['author', 'story', 'chapter', 'parent', 'status'] as const)(
    'rejects protected client field %s in the helper',
    async (field) => {
      const payload = await getPayload({ config })
      const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      const email = `protected-comment-${suffix}@kr1688.test`
      const reader = await payload.create({
        collection: 'users',
        data: {
          email,
          password: 'reader-comment-password',
          role: 'reader',
          _verified: true,
        },
        disableVerificationEmail: true,
        overrideAccess: true,
      })
      const story = await payload.create({
        collection: 'stories',
        data: { titleAr: `قصة حقول محمية ${suffix}`, contentStatus: 'published', demoOnly: true },
        overrideAccess: true,
      })
      const chapter = await payload.create({
        collection: 'chapters',
        data: {
          titleAr: `فصل حقول محمية ${suffix}`,
          chapterNumber: 1,
          story: story.id,
          status: 'published',
        },
        overrideAccess: true,
      })
      const protectedValue = {
        author: reader.id,
        story: story.id,
        chapter: chapter.id,
        parent: 1,
        status: 'hidden',
      }[field]
      const input = { chapterId: chapter.id, body: 'تعليق بحقل محمي', [field]: protectedValue }

      await expect(
        createPublishedComment({ payload, req: { user: reader } as never, user: reader }, input),
      ).rejects.toThrow(field)
    },
  )

  it('derives the author, publishes immediately, and exposes the comment to the public', async () => {
    const payload = await getPayload({ config })
    const suffix = Date.now()
    const reader = await payload.create({
      collection: 'users',
      data: {
        email: `reader-comment-${suffix}@kr1688.test`,
        password: 'reader-comment-password',
        role: 'reader',
      },
      disableVerificationEmail: true,
      overrideAccess: true,
    })
    const story = await payload.create({
      collection: 'stories',
      data: { titleAr: `قصة تعليق ${suffix}`, contentStatus: 'published', demoOnly: true },
      overrideAccess: true,
    })
    const chapter = await payload.create({
      collection: 'chapters',
      data: {
        titleAr: `فصل تعليق ${suffix}`,
        chapterNumber: 1,
        story: story.id,
        status: 'published',
      },
      overrideAccess: true,
    })

    const comment = await createPublishedComment(
      { payload, req: { user: reader } as never, user: reader },
      { chapterId: chapter.id, body: 'تعليق ظاهر الآن' },
    )
    const authorId = typeof comment.author === 'object' ? comment.author.id : comment.author

    expect(authorId).toBe(reader.id)
    expect(comment.status).toBe('published')

    const publicComments = await payload.find({
      collection: 'comments',
      where: {
        chapter: { equals: chapter.id },
        status: { equals: 'published' },
      },
      overrideAccess: false,
    })
    expect(publicComments.docs.map((item) => item.id)).toContain(comment.id)
  })

  it('removes a hidden comment from the unauthenticated chapter query', async () => {
    const payload = await getPayload({ config })
    const suffix = Date.now()
    const reader = await payload.create({
      collection: 'users',
      data: {
        email: `hidden-comment-reader-${suffix}@kr1688.test`,
        password: 'reader-comment-password',
        role: 'reader',
      },
      disableVerificationEmail: true,
      overrideAccess: true,
    })
    const admin = await payload.create({
      collection: 'users',
      data: {
        email: `hidden-comment-admin-${suffix}@kr1688.test`,
        password: 'admin-comment-password',
        role: 'admin',
      },
      disableVerificationEmail: true,
      overrideAccess: true,
      req: { user: { id: 'e02-test-admin', role: 'admin' } } as never,
    })
    const story = await payload.create({
      collection: 'stories',
      data: { titleAr: `قصة إخفاء تعليق ${suffix}`, contentStatus: 'published', demoOnly: true },
      overrideAccess: true,
    })
    const chapter = await payload.create({
      collection: 'chapters',
      data: {
        titleAr: `فصل إخفاء تعليق ${suffix}`,
        chapterNumber: 1,
        story: story.id,
        status: 'published',
      },
      overrideAccess: true,
    })
    const comment = await createPublishedComment(
      { payload, req: { user: reader } as never, user: reader },
      { chapterId: chapter.id, body: 'تعليق سيُخفى' },
    )

    await payload.update({
      collection: 'comments',
      id: comment.id,
      data: { status: 'hidden' },
      overrideAccess: false,
      req: { user: admin } as never,
    })

    const publicComments = await payload.find({
      collection: 'comments',
      where: {
        chapter: { equals: chapter.id },
      },
      overrideAccess: false,
    })
    expect(publicComments.docs.map((item) => item.id)).not.toContain(comment.id)
  })

  it('rejects a comment on a draft chapter', async () => {
    const payload = await getPayload({ config })
    const suffix = Date.now()
    const reader = await payload.create({
      collection: 'users',
      data: {
        email: `draft-comment-${suffix}@kr1688.test`,
        password: 'reader-comment-password',
        role: 'reader',
      },
      disableVerificationEmail: true,
      overrideAccess: true,
    })
    const story = await payload.create({
      collection: 'stories',
      data: { titleAr: `قصة مسودة ${suffix}`, contentStatus: 'draft', demoOnly: true },
      overrideAccess: true,
    })
    const chapter = await payload.create({
      collection: 'chapters',
      data: { titleAr: `فصل مسودة ${suffix}`, chapterNumber: 1, story: story.id, status: 'draft' },
      overrideAccess: true,
    })

    await expect(
      createPublishedComment(
        { payload, req: { user: reader } as never, user: reader },
        { chapterId: chapter.id, body: 'تعليق مرفوض' },
      ),
    ).rejects.toThrow('Published chapter required')
  })
})
