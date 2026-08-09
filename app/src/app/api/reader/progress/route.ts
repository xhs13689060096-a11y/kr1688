import { NextResponse } from 'next/server'
import { saveProgress } from '@/utilities/readerProgress'
import { requireReader } from '@/utilities/readerRequest'

export async function POST(request: Request) {
  try {
    const context = await requireReader(request)
    return NextResponse.json(await saveProgress(context, await request.json()))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed'
    return NextResponse.json({ error: message }, { status: message === 'Authentication required' ? 401 : 400 })
  }
}
