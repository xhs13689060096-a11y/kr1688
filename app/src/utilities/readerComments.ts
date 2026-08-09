import type { Comment } from '@/payload-types'
import type { ReaderRequestContext } from '@/utilities/readerRequest'

type PendingCommentInput = {
  chapterId: unknown
  body: unknown
}

type PendingCommentData = Omit<Comment, 'id' | 'updatedAt' | 'createdAt' | 'author'>

export async function createPendingComment(context: ReaderRequestContext, input: PendingCommentInput) {
  const chapterId = input.chapterId
  const body = input.body
  if (typeof chapterId !== 'number' || !Number.isInteger(chapterId) || chapterId < 1 || typeof body !== 'string' || body.trim().length < 1 || body.trim().length > 2000) {
    throw new Error('Invalid comment')
  }

  const chapter = await context.payload.findByID({
    collection: 'chapters',
    id: chapterId,
    req: context.req,
    overrideAccess: false,
    depth: 0,
  })
  const data: PendingCommentData = {
    story: chapter.story,
    chapter: chapter.id,
    body: {
      root: {
        type: 'root',
        children: [{
          type: 'paragraph',
          children: [{ type: 'text', text: body.trim(), detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
          direction: null,
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          version: 1,
        }],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
  }

  // `author` is intentionally absent. The Comments beforeValidate hook derives it
  // from context.req.user and forces pending status for readers. Payload's generated
  // document type does not model that hook, so this is the sole typed boundary.
  return (await context.payload.create({
    collection: 'comments',
    draft: false,
    req: context.req,
    overrideAccess: false,
    data,
  } as never)) as Comment
}
