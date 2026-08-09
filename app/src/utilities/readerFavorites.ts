import type { ReaderRequestContext } from '@/utilities/readerRequest'

function assertStoryID(storyId: number): void {
  if (!Number.isInteger(storyId) || storyId < 1) throw new Error('Invalid story ID')
}

export async function createFavorite(context: ReaderRequestContext, storyId: number) {
  assertStoryID(storyId)
  const existing = await context.payload.find({
    collection: 'favorites',
    req: context.req,
    overrideAccess: false,
    where: { and: [{ user: { equals: context.user.id } }, { story: { equals: storyId } }] },
  })
  if (existing.totalDocs > 0) return { favorited: true }
  await context.payload.create({
    collection: 'favorites',
    draft: false,
    req: context.req,
    overrideAccess: false,
    data: { story: storyId, user: context.user.id },
  })
  return { favorited: true }
}

export async function removeFavorite(context: ReaderRequestContext, storyId: number) {
  assertStoryID(storyId)
  await context.payload.delete({
    collection: 'favorites',
    req: context.req,
    overrideAccess: false,
    where: { and: [{ user: { equals: context.user.id } }, { story: { equals: storyId } }] },
  })
  return { favorited: false }
}
