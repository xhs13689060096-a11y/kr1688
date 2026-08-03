import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container py-28 text-center">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>٤٠٤</h1>
        <p className="mb-4">عذراً، الصفحة غير موجودة.</p>
      </div>
      <Button asChild variant="default">
        <Link href="/">العودة إلى الرئيسية</Link>
      </Button>
    </div>
  )
}
