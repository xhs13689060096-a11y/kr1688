import { describe, expect, it } from 'vitest'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { createPendingComment } from '@/utilities/readerComments'

import { requireReader } from '@/utilities/readerRequest'
import { createFavorite, removeFavorite } from '@/utilities/readerFavorites'
import { validateProgressInput } from '@/utilities/readerProgress'

describe('D01 — reader request boundary', () => {
  it('rejects an anonymous request without revealing authentication details', async () => {
    await expect(requireReader(new Request('http://localhost/reader'))).rejects.toThrow(
      'Authentication required',
    )
  })
})

describe('D03 — reader progress', () => {
  it('accepts only bounded integer progress values', () => {
    expect(() => validateProgressInput({ storyId: 1, chapterId: 2, progressPercentage: 100 })).not.toThrow()
    expect(() => validateProgressInput({ storyId: 1, chapterId: 2, progressPercentage: 101 })).toThrow('Invalid progress')
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
      data: { titleAr: `قصة تعليق ${suffix}`, contentStatus: 'draft', demoOnly: true },
      overrideAccess: true,
    })
    const chapter = await payload.create({
      collection: 'chapters',
      data: { titleAr: `فصل تعليق ${suffix}`, chapterNumber: 1, story: story.id },
      overrideAccess: true,
    })

    const comment = await createPendingComment({ payload, req: { user: reader } as never, user: reader }, { chapterId: chapter.id, body: 'تعليق قيد المراجعة' })
    const authorId = typeof comment.author === 'object' ? comment.author.id : comment.author

    expect(authorId).toBe(reader.id)
    expect(comment.status).toBe('pending')
  })
})
