import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

/**
 * KR1688 Phase 2B T07 — Favorites & ReadingProgress integration tests.
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
      email: `fav-test-${ts}@kr1688.test`,
      password: `pwd-${ts}`,
      name: `Fav Tester ${ts}`,
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
      titleAr: `قصة اختبار ${ts}`,
      demoOnly: true,
      contentStatus: 'draft',
    },
    overrideAccess: true,
  })
}

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

describe('Favorites', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('rejects unauthenticated user creating a favorite', async () => {
    try {
      await payload.create({
        collection: 'favorites',
        data: {
          user: '000000000000000000000000', // dummy ID
          story: '000000000000000000000000', // dummy ID
        },
        overrideAccess: false,
      })
      expect.unreachable('Unauthenticated create should have thrown')
    } catch (error: any) {
      expect(error).toBeDefined()
      expect(error.status || error.statusCode).toBe(401)
    }
  })

  it('authenticated user can create a favorite', async () => {
    const user = await createTestUser()
    const story = await createTestStory()

    const favorite = await payload.create({
      collection: 'favorites',
      data: {
        user: user.id,
        story: story.id,
      },
      overrideAccess: false,
      req: { user },
    })

    expect(favorite).toBeDefined()
    expect(favorite.id).toBeDefined()
    expect(favorite.user).toBe(user.id)
    expect(favorite.story).toBe(story.id)
  })

  it('duplicate favorite for same user and story is rejected', async () => {
    const user = await createTestUser()
    const story = await createTestStory()

    // First create succeeds
    await payload.create({
      collection: 'favorites',
      data: { user: user.id, story: story.id },
      overrideAccess: false,
      req: { user },
    })

    // Second create must fail via beforeValidate hook
    try {
      await payload.create({
        collection: 'favorites',
        data: { user: user.id, story: story.id },
        overrideAccess: false,
        req: { user },
      })
      expect.unreachable('Duplicate favorite should have thrown')
    } catch (error: any) {
      expect(error).toBeDefined()
      expect(error.message || '').toMatch(/already exists/i)
    }
  })

  it('user can read their own favorites', async () => {
    const user = await createTestUser()
    const story = await createTestStory()

    await payload.create({
      collection: 'favorites',
      data: { user: user.id, story: story.id },
      overrideAccess: false,
      req: { user },
    })

    const result = await payload.find({
      collection: 'favorites',
      overrideAccess: false,
      req: { user },
    })

    expect(result.totalDocs).toBeGreaterThanOrEqual(1)
    const hasOwn = result.docs.some((doc: any) => doc.user === user.id)
    expect(hasOwn).toBe(true)
  })

  it('user cannot read another user favorites', async () => {
    const userA = await createTestUser()
    const userB = await createTestUser()
    const story = await createTestStory()

    // User A creates a favorite
    await payload.create({
      collection: 'favorites',
      data: { user: userA.id, story: story.id },
      overrideAccess: false,
      req: { user: userA },
    })

    // User B queries — should only see B's own favorites
    const result = await payload.find({
      collection: 'favorites',
      overrideAccess: false,
      req: { user: userB },
    })

    // ownerOrAdmin filters to documents where user == current user
    const hasOthers = result.docs.some(
      (doc: any) => typeof doc.user === 'string'
        ? doc.user !== userB.id
        : doc.user?.id !== userB.id,
    )
    expect(hasOthers).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// ReadingProgress
// ---------------------------------------------------------------------------

describe('ReadingProgress', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('rejects unauthenticated user creating reading progress', async () => {
    try {
      await payload.create({
        collection: 'reading-progress',
        data: {
          user: '000000000000000000000000',
          story: '000000000000000000000000',
          progressPercentage: 50,
        },
        overrideAccess: false,
      })
      expect.unreachable('Unauthenticated create should have thrown')
    } catch (error: any) {
      expect(error).toBeDefined()
      expect(error.status || error.statusCode).toBe(401)
    }
  })

  it('authenticated user can create reading progress', async () => {
    const user = await createTestUser()
    const story = await createTestStory()

    const progress = await payload.create({
      collection: 'reading-progress',
      data: {
        user: user.id,
        story: story.id,
        progressPercentage: 42,
      },
      overrideAccess: false,
      req: { user },
    })

    expect(progress).toBeDefined()
    expect(progress.id).toBeDefined()
    expect(progress.user).toBe(user.id)
    expect(progress.story).toBe(story.id)
    expect(progress.progressPercentage).toBe(42)
  })

  it('progressPercentage rejects value less than 0', async () => {
    const user = await createTestUser()
    const story = await createTestStory()

    try {
      await payload.create({
        collection: 'reading-progress',
        data: {
          user: user.id,
          story: story.id,
          progressPercentage: -1,
        },
        overrideAccess: false,
        req: { user },
      })
      expect.unreachable('Negative progressPercentage should have thrown')
    } catch (error: any) {
      expect(error).toBeDefined()
      // Payload validates min:0 on the number field at the API level
      expect(
        error.message || error.errors?.[0]?.message || '',
      ).toMatch(/progressPercentage|minimum|0|validation/i)
    }
  })

  it('progressPercentage rejects value greater than 100', async () => {
    const user = await createTestUser()
    const story = await createTestStory()

    try {
      await payload.create({
        collection: 'reading-progress',
        data: {
          user: user.id,
          story: story.id,
          progressPercentage: 101,
        },
        overrideAccess: false,
        req: { user },
      })
      expect.unreachable('>100 progressPercentage should have thrown')
    } catch (error: any) {
      expect(error).toBeDefined()
      expect(
        error.message || error.errors?.[0]?.message || '',
      ).toMatch(/progressPercentage|maximum|100|validation/i)
    }
  })

  it('duplicate reading progress for same user and story is rejected', async () => {
    const user = await createTestUser()
    const story = await createTestStory()

    await payload.create({
      collection: 'reading-progress',
      data: { user: user.id, story: story.id, progressPercentage: 10 },
      overrideAccess: false,
      req: { user },
    })

    try {
      await payload.create({
        collection: 'reading-progress',
        data: { user: user.id, story: story.id, progressPercentage: 20 },
        overrideAccess: false,
        req: { user },
      })
      expect.unreachable('Duplicate progress should have thrown')
    } catch (error: any) {
      expect(error).toBeDefined()
      expect(error.message || '').toMatch(/already exists/i)
    }
  })

  it('owner-only access is enforced', async () => {
    const userA = await createTestUser()
    const userB = await createTestUser()
    const story = await createTestStory()

    await payload.create({
      collection: 'reading-progress',
      data: { user: userA.id, story: story.id, progressPercentage: 30 },
      overrideAccess: false,
      req: { user: userA },
    })

    // User B queries — should only see B's own progress records
    const result = await payload.find({
      collection: 'reading-progress',
      overrideAccess: false,
      req: { user: userB },
    })

    const hasOthers = result.docs.some(
      (doc: any) => typeof doc.user === 'string'
        ? doc.user !== userB.id
        : doc.user?.id !== userB.id,
    )
    expect(hasOthers).toBe(false)
  })
})
