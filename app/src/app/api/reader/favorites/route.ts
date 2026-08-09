import { NextResponse } from 'next/server'

import { createFavorite, removeFavorite } from '@/utilities/readerFavorites'
import { requireReader } from '@/utilities/readerRequest'

async function storyID(request: Request): Promise<number> {
  const body = await request.json()
  return body?.storyId
}

async function handle(request: Request, operation: typeof createFavorite) {
  try {
    const context = await requireReader(request)
    return NextResponse.json(await operation(context, await storyID(request)))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed'
    return NextResponse.json({ error: message }, { status: message === 'Authentication required' ? 401 : 400 })
  }
}

export async function POST(request: Request) { return handle(request, createFavorite) }
export async function DELETE(request: Request) { return handle(request, removeFavorite) }
