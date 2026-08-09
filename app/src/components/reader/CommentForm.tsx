'use client'

import Link from 'next/link'
import { type FormEvent, useState } from 'react'

import { Button } from '@/components/ui/button'

export function CommentForm({ chapterId }: { chapterId: number }) {
  const [message, setMessage] = useState('')
  const [needsLogin, setNeedsLogin] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setMessage('')
    setSubmitting(true)

    try {
      const response = await fetch('/api/reader/comments', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chapterId, body: form.get('body') }),
      })
      if (response.status === 401) return setNeedsLogin(true)
      if (!response.ok) throw new Error('comment failed')
      event.currentTarget.reset()
      setMessage('سيظهر تعليقك بعد المراجعة')
    } catch {
      setMessage('تعذر إرسال التعليق')
    } finally {
      setSubmitting(false)
    }
  }

  if (needsLogin) return <Link className="text-sm text-primary underline" href="/login">سجّل الدخول لإضافة تعليق</Link>

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <label className="block text-sm font-medium" htmlFor="comment-body">أضف تعليقك</label>
      <textarea className="min-h-24 w-full rounded-md border bg-background p-3" id="comment-body" name="body" maxLength={2000} required />
      {message && <p className="text-sm" role="status">{message}</p>}
      <Button type="submit" disabled={submitting}>{submitting ? 'جارٍ الإرسال…' : 'إرسال للمراجعة'}</Button>
    </form>
  )
}
