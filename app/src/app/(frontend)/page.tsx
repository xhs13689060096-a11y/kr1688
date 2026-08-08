import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

export const dynamic = 'force-dynamic'

type StoryDoc = {
  id: number
  slug: string | null
  titleAr: string
  authorName?: string | null
  genre?: string | null
  tags?: Array<{ tag?: string | null; id?: string | null }> | null
  coverImage?: {
    url?: string | null
    alt?: string | null
  } | null
}

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const { docs: stories } = await payload.find({
    collection: 'stories',
    depth: 1,
    limit: 50,
    overrideAccess: false,
    where: {
      contentStatus: {
        equals: 'published',
      },
    },
    sort: '-publishedAt',
    select: {
      slug: true,
      titleAr: true,
      authorName: true,
      genre: true,
      tags: true,
      coverImage: true,
    },
  })

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-card border-b">
        <div className="container py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            مكتبة القصص العربية
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            اكتشف أجمل القصص العربية المترجمة من الأدب الصيني. اقرأ واستمتع بمغامرات لا تُنسى.
          </p>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="container py-12">
        <h2 className="text-2xl font-semibold text-foreground mb-8">
          القصص المنشورة
          <span className="text-muted-foreground text-lg font-normal mr-3">
            ({stories.length})
          </span>
        </h2>

        {stories.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">لا توجد قصص منشورة حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stories.map((story) => {
              const s = story as unknown as StoryDoc
              const coverUrl = s.coverImage?.url
              const tags = s.tags?.filter((t) => t.tag) ?? []

              return (
                <Link
                  key={s.id}
                  href={`/stories/${s.slug}`}
                  className="group block bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {/* Cover Image */}
                  <div className="aspect-[3/4] bg-muted overflow-hidden">
                    {coverUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={coverUrl}
                        alt={s.titleAr}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <svg
                          className="w-16 h-16"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Story Info */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-lg font-semibold text-foreground line-clamp-2 leading-snug">
                      {s.titleAr}
                    </h3>

                    {s.authorName && (
                      <p className="text-sm text-muted-foreground">{s.authorName}</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {s.genre && (
                        <span className="inline-block text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                          {s.genre}
                        </span>
                      )}
                      {tags.slice(0, 3).map((t, i) => (
                        <span
                          key={t.id ?? i}
                          className="inline-block text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                        >
                          {t.tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export const metadata: Metadata = {
  title: 'المكتبة — KR1688',
  description: 'اكتشف أجمل القصص العربية المترجمة',
}
