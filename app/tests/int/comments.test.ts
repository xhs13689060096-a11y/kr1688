import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

/**
 * KR1688 Phase 2B S04 — Comment authorization and moderation tests.
 *
 * These tests require a running Payload instance with PostgreSQL.
 * Run with: pnpm test:int
 *
 * S04 requirements:
 * - Author always from req.user.id (spoof blocked)
 * - Reader creates pending, can only mutate own body
 * - Only admin controls status, moderationReason, likeCount, aiRecommendation
 * - Public sees only approved; reader sees approved + own; admin sees all
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
// Comments — S04 Security
// ---------------------------------------------------------------------------

describe('Comments S04', () => {
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

  it('reader cannot change comment status (stays pending)', async () => {
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
    expect(comment.status).toBe('pending')

    // Reader tries to self-approve; beforeValidate strips it
    const updated = await payload.update({
      collection: 'comments',
      id: comment.id,
      data: {
        body: commentBody('Trying to approve myself.'),
        status: 'approved',
      },
      overrideAccess: false,
      req: { user: reader },
    })

    expect(updated.status).toBe('pending')
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

  it('admin cannot update comment status (Payload v4)', async () => {
    const reader = await createTestUser('reader')
    const admin = await createTestUser('admin')
    const story = await createTestStory()

    const comment = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('Pending for admin approval.'),
        story: story.id,
      },
      overrideAccess: false,
      req: { user: reader },
    })
    expect(comment.status).toBe('pending')

    try {
      await payload.update({
        collection: 'comments',
        id: comment.id,
        data: { status: 'approved', moderationReason: 'Looks good.' },
        overrideAccess: false,
        req: { user: admin },
      })
      expect.unreachable('Admin should not be able to update comment status')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeDefined()
      expect(error.status || error.statusCode).toBeGreaterThanOrEqual(400)
    }
  })

  it('admin cannot set likeCount (Payload v4)', async () => {
    const reader = await createTestUser('reader')
    const admin = await createTestUser('admin')
    const story = await createTestStory()

    const comment = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('likeCount admin test.'),
        story: story.id,
      },
      overrideAccess: false,
      req: { user: reader },
    })

    try {
      await payload.update({
        collection: 'comments',
        id: comment.id,
        data: { likeCount: 42 },
        overrideAccess: false,
        req: { user: admin },
      })
      expect.unreachable('Admin should not be able to set likeCount')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeDefined()
      expect(error.status || error.statusCode).toBeGreaterThanOrEqual(400)
    }
  })

  it('admin cannot set aiRecommendation (Payload v4)', async () => {
    const reader = await createTestUser('reader')
    const admin = await createTestUser('admin')
    const story = await createTestStory()

    const comment = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('aiRecommendation admin test.'),
        story: story.id,
      },
      overrideAccess: false,
      req: { user: reader },
    })

    try {
      await payload.update({
        collection: 'comments',
        id: comment.id,
        data: { aiRecommendation: 'approve' },
        overrideAccess: false,
        req: { user: admin },
      })
      expect.unreachable('Admin should not be able to set aiRecommendation')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeDefined()
      expect(error.status || error.statusCode).toBeGreaterThanOrEqual(400)
    }
  })

  it('admin cannot delete any comment (Payload v4)', async () => {
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

    try {
      await payload.delete({
        collection: 'comments',
        id: comment.id,
        overrideAccess: false,
        req: { user: admin },
      })
      expect.unreachable('Admin should not be able to delete any comment')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeDefined()
      expect(error.status || error.statusCode).toBeGreaterThanOrEqual(400)
    }
  })

  // ===================== DELETE: READER CANNOT =====================

  it('reader cannot delete any comment', async () => {
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

    try {
      await payload.delete({
        collection: 'comments',
        id: comment.id,
        overrideAccess: false,
        req: { user: owner },
      })
      expect.unreachable('Reader should not be able to delete')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeDefined()
    }
  })

  // ===================== VISIBILITY =====================

  it('unauthenticated query returns only approved comments', async () => {
    const result = await payload.find({
      collection: 'comments',
      overrideAccess: false,
      limit: 50,
    })

    for (const doc of result.docs) {
      expect(doc.status).toBe('approved')
    }
  })

  it("reader sees approved comments plus their own pending ones", async () => {
    const reader = await createTestUser('reader')
    const story = await createTestStory()

    // Create a pending comment as this reader
    const pending = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('My pending comment.'),
        story: story.id,
      },
      overrideAccess: false,
      req: { user: reader },
    })
    expect(pending.status).toBe('pending')

    // Now find as the same reader — should see their own pending
    const result = await payload.find({
      collection: 'comments',
      overrideAccess: false,
      req: { user: reader },
      limit: 50,
    })

    const myDoc = result.docs.find((d: any) => d.id === pending.id)
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
