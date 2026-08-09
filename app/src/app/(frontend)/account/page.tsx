import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { requireReader } from '@/utilities/readerRequest'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  let context
  try {
    context = await requireReader(new Request('http://localhost/account', { headers: await headers() }))
  } catch {
    redirect('/login')
  }

  const [progress, favorites] = await Promise.all([
    context.payload.find({ collection: 'reading-progress', req: context.req, overrideAccess: false, depth: 1, limit: 1, sort: '-lastReadAt', where: { completed: { not_equals: true } } }),
    context.payload.find({ collection: 'favorites', req: context.req, overrideAccess: false, depth: 1, limit: 50, sort: '-createdAt' }),
  ])
  const current = progress.docs[0] as any

  return (
    <main className="container py-12 space-y-10">
      <h1 className="text-3xl font-bold">حسابي</h1>
      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">تابع القراءة</h2>
        {current?.story?.slug && current?.chapter?.chapterNumber ? <Link className="mt-4 inline-block text-primary underline" href={`/stories/${current.story.slug}/chapters/${current.chapter.chapterNumber}`}>متابعة القراءة</Link> : <p className="mt-3 text-muted-foreground">لم تبدأ القراءة بعد.</p>}
      </section>
      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">قصصي المفضلة</h2>
        {favorites.docs.length === 0 ? <p className="mt-3 text-muted-foreground">لا توجد قصص مفضلة بعد.</p> : <ul className="mt-4 space-y-2">{favorites.docs.map((favorite: any) => favorite.story?.slug && <li key={favorite.id}><Link className="text-primary underline" href={`/stories/${favorite.story.slug}`}>{favorite.story.titleAr}</Link></li>)}</ul>}
      </section>
    </main>
  )
}
