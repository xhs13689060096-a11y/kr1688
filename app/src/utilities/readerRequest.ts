import configPromise from '@payload-config'
import { createLocalReq, getPayload, type Payload, type PayloadRequest } from 'payload'

import type { User } from '@/payload-types'

export type ReaderRequestContext = {
  payload: Payload
  req: PayloadRequest
  user: User
}

export function assertReaderRole(user: User): void {
  if (user.role !== 'reader') {
    throw new Error('Reader role required')
  }
}

export async function requireReader(request: Request): Promise<ReaderRequestContext> {
  const payload = await getPayload({ config: configPromise })
  const auth = await payload.auth({ headers: request.headers })

  if (!auth.user) {
    throw new Error('Authentication required')
  }

  const user = auth.user as User
  assertReaderRole(user)
  const req = await createLocalReq({ req: { headers: request.headers }, user }, payload)
  return { payload, req, user }
}
