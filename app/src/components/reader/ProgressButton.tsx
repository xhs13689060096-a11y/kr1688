'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

export function ProgressButton({ storyId, chapterId }: { storyId: number; chapterId: number }) {
  const [saved, setSaved] = useState(false)
  const [needsLogin, setNeedsLogin] = useState(false)

  async function saveProgress() {
    const response = await fetch('/api/reader/progress', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ storyId, chapterId, progressPercentage: 100 }),
    })
    if (response.status === 401) return setNeedsLogin(true)
    if (response.ok) setSaved(true)
  }

  if (needsLogin) return <Link className="text-sm text-primary underline" href="/login">سجّل الدخول لحفظ التقدم</Link>
  return <Button type="button" variant="outline" onClick={saveProgress} disabled={saved}>{saved ? 'تم حفظ تقدم القراءة' : 'تمت قراءة الفصل'}</Button>
}
