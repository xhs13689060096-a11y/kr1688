import { describe, expect, it } from 'vitest'

import { requireReader } from '@/utilities/readerRequest'
import { createFavorite, removeFavorite } from '@/utilities/readerFavorites'
import { validateProgressInput } from '@/utilities/readerProgress'

describe('D01 — reader request boundary', () => {
  it('rejects an anonymous request without revealing authentication details', async () => {
    await expect(requireReader(new Request('http://localhost/reader'))).rejects.toThrow(
      'Authentication required',
    )
  })
})

describe('D03 — reader progress', () => {
  it('accepts only bounded integer progress values', () => {
    expect(() => validateProgressInput({ storyId: 1, chapterId: 2, progressPercentage: 100 })).not.toThrow()
    expect(() => validateProgressInput({ storyId: 1, chapterId: 2, progressPercentage: 101 })).toThrow('Invalid progress')
  })
})

describe('D02 — reader favorites', () => {
  it('rejects non-positive story identifiers before any favorite operation', async () => {
    await expect(createFavorite({} as never, 0)).rejects.toThrow('Invalid story ID')
    await expect(removeFavorite({} as never, -1)).rejects.toThrow('Invalid story ID')
  })
})
