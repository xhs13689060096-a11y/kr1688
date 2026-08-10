import type { Comment } from '@/payload-types'
import type { ReaderRequestContext } from '@/utilities/readerRequest'

type PublishedCommentInput = {
  chapterId: unknown
  body: unknown
}

type PublishedCommentData = Omit<Comment, 'id' | 'updatedAt' | 'createdAt' | 'author'>

const protectedReaderCommentInputFields = ['author', 'story', 'chapter', 'parent', 'status'] as const
const allowedReaderCommentInputFields = new Set(['chapterId', 'body'])

function assertPublishedCommentInput(input: unknown): asserts input is PublishedCommentInput {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Invalid comment')
  }

  for (const field of protectedReaderCommentInputFields) {
    if (Object.hasOwn(input, field)) {
      throw new Error(`Readers cannot provide comment field: ${field}`)
    }
  }

  for (const field of Object.keys(input)) {
    if (!allowedReaderCommentInputFields.has(field)) {
      throw new Error('Invalid comment')
    }
  }
}

export async function createPublishedComment(
  context: ReaderRequestContext,
  input: unknown,
) {
  assertPublishedCommentInput(input)
  const chapterId = input.chapterId
  const body = input.body
  if (
    typeof chapterId !== 'number' ||
    !Number.isInteger(chapterId) ||
    chapterId < 1 ||
    typeof body !== 'string' ||
    body.trim().length < 1 ||
    body.trim().length > 2000
  ) {
    throw new Error('Invalid comment')
  }

  const chapter = await context.payload.findByID({
    collection: 'chapters',
    id: chapterId,
    req: context.req,
    overrideAccess: false,
    depth: 0,
  })
  if (chapter.status !== 'published') {
    throw new Error('Published chapter required')
  }
  const storyId = typeof chapter.story === 'object' ? chapter.story.id : chapter.story
  const story = await context.payload.findByID({
    collection: 'stories',
    id: storyId,
    req: context.req,
    overrideAccess: false,
    depth: 0,
  })
  if (story.contentStatus !== 'published') {
    throw new Error('Published chapter required')
  }
  const data: PublishedCommentData = {
    story: story.id,
    chapter: chapter.id,
    body: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: body.trim(),
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                version: 1,
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
  }

  // `author` and `status` are intentionally absent. The Comments beforeValidate
  // hook derives the author from context.req.user and publishes reader comments.
  // Payload's generated document type does not model that hook, so this is the sole
  // typed boundary.
  return (await context.payload.create({
    collection: 'comments',
    draft: false,
    req: context.req,
    overrideAccess: false,
    data,
  } as never)) as Comment
}
