import { NextResponse } from 'next/server'
import { requireReader } from '@/utilities/readerRequest'

export async function POST(request: Request) {
  try {
    const { chapterId, body } = await request.json()
    if (!Number.isInteger(chapterId) || chapterId < 1 || typeof body !== 'string' || body.trim().length < 1 || body.trim().length > 2000) throw new Error('Invalid comment')
    const context = await requireReader(request)
    const chapter = await context.payload.findByID({ collection: 'chapters', id: chapterId, req: context.req, overrideAccess: false, depth: 0 })
    const comment = await context.payload.create({ collection: 'comments', draft: false, req: context.req, overrideAccess: false, data: { author: context.user.id, story: chapter.story, chapter: chapter.id, body: { root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: body.trim(), detail: 0, format: 0, mode: 'normal', style: '', version: 1 }], direction: null, format: '', indent: 0, textFormat: 0, textStyle: '', version: 1 }], direction: null, format: '', indent: 0, version: 1 } } } })
    return NextResponse.json({ id: comment.id, status: comment.status })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed'
    return NextResponse.json({ error: message }, { status: message === 'Authentication required' ? 401 : 400 })
  }
}
