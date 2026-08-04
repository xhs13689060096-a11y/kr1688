import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

/**
 * KR1688 Phase 2B T08 — Comment integration tests.
 *
 * These tests require a running Payload instance with PostgreSQL.
 * Run with: pnpm test:int
 */

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

async function createTestUser() {
  const ts = Date.now()
  return await payload.create({
    collection: 'users',
    data: {
      email: `cmt-test-${ts}@kr1688.test`,
      password: `pwd-${ts}`,
      name: `Cmt Tester ${ts}`,
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
// Comments
// ---------------------------------------------------------------------------

describe('Comments', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  // --- Unauthenticated ---

  it('rejects unauthenticated user creating a comment', async () => {
    try {
      await payload.create({
        collection: 'comments',
        data: {
          body: commentBody('This is a test comment.'),
          author: '000000000000000000000000',
          story: '000000000000000000000000',
          status: 'pending',
        },
        overrideAccess: false,
      })
      expect.unreachable('Unauthenticated create should have thrown')
    } catch (error: any) {
      expect(error).toBeDefined()
      expect(error.status || error.statusCode).toBe(401)
    }
  })

  // --- Public read (only approved) ---

  it('public query only returns status=approved comments', async () => {
    const result = await payload.find({
      collection: 'comments',
      overrideAccess: false,
      limit: 50,
    })

    for (const doc of result.docs) {
      expect(doc.status).toBe('approved')
    }
  })

  // --- Authenticated create ---

  it('authenticated user can create a comment', async () => {
    const user = await createTestUser()
    const story = await createTestStory()

    const comment = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('مرحباً، هذه تجربة تعليق.'),
        author: user.id,
        story: story.id,
      },
      overrideAccess: false,
      req: { user },
    })

    expect(comment).toBeDefined()
    expect(comment.id).toBeDefined()
    expect(comment.author).toBe(user.id)
    expect(comment.story).toBe(story.id)
  })

  it('comment status defaults to pending', async () => {
    const user = await createTestUser()
    const story = await createTestStory()

    const comment = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('Comment with default status.'),
        author: user.id,
        story: story.id,
      },
      overrideAccess: false,
      req: { user },
    })

    expect(comment.status).toBe('pending')
  })

  it('likeCount defaults to 0', async () => {
    const user = await createTestUser()
    const story = await createTestStory()

    const comment = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('Checking likeCount default.'),
        author: user.id,
        story: story.id,
      },
      overrideAccess: false,
      req: { user },
    })

    expect(comment.likeCount).toBe(0)
  })

  it('aiRecommendation defaults to none', async () => {
    const user = await createTestUser()
    const story = await createTestStory()

    const comment = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('Checking aiRecommendation default.'),
        author: user.id,
        story: story.id,
      },
      overrideAccess: false,
      req: { user },
    })

    expect(comment.aiRecommendation).toBe('none')
  })

  // --- Validation ---

  it('comment without story or chapter fails validation', async () => {
    const user = await createTestUser()

    try {
      await payload.create({
        collection: 'comments',
        data: {
          body: commentBody('Missing both story and chapter.'),
          author: user.id,
          // intentionally omit story AND chapter
        },
        overrideAccess: false,
        req: { user },
      })
      expect.unreachable('Validation should have thrown')
    } catch (error: any) {
      expect(error).toBeDefined()
      expect(error.message || '').toMatch(/story|chapter|must be associated/i)
    }
  })

  // --- Reply ---

  it('authenticated user can create a reply to another comment', async () => {
    const user = await createTestUser()
    const story = await createTestStory()

    // Create parent comment
    const parent = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('Parent comment.'),
        author: user.id,
        story: story.id,
      },
      overrideAccess: false,
      req: { user },
    })

    // Create reply
    const reply = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('Reply to parent.'),
        author: user.id,
        story: story.id,
        parent: parent.id,
      },
      overrideAccess: false,
      req: { user },
    })

    expect(reply).toBeDefined()
    expect(reply.parent).toBe(parent.id)
  })

  // --- Status update (moderation) ---

  it('authenticated user can update comment status', async () => {
    // In V1 all authenticated users are admin-equivalent for Comments.
    // The update access is `authenticated` — any auth user can update any comment.
    // TODO: when roles are added, restrict status update to moderators/admins.
    const user = await createTestUser()
    const story = await createTestStory()

    const comment = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('Pending comment to approve.'),
        author: user.id,
        story: story.id,
      },
      overrideAccess: false,
      req: { user },
    })
    expect(comment.status).toBe('pending')

    const updated = await payload.update({
      collection: 'comments',
      id: comment.id,
      data: { status: 'approved' },
      overrideAccess: false,
      req: { user },
    })

    expect(updated.status).toBe('approved')
  })

  // --- Moderation-field access (V1 behavior: all auth users can modify) ---

  it('authenticated user can update likeCount', async () => {
    // likeCount has admin.readOnly:true (UI-only), but API-level access is
    // unrestricted in V1. This test documents current behavior;
    // TODO: add field-level access control when roles are implemented.
    const user = await createTestUser()
    const story = await createTestStory()

    const comment = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('Checking likeCount update.'),
        author: user.id,
        story: story.id,
      },
      overrideAccess: false,
      req: { user },
    })

    const updated = await payload.update({
      collection: 'comments',
      id: comment.id,
      data: { likeCount: 5 },
      overrideAccess: false,
      req: { user },
    })

    expect(updated.likeCount).toBe(5)
  })

  it('authenticated user can update aiRecommendation', async () => {
    // aiRecommendation has admin.readOnly:true (UI-only), but API-level access
    // is unrestricted in V1. This test documents current behavior;
    // TODO: add field-level access control when roles are implemented.
    const user = await createTestUser()
    const story = await createTestStory()

    const comment = await payload.create({
      collection: 'comments',
      data: {
        body: commentBody('Checking aiRecommendation update.'),
        author: user.id,
        story: story.id,
      },
      overrideAccess: false,
      req: { user },
    })

    const updated = await payload.update({
      collection: 'comments',
      id: comment.id,
      data: { aiRecommendation: 'approve' },
      overrideAccess: false,
      req: { user },
    })

    expect(updated.aiRecommendation).toBe('approve')
  })
})
