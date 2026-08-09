'use client'

import { useState } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export function FavoriteButton({ storyId }: { storyId: number }) {
  const [favorited, setFavorited] = useState(false)
  const [needsLogin, setNeedsLogin] = useState(false)

  async function toggle() {
    const response = await fetch('/api/reader/favorites', {
      method: favorited ? 'DELETE' : 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ storyId }),
    })
    if (response.status === 401) return setNeedsLogin(true)
    if (response.ok) setFavorited((value) => !value)
  }

  if (needsLogin) return <Link className="text-sm text-primary underline" href="/login">سجّل الدخول لإضافة المفضلة</Link>
  return <Button type="button" variant="outline" aria-pressed={favorited} onClick={toggle}>{favorited ? 'إزالة من المفضلة' : 'أضف إلى المفضلة'}</Button>
}
