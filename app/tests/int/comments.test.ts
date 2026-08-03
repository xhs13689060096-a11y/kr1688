import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload

/**
 * KR1688 Phase 2B T08 — Comment integration tests.
 *
 * These tests require a running Payload instance with MongoDB.
 * Run with: pnpm test:int
 */

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
          body: {
            root: {
              children: [
                {
                  children: [{ text: 'This is a test comment.', type: 'text' }],
                  type: 'paragraph',
                },
              ],
              type: 'root',
            },
          },
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
    // Public (unauthenticated) find should apply the read access filter
    // that restricts results to comments with status 'approved'.
    // We test by querying without authentication and verifying
    // any returned comments all have status 'approved'.
    const result = await payload.find({
      collection: 'comments',
      overrideAccess: false,
      limit: 50,
    })

    // Every returned doc must have status 'approved'
    for (const doc of result.docs) {
      expect(doc.status).toBe('approved')
    }
  })

  // TODO (skeleton): authenticated user can create a comment
  it.todo('authenticated user can create a comment')

  // TODO (skeleton): authenticated user can create a reply (one-level)
  it.todo('authenticated user can create a reply to another comment')

  // TODO (skeleton): comment requires story or chapter (validation)
  it.todo('comment without story or chapter fails validation')

  // TODO (skeleton): comment status defaults to pending
  it.todo('comment status defaults to pending')

  // TODO (skeleton): admin can update comment status
  it.todo('admin can update comment status from pending to approved')

  // TODO (skeleton): likeCount defaults to 0
  it.todo('likeCount defaults to 0')

  // TODO (skeleton): aiRecommendation defaults to none
  it.todo('aiRecommendation defaults to none')

  // TODO (skeleton): admin-only fields are not writable by non-admin
  it.todo('non-admin cannot modify likeCount or aiRecommendation')
})
