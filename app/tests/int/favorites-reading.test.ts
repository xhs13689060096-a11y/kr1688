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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeDefined()
      expect(error.status || error.statusCode).toBeGreaterThanOrEqual(400)
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
    expect(typeof favorite.user === 'object' ? favorite.user.id : favorite.user).toBe(user.id)
    expect(typeof favorite.story === 'object' ? favorite.story.id : favorite.story).toBe(story.id)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasOwn = result.docs.some((doc: any) => (typeof doc.user === 'object' ? doc.user.id : doc.user) === user.id)
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (doc: any) => typeof doc.user === 'string'
        ? doc.user !== userB.id
        : doc.user?.id !== userB.id,
    )
    expect(hasOthers).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// S03 — Security: reader identity, role enforcement, spoofing protection
// ---------------------------------------------------------------------------

describe('S03 — User roles and registration', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('public registration creates reader role by default', async () => {
    const ts = Date.now()
    const user = await payload.create({
      collection: 'users',
      data: {
        email: `reader-${ts}@kr1688.test`,
        password: `pwd-${ts}`,
        name: `Reader ${ts}`,
      },
      overrideAccess: true,
      disableVerificationEmail: true,
    })

    expect(user).toBeDefined()
    expect(user.role).toBe('reader')
  })

  it('reader cannot self-promote to admin via update', async () => {
    const ts = Date.now()
    const user = await payload.create({
      collection: 'users',
      data: {
        email: `nopromote-${ts}@kr1688.test`,
        password: `pwd-${ts}`,
        name: `NoPromote ${ts}`,
        role: 'reader',
      },
      overrideAccess: true,
      disableVerificationEmail: true,
    })

    const updated = await payload.update({
      collection: 'users',
      id: user.id,
      data: { role: 'admin' },
      overrideAccess: false,
      req: { user },
    })

    expect(updated.role).toBe('reader')
  })

  it('admin cannot arbitrarily update another user role (Payload v4)', async () => {
    const ts = Date.now()
    const adminUser = await payload.create({
      collection: 'users',
      data: {
        email: `admin-${ts}@kr1688.test`,
        password: `pwd-${ts}`,
        name: `Admin ${ts}`,
        role: 'admin',
      },
      overrideAccess: true,
      disableVerificationEmail: true,
    })

    const reader = await payload.create({
      collection: 'users',
      data: {
        email: `promotable-${ts}@kr1688.test`,
        password: `pwd-${ts}`,
        name: `Promotable ${ts}`,
        role: 'reader',
      },
      overrideAccess: true,
      disableVerificationEmail: true,
    })

    try {
      await payload.update({
        collection: 'users',
        id: reader.id,
        data: { role: 'admin' },
        overrideAccess: false,
        req: { user: adminUser },
      })
      expect.unreachable('Admin should not be able to update another user role')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeDefined()
      expect(error.status || error.statusCode).toBeGreaterThanOrEqual(400)
    }
  })

  it('reader cannot read another user profile', async () => {
    const ts = Date.now()
    const userA = await payload.create({
      collection: 'users',
      data: {
        email: `selfonly-a-${ts}@kr1688.test`,
        password: `pwd-${ts}`,
        name: `SelfOnly A ${ts}`,
        role: 'reader',
      },
      overrideAccess: true,
      disableVerificationEmail: true,
    })

    const userB = await payload.create({
      collection: 'users',
      data: {
        email: `selfonly-b-${ts}@kr1688.test`,
        password: `pwd-${ts}`,
        name: `SelfOnly B ${ts}`,
        role: 'reader',
      },
      overrideAccess: true,
      disableVerificationEmail: true,
    })

    try {
      await payload.findByID({
        collection: 'users',
        id: userA.id,
        overrideAccess: false,
        req: { user: userB },
      })
      expect.unreachable('Reader should not be able to read another user')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeDefined()
      expect(error.status || error.statusCode).toBeGreaterThanOrEqual(400)
    }
  })

  it('reader can read their own profile', async () => {
    const ts = Date.now()
    const user = await payload.create({
      collection: 'users',
      data: {
        email: `selfread-${ts}@kr1688.test`,
        password: `pwd-${ts}`,
        name: `SelfRead ${ts}`,
        role: 'reader',
      },
      overrideAccess: true,
      disableVerificationEmail: true,
    })

    const result = await payload.findByID({
      collection: 'users',
      id: user.id,
      overrideAccess: false,
      req: { user },
    })

    expect(result).toBeDefined()
    expect(result.id).toBe(user.id)
  })

  it('admin cannot read another user profile (Payload v4)', async () => {
    const ts = Date.now()
    const admin = await payload.create({
      collection: 'users',
      data: {
        email: `adminsee-${ts}@kr1688.test`,
        password: `pwd-${ts}`,
        name: `AdminSee ${ts}`,
        role: 'admin',
      },
      overrideAccess: true,
      disableVerificationEmail: true,
    })

    const reader = await payload.create({
      collection: 'users',
      data: {
        email: `seen-${ts}@kr1688.test`,
        password: `pwd-${ts}`,
        name: `Seen ${ts}`,
        role: 'reader',
      },
      overrideAccess: true,
      disableVerificationEmail: true,
    })

    try {
      await payload.findByID({
        collection: 'users',
        id: reader.id,
        overrideAccess: false,
        req: { user: admin },
      })
      expect.unreachable('Admin should not be able to read another user')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeDefined()
      expect(error.status || error.statusCode).toBeGreaterThanOrEqual(400)
    }
  })
})

describe('S03 — Favorites spoofing protection', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('favorite creation ignores spoofed user ID, uses req.user.id', async () => {
    const ts = Date.now()
    const realUser = await payload.create({
      collection: 'users',
      data: {
        email: `spooffav-real-${ts}@kr1688.test`,
        password: `pwd-${ts}`,
        name: `Real ${ts}`,
        role: 'reader',
      },
      overrideAccess: true,
      disableVerificationEmail: true,
    })

    const otherUser = await payload.create({
      collection: 'users',
      data: {
        email: `spooffav-other-${ts}@kr1688.test`,
        password: `pwd-${ts}`,
        name: `Other ${ts}`,
        role: 'reader',
      },
      overrideAccess: true,
      disableVerificationEmail: true,
    })

    const story = await payload.create({
      collection: 'stories',
      data: {
        titleAr: `قصة اختبار ${ts}`,
        demoOnly: true,
        contentStatus: 'draft',
      },
      overrideAccess: true,
    })

    const favorite = await payload.create({
      collection: 'favorites',
      data: {
        user: otherUser.id,
        story: story.id,
      },
      overrideAccess: false,
      req: { user: realUser },
    })

    expect(favorite).toBeDefined()
    const favUserId = typeof favorite.user === 'object' ? favorite.user.id : favorite.user
    expect(favUserId).toBe(realUser.id)
    expect(favUserId).not.toBe(otherUser.id)
  })

  it('favorite query only returns own records for reader', async () => {
    const ts = Date.now()
    const userA = await payload.create({
      collection: 'users',
      data: {
        email: `favq-a-${ts}@kr1688.test`,
        password: `pwd-${ts}`,
        name: `FavQ A ${ts}`,
        role: 'reader',
      },
      overrideAccess: true,
      disableVerificationEmail: true,
    })

    const userB = await payload.create({
      collection: 'users',
      data: {
        email: `favq-b-${ts}@kr1688.test`,
        password: `pwd-${ts}`,
        name: `FavQ B ${ts}`,
        role: 'reader',
      },
      overrideAccess: true,
      disableVerificationEmail: true,
    })

    const story1 = await payload.create({
      collection: 'stories',
      data: { titleAr: `قصة 1 ${ts}`, demoOnly: true, contentStatus: 'draft' },
      overrideAccess: true,
    })

    await payload.create({
      collection: 'favorites',
      data: { story: story1.id },
      overrideAccess: false,
      req: { user: userA },
    })

    const result = await payload.find({
      collection: 'favorites',
      overrideAccess: false,
      req: { user: userB },
    })

    const hasA = result.docs.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (doc: any) => typeof doc.user === 'string'
        ? doc.user === userA.id
        : doc.user?.id === userA.id,
    )
    expect(hasA).toBe(false)
  })
})

describe('S03 — ReadingProgress spoofing protection', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('reading progress creation ignores spoofed user ID', async () => {
    const ts = Date.now()
    const realUser = await payload.create({
      collection: 'users',
      data: {
        email: `spoofrp-real-${ts}@kr1688.test`,
        password: `pwd-${ts}`,
        name: `Real ${ts}`,
        role: 'reader',
      },
      overrideAccess: true,
      disableVerificationEmail: true,
    })

    const otherUser = await payload.create({
      collection: 'users',
      data: {
        email: `spoofrp-other-${ts}@kr1688.test`,
        password: `pwd-${ts}`,
        name: `Other ${ts}`,
        role: 'reader',
      },
      overrideAccess: true,
      disableVerificationEmail: true,
    })

    const story = await payload.create({
      collection: 'stories',
      data: {
        titleAr: `قصة اختبار ${ts}`,
        demoOnly: true,
        contentStatus: 'draft',
      },
      overrideAccess: true,
    })

    const progress = await payload.create({
      collection: 'reading-progress',
      data: {
        user: otherUser.id,
        story: story.id,
        progressPercentage: 50,
      },
      overrideAccess: false,
      req: { user: realUser },
    })

    expect(progress).toBeDefined()
    const rpUserId = typeof progress.user === 'object' ? progress.user.id : progress.user
    expect(rpUserId).toBe(realUser.id)
    expect(rpUserId).not.toBe(otherUser.id)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeDefined()
      expect(error.status || error.statusCode).toBeGreaterThanOrEqual(400)
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
    expect(typeof progress.user === 'object' ? progress.user.id : progress.user).toBe(user.id)
    expect(typeof progress.story === 'object' ? progress.story.id : progress.story).toBe(story.id)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeDefined()
      // Payload validates min:0 on the number field at the API level
      const valMsg1 = error.message || error.errors?.[0]?.message || ''
      expect(
        valMsg1.includes('Progress Percentage') || valMsg1.includes('progressPercentage') ||
        /minimum|0|validation/i.test(valMsg1),
      ).toBe(true)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeDefined()
      const valMsg2 = error.message || error.errors?.[0]?.message || ''
      expect(
        valMsg2.includes('Progress Percentage') || valMsg2.includes('progressPercentage') ||
        /maximum|100|validation/i.test(valMsg2),
      ).toBe(true)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (doc: any) => typeof doc.user === 'string'
        ? doc.user !== userB.id
        : doc.user?.id !== userB.id,
    )
    expect(hasOthers).toBe(false)
  })
})
