'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(false)
    setSubmitting(true)

    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      })
      if (!response.ok) throw new Error('login failed')
      router.push('/account')
      router.refresh()
    } catch {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">البريد الإلكتروني</label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">كلمة المرور</label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {error && <p className="text-sm text-destructive" role="alert">تعذر تسجيل الدخول</p>}
      <Button className="w-full" type="submit" disabled={submitting}>
        {submitting ? 'جارٍ تسجيل الدخول…' : 'تسجيل الدخول'}
      </Button>
    </form>
  )
}
