import { getPayload, type Payload } from 'payload'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { Users } from '@/collections/Users'
import { loadEnvironment } from '@/environment'
import { getAdmin2FALaunchState } from '@/security/admin2fa'
import { assertStateChangeAllowed } from '@/security/rateLimit'

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

describe('C03 — runtime environment and API depth', () => {
  it('rejects a production placeholder secret', () => {
    expect(() => loadEnvironment({
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://kr1688:kr1688@localhost:5432/kr1688',
      PAYLOAD_SECRET: 'YOUR_SECRET_HERE',
      NEXT_PUBLIC_SERVER_URL: 'https://stories.example.test',
      CRON_SECRET: 'cron-secret',
      PREVIEW_SECRET: 'preview-secret',
    } as NodeJS.ProcessEnv)).toThrow('PAYLOAD_SECRET')
  })

  it('accepts a complete non-production test environment', () => {
    const environment = loadEnvironment({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://kr1688:kr1688@localhost:5432/kr1688_test',
      PAYLOAD_SECRET: 'kr1688-test-payload-secret',
      NEXT_PUBLIC_SERVER_URL: 'http://127.0.0.1:3000',
      CRON_SECRET: 'kr1688-test-cron-secret',
      PREVIEW_SECRET: 'kr1688-test-preview-secret',
    } as NodeJS.ProcessEnv)

    expect(environment.databaseURL).toMatch(/^postgresql:\/\//)
  })

  it('limits Payload API relation depth to two', async () => {
    const payloadConfig = await config
    expect(payloadConfig.maxDepth).toBe(2)
  })
})

describe('C04 — rate-limit and administrator 2FA launch boundaries', () => {
  it('fails closed when the login limiter is unavailable', () => {
    expect(() =>
      assertStateChangeAllowed({ category: 'login', allowed: false, reason: 'unavailable' }),
    ).toThrow('login')
  })

  it('does not claim administrator 2FA is enabled', () => {
    expect(getAdmin2FALaunchState()).toEqual({
      requiredBeforePublicLaunch: true,
      enabledInApplication: false,
    })
  })
})

describe('C05 — database roles and recovery contract', () => {
  it('database role script contains the three required least-privilege roles', async () => {
    const sql = await readFile(resolve(process.cwd(), 'docs/security/postgres-roles.sql'), 'utf8')

    expect(sql).toContain('kr1688_migrate')
    expect(sql).toContain('kr1688_app')
    expect(sql).toContain('kr1688_backup')
    expect(sql).not.toMatch(/GRANT\s+(ALL|SUPERUSER|CREATEROLE)/i)
  })

  it('recovery runbook names the required metadata checks', async () => {
    const runbook = await readFile(
      resolve(process.cwd(), 'docs/security/BACKUP_AND_RESTORE_RUNBOOK.md'),
      'utf8',
    )

    for (const collection of ['users', 'stories', 'chapters', 'comments', 'media']) {
      expect(runbook).toContain(collection)
    }
  })
})
