import { NextResponse } from 'next/server'
import { createPendingComment } from '@/utilities/readerComments'
import { requireReader } from '@/utilities/readerRequest'

export async function POST(request: Request) {
  try {
    const context = await requireReader(request)
    const comment = await createPendingComment(context, await request.json())
    return NextResponse.json({ id: comment.id, status: comment.status })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed'
    return NextResponse.json({ error: message }, { status: message === 'Authentication required' ? 401 : 400 })
  }
}
