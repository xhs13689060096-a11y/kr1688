import { describe, expect, it } from 'vitest'

import { requireReader } from '@/utilities/readerRequest'

describe('D01 — reader request boundary', () => {
  it('rejects an anonymous request without revealing authentication details', async () => {
    await expect(requireReader(new Request('http://localhost/reader'))).rejects.toThrow(
      'Authentication required',
    )
  })
})
