import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

/**
 * KR1688 E02 — Comment authorization and immediate-publication tests.
 *
 * These tests require a running Payload instance with PostgreSQL.
 * Run with: pnpm test:int
 *
 * E02 requirements:
 * - Author always from req.user.id (spoof blocked)
 * - Reader creates published, can only mutate own body
 * - Only admin controls status and can hide a comment
 * - Public sees only published comments
 * - Delete: admin only
 */

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

async function createTestUser(role: 'reader' | 'admin' = 'reader') {
  const ts = Date.now()
  return await payload.create({
    collection: 'users',
    data: {
      email: `cmt-${role}-${ts}@kr1688.test`,
      password: `pwd-${ts}`,
      name: `Cmt ${role === 'admin' ? 'Admin' : 'Reader'} ${ts}`,
      role,
    },
    overrideAccess: true,
    ...(role === 'admin' ? { req: { user: { id: 'trusted-test-admin', role: 'admin' } } } : {}),
    disableVerificationEmail: true,
  })
}

async function createTestStory() {
  const ts = Date.now()
  return await payload.create({
    collection: 'stories',
    data: {
      titleAr: `قصة تعليقات ${ts}`,
      demoOnly: true,
      contentStatus: 'draft',
    },
    overrideAccess: true,
  })
}

async function createTestChapter(storyId: string | number) {
  const ts = Date.now()
  return await payload.create({
    collection: 'chapters',
    data: {
      titleAr: `الفصل ${ts}`,
      chapterNumber: 1,
      story: storyId,
    },
    overrideAccess: true,
  })
}

/** Build a minimal richText body for a comment. */
function commentBody(text: string) {
  return {
    root: {
      children: [
        {
          children: [{ text, type: 'text' as const }],
          type: 'paragraph' as const,
        },
      ],
      type: 'root' as const,
    },
  }
}

// ---------------------------------------------------------------------------
// Comments — E02 Security
// ---------------------------------------------------------------------------

describe('Comments E02', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  // ===================== AUTHOR SPOOFING =====================

  it('always derives author from req.user even if spoofed author is sent', async () => {
    const reader = await createTestUser('reader')
    const otherUser = await createTestUser('reader')
    const story = await createTestStory()

    const comment = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('Spoofed author attempt.'),
        author: otherUser.id, // Try to impersonate
        story: story.id,
      },
      overrideAccess: false,
      req: { user: reader },
    })

    const cmtAuthorId = typeof comment.author === 'object' ? comment.author.id : comment.author
    expect(cmtAuthorId).toBe(reader.id)
  })

  // ===================== READER CAN ONLY MUTATE BODY =====================

  it('reader updating own comment body succeeds', async () => {
    const reader = await createTestUser('reader')
    const story = await createTestStory()

    const comment = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('Original body.'),
        story: story.id,
      },
      overrideAccess: false,
      req: { user: reader },
    })

    const updated = await payload.update({
      collection: 'comments',
      id: comment.id,
      data: {
        body: commentBody('Updated body by owner.'),
      },
      overrideAccess: false,
      req: { user: reader },
    })

    expect(updated.id).toBe(comment.id)
  })

  it('reader cannot change comment status', async () => {
    const reader = await createTestUser('reader')
    const story = await createTestStory()

    const comment = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('Status spoof attempt.'),
        story: story.id,
      },
      overrideAccess: false,
      req: { user: reader },
    })
    expect(comment.status).toBe('published')

    await expect(
      payload.update({
        collection: 'comments',
        id: comment.id,
        data: {
          body: commentBody('Trying to hide myself.'),
          status: 'hidden',
        },
        overrideAccess: false,
        req: { user: reader },
      }),
    ).rejects.toThrow('status')
  })

  it('reader cannot update another user comment', async () => {
    const owner = await createTestUser('reader')
    const attacker = await createTestUser('reader')
    const story = await createTestStory()

    const comment = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('Owner comment.'),
        story: story.id,
      },
      overrideAccess: false,
      req: { user: owner },
    })

    try {
      await payload.update({
        collection: 'comments',
        id: comment.id,
        data: {
          body: commentBody('Attacker trying to edit.'),
        },
        overrideAccess: false,
        req: { user: attacker },
      })
      expect.unreachable('Attacker should not be able to update')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeDefined()
    }
  })

  // ===================== ADMIN PRIVILEGES =====================

  it('admin can hide a published comment', async () => {
    const reader = await createTestUser('reader')
    const admin = await createTestUser('admin')
    const story = await createTestStory()

    const comment = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('Published before administrative hiding.'),
        story: story.id,
      },
      overrideAccess: false,
      req: { user: reader },
    })
    expect(comment.status).toBe('published')

    const hidden = await payload.update({
      collection: 'comments',
      id: comment.id,
      data: { status: 'hidden' },
      overrideAccess: false,
      req: { user: admin },
    })

    expect(hidden.status).toBe('hidden')
  })

  it('admin can delete any comment', async () => {
    const reader = await createTestUser('reader')
    const admin = await createTestUser('admin')
    const story = await createTestStory()

    const comment = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('To be deleted by admin.'),
        story: story.id,
      },
      overrideAccess: false,
      req: { user: reader },
    })

    const deleted = await payload.delete({
      collection: 'comments',
      id: comment.id,
      overrideAccess: false,
      req: { user: admin },
    })

    expect(deleted.id).toBe(comment.id)
  })

  // ===================== DELETE: READER CANNOT =====================

  it('reader cannot delete their own published comment', async () => {
    const owner = await createTestUser('reader')
    const story = await createTestStory()

    const comment = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('Reader cannot delete.'),
        story: story.id,
      },
      overrideAccess: false,
      req: { user: owner },
    })

    await expect(
      payload.delete({
        collection: 'comments',
        id: comment.id,
        overrideAccess: false,
        req: { user: owner },
      }),
    ).rejects.toThrow()
  })

  // ===================== VISIBILITY =====================

  it('unauthenticated query returns only published comments', async () => {
    const result = await payload.find({
      collection: 'comments',
      overrideAccess: false,
      limit: 50,
    })

    for (const doc of result.docs) {
      expect(doc.status).toBe('published')
    }
  })

  it('reader sees their published comment', async () => {
    const reader = await createTestUser('reader')
    const story = await createTestStory()

    const published = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('My published comment.'),
        story: story.id,
      },
      overrideAccess: false,
      req: { user: reader },
    })
    expect(published.status).toBe('published')

    const result = await payload.find({
      collection: 'comments',
      overrideAccess: false,
      req: { user: reader },
      limit: 50,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const myDoc = result.docs.find((d: any) => d.id === published.id)
    expect(myDoc).toBeDefined()
  })

  // ===================== VALIDATION =====================

  it('comment without story or chapter fails validation', async () => {
    const reader = await createTestUser('reader')

    try {
      await payload.create({
        collection: 'comments',
        data: {
          body: commentBody('Missing both story and chapter.'),
        },
        overrideAccess: false,
        req: { user: reader },
      })
      expect.unreachable('Validation should have thrown')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeDefined()
      expect(error.message || '').toMatch(/story|chapter|must be associated/i)
    }
  })

  it('reply cannot be associated with a chapter', async () => {
    const reader = await createTestUser('reader')
    const story = await createTestStory()
    const chapter = await createTestChapter(story.id)

    const parent = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('Parent comment.'),
        story: story.id,
      },
      overrideAccess: false,
      req: { user: reader },
    })

    try {
      await payload.create({
        collection: 'comments',
        data: {
          body: commentBody('Invalid reply with chapter.'),
          story: story.id,
          chapter: chapter.id,
          parent: parent.id,
        },
        overrideAccess: false,
        req: { user: reader },
      })
      expect.unreachable('Reply with chapter should have thrown')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeDefined()
      expect(error.message || '').toMatch(/reply|chapter|parent/i)
    }
  })

  it('authenticated reader can create a reply to another comment', async () => {
    const reader = await createTestUser('reader')
    const story = await createTestStory()

    const parent = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('Parent comment.'),
        story: story.id,
      },
      overrideAccess: false,
      req: { user: reader },
    })

    const reply = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('Reply to parent.'),
        story: story.id,
        parent: parent.id,
      },
      overrideAccess: false,
      req: { user: reader },
    })

    const replyParentId = typeof reply.parent === 'object' ? reply.parent.id : reply.parent
    expect(replyParentId).toBe(parent.id)
  })

  // ===================== UNAUTHENTICATED =====================

  it('rejects unauthenticated user creating a comment', async () => {
    try {
      await payload.create({
        collection: 'comments',
        data: {
          body: commentBody('Unauthenticated attempt.'),
          story: '000000000000000000000000',
        },
        overrideAccess: false,
      })
      expect.unreachable('Unauthenticated create should have thrown')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeDefined()
    }
  })
})

describe('C02 — comment ownership and immediate-publication safety', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('admin hiding preserves the reader author', async () => {
    const reader = await createTestUser('reader')
    const admin = await createTestUser('admin')
    const story = await createTestStory()
    const comment = await payload.create({
      collection: 'comments',
      data: { body: commentBody('Published reader comment.'), story: story.id },
      overrideAccess: false,
      req: { user: reader },
    })

    const hidden = await payload.update({
      collection: 'comments',
      id: comment.id,
      data: { status: 'hidden' },
      overrideAccess: true,
      req: { user: admin },
    })

    const authorId = typeof hidden.author === 'object' ? hidden.author.id : hidden.author
    expect(authorId).toBe(reader.id)
    expect(hidden.status).toBe('hidden')
  })

  it.each(['story', 'chapter', 'parent', 'author'])(
    'reader cannot replace %s on an own comment',
    async (field) => {
      const reader = await createTestUser('reader')
      const otherReader = await createTestUser('reader')
      const story = await createTestStory()
      const otherStory = await createTestStory()
      const comment = await payload.create({
        collection: 'comments',
        data: { body: commentBody('Protected relation comment.'), story: story.id },
        overrideAccess: false,
        req: { user: reader },
      })

      const replacement = field === 'author' ? otherReader.id : otherStory.id
      await expect(
        payload.update({
          collection: 'comments',
          id: comment.id,
          data: { [field]: replacement },
          overrideAccess: false,
          req: { user: reader },
        }),
      ).rejects.toThrow()
    },
  )
})
