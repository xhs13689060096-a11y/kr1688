import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { Users } from '@/collections/Users'

let payload: Payload

function uniqueEmail() {
  return `security-auth-${Date.now()}-${Math.random().toString(16).slice(2)}@kr1688.test`
}

export function assertPublicUserPayload(value: unknown): void {
  expect(value).toBeTypeOf('object')
  expect(value).not.toHaveProperty('password')
  expect(value).not.toHaveProperty('hash')
  expect(value).not.toHaveProperty('loginAttempts')
  expect(value).not.toHaveProperty('lockUntil')
}

describe('C01 — authentication and public reader registration', () => {
  it('explicitly configures verification, lockout, and finite token lifetime', () => {
    expect(Users.auth?.verify).not.toBe(false)
    expect(Users.auth).toMatchObject({
      maxLoginAttempts: 5,
      lockTime: 900000,
      tokenExpiration: 7200,
    })
  })

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('public registration ignores an attempted admin role', async () => {
    const user = await payload.create({
      collection: 'users',
      data: {
        email: uniqueEmail(),
        password: 'reader-only-password',
        role: 'admin',
      },
      overrideAccess: false,
      disableVerificationEmail: true,
    })

    expect(user.role).toBe('reader')
    assertPublicUserPayload(user)
  })

  it('locks an email after five failed passwords without disclosing protected fields', async () => {
    const email = uniqueEmail()
    const password = 'correct-reader-password'
    await payload.create({
      collection: 'users',
      data: { email, password, role: 'reader', _verified: true },
      overrideAccess: true,
      disableVerificationEmail: true,
    })

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(
        payload.login({ collection: 'users', data: { email, password: 'wrong-password' } }),
      ).rejects.toThrow()
    }

    await expect(
      payload.login({ collection: 'users', data: { email, password } }),
    ).rejects.toThrow()
  })
})
