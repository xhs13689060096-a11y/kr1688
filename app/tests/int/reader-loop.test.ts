import { describe, expect, it } from 'vitest'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { createPendingComment } from '@/utilities/readerComments'

import { assertReaderRole, requireReader } from '@/utilities/readerRequest'
import { createFavorite, removeFavorite } from '@/utilities/readerFavorites'
import { saveProgress, validateProgressInput } from '@/utilities/readerProgress'

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
    expect(() => validateProgressInput({ storyId: 1, chapterId: 2, progressPercentage: 100 })).not.toThrow()
    expect(() => validateProgressInput({ storyId: 1, chapterId: 2, progressPercentage: 101 })).toThrow('Invalid progress')
  })

  it('rejects a chapter that does not belong to the requested story', async () => {
    const payload = await getPayload({ config })
    const suffix = Date.now()
    const reader = await payload.create({ collection: 'users', data: { email: `progress-reader-${suffix}@kr1688.test`, password: 'reader-progress-password', role: 'reader' }, disableVerificationEmail: true, overrideAccess: true })
    const firstStory = await payload.create({ collection: 'stories', data: { titleAr: `القصة الأولى ${suffix}`, contentStatus: 'published', demoOnly: true }, overrideAccess: true })
    const secondStory = await payload.create({ collection: 'stories', data: { titleAr: `القصة الثانية ${suffix}`, contentStatus: 'published', demoOnly: true }, overrideAccess: true })
    const chapter = await payload.create({ collection: 'chapters', data: { titleAr: `فصل مختلف ${suffix}`, chapterNumber: 1, story: secondStory.id, status: 'published' }, overrideAccess: true })

    await expect(saveProgress({ payload, req: { user: reader } as never, user: reader }, { storyId: firstStory.id, chapterId: chapter.id, progressPercentage: 50 })).rejects.toThrow('Invalid chapter progress')
  })
})

describe('D02 — reader favorites', () => {
  it('rejects non-positive story identifiers before any favorite operation', async () => {
    await expect(createFavorite({} as never, 0)).rejects.toThrow('Invalid story ID')
    await expect(removeFavorite({} as never, -1)).rejects.toThrow('Invalid story ID')
  })
})

describe('D04 — pending reader comments', () => {
  it('derives the author and pending status through the server-only comment boundary', async () => {
    const payload = await getPayload({ config })
    const suffix = Date.now()
    const reader = await payload.create({
      collection: 'users',
      data: { email: `reader-comment-${suffix}@kr1688.test`, password: 'reader-comment-password', role: 'reader' },
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
      data: { titleAr: `فصل تعليق ${suffix}`, chapterNumber: 1, story: story.id, status: 'published' },
      overrideAccess: true,
    })

    const comment = await createPendingComment({ payload, req: { user: reader } as never, user: reader }, { chapterId: chapter.id, body: 'تعليق قيد المراجعة' })
    const authorId = typeof comment.author === 'object' ? comment.author.id : comment.author

    expect(authorId).toBe(reader.id)
    expect(comment.status).toBe('pending')
  })

  it('rejects a comment on a draft chapter', async () => {
    const payload = await getPayload({ config })
    const suffix = Date.now()
    const reader = await payload.create({ collection: 'users', data: { email: `draft-comment-${suffix}@kr1688.test`, password: 'reader-comment-password', role: 'reader' }, disableVerificationEmail: true, overrideAccess: true })
    const story = await payload.create({ collection: 'stories', data: { titleAr: `قصة مسودة ${suffix}`, contentStatus: 'draft', demoOnly: true }, overrideAccess: true })
    const chapter = await payload.create({ collection: 'chapters', data: { titleAr: `فصل مسودة ${suffix}`, chapterNumber: 1, story: story.id, status: 'draft' }, overrideAccess: true })

    await expect(createPendingComment({ payload, req: { user: reader } as never, user: reader }, { chapterId: chapter.id, body: 'تعليق مرفوض' })).rejects.toThrow('Published chapter required')
  })
})
