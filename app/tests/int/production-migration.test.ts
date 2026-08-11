import { createRequire } from 'node:module'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const requiredTables = [
  'users',
  'stories',
  'chapters',
  'comments',
  'media',
  'favorites',
  'reading_progress',
] as const

type PgClient = {
  connect: () => Promise<void>
  end: () => Promise<void>
  query: <Row>(text: string, values: unknown[]) => Promise<{ rows: Row[] }>
}

type PgModule = {
  Client: new (options: { connectionString?: string }) => PgClient
}

const requireFromPostgresAdapter = createRequire(
  createRequire(import.meta.url).resolve('@payloadcms/db-postgres'),
)
const { Client } = requireFromPostgresAdapter('pg') as PgModule
const client = new Client({ connectionString: process.env.DATABASE_URL })

describe('P3A03 — production migration boundary', () => {
  beforeAll(async () => {
    await client.connect()
  })

  afterAll(async () => {
    await client.end()
  })

  it('creates the required application tables before Payload initializes', async () => {
    const result = await client.query<{ table_name: string | null }>(
      `select to_regclass('public.' || required_table)::text as table_name
       from unnest($1::text[]) as required_table`,
      [requiredTables],
    )

    expect(result.rows.map(({ table_name }) => table_name)).toEqual([...requiredTables])
  })
})
