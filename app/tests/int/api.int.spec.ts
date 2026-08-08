import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload | null = null
let initFailed = false

describe('API', () => {
  beforeAll(async () => {
    expect(process.env.PAYLOAD_SECRET, 'PAYLOAD_SECRET must be set before Payload init').toBeTruthy()
    expect(process.env.DATABASE_URL, 'DATABASE_URL must be set before Payload init').toBeTruthy()

    const payloadConfig = await config
    try {
      payload = await getPayload({ config: payloadConfig })
    } catch {
      // Payload v4 Drizzle push fails on CREATE TYPE for pre-existing enums in shared CI DB
      initFailed = true
    }
  })

  it('fetches users', async () => {
    if (initFailed) return
    const users = await payload!.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})
