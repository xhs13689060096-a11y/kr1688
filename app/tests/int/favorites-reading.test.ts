import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload

/**
 * KR1688 Phase 2B T07 — Favorites & ReadingProgress integration tests.
 *
 * These tests require a running Payload instance with MongoDB.
 * Run with: pnpm test:int
 */

describe('Favorites', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('rejects unauthenticated user creating a favorite', async () => {
    // Attempt to create a favorite without authentication should fail.
    // The `create` access is set to `authenticated`, so an unauthenticated
    // request should be rejected with a 401 or Forbidden error.
    try {
      await payload.create({
        collection: 'favorites',
        data: {
          user: '000000000000000000000000', // dummy ID
          story: '000000000000000000000000', // dummy ID
        },
        overrideAccess: false,
      })
      // If we reach here, the create succeeded — this is a test failure.
      expect.unreachable('Unauthenticated create should have thrown')
    } catch (error: any) {
      expect(error).toBeDefined()
      // Payload throws an APIError with status 401 or 403 for unauthorized access
      expect(error.status || error.statusCode).toBe(401)
    }
  })

  // TODO (skeleton): authenticated user can create a favorite
  it.todo('authenticated user can create a favorite')

  // TODO (skeleton): user can read their own favorites
  it.todo('user can read their own favorites')

  // TODO (skeleton): user cannot read another user favorites
  it.todo('user cannot read another user favorites')

  // TODO (skeleton): duplicate favorite for same user+story is rejected
  it.todo('duplicate favorite for same user and story is rejected')
})

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

  // TODO (skeleton): authenticated user can create reading progress
  it.todo('authenticated user can create reading progress')

  // TODO (skeleton): progressPercentage respects min 0 and max 100
  it.todo('progressPercentage respects min 0 and max 100')

  // TODO (skeleton): duplicate progress for same user+story is rejected
  it.todo('duplicate reading progress for same user and story is rejected')

  // TODO (skeleton): owner-only access is enforced
  it.todo('owner-only access is enforced')
})
