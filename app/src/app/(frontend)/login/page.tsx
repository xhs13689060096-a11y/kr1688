import { LoginForm } from '@/components/reader/LoginForm'

export const dynamic = 'force-dynamic'

export default function ReaderLoginPage() {
  return (
    <main className="container py-16">
      <section className="mx-auto max-w-md rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold">تسجيل دخول القارئ</h1>
        <p className="mt-2 text-sm text-muted-foreground">تابع القراءة واحفظ قصصك المفضلة.</p>
        <div className="mt-6"><LoginForm /></div>
      </section>
    </main>
  )
}
