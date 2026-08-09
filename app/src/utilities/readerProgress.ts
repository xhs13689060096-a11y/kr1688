import type { ReaderRequestContext } from '@/utilities/readerRequest'

export type ProgressInput = { storyId: number; chapterId: number; progressPercentage: number }

export function validateProgressInput(input: ProgressInput): void {
  if (!Number.isInteger(input.storyId) || input.storyId < 1 || !Number.isInteger(input.chapterId) || input.chapterId < 1 || !Number.isInteger(input.progressPercentage) || input.progressPercentage < 0 || input.progressPercentage > 100) {
    throw new Error('Invalid progress')
  }
}

export async function saveProgress(context: ReaderRequestContext, input: ProgressInput) {
  validateProgressInput(input)
  const existing = await context.payload.find({ collection: 'reading-progress', req: context.req, overrideAccess: false, where: { and: [{ user: { equals: context.user.id } }, { story: { equals: input.storyId } }] } })
  const data = { user: context.user.id, story: input.storyId, chapter: input.chapterId, progressPercentage: input.progressPercentage, completed: input.progressPercentage === 100, lastReadAt: new Date().toISOString() }
  if (existing.docs[0]) return context.payload.update({ collection: 'reading-progress', id: existing.docs[0].id, req: context.req, overrideAccess: false, data })
  return context.payload.create({ collection: 'reading-progress', draft: false, req: context.req, overrideAccess: false, data })
}
