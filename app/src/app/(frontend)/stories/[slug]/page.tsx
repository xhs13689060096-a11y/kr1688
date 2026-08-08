import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ slug: string }>
}

const queryStoryBySlug = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'stories',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [
        { slug: { equals: slug } },
        { contentStatus: { equals: 'published' } },
      ],
    },
  })

  return result.docs[0] ?? null
})

const queryPublishedChapters = cache(async (storyId: number) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'chapters',
    depth: 0,
    limit: 200,
    overrideAccess: false,
    where: {
      and: [
        { story: { equals: storyId } },
        { status: { equals: 'published' } },
      ],
    },
    sort: 'chapterNumber',
    select: {
      id: true,
      titleAr: true,
      chapterNumber: true,
      wordCount: true,
      publishedAt: true,
    },
  })

  return result.docs
})

export default async function StoryDetailPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const story = await queryStoryBySlug(decodedSlug) as any

  if (!story) {
    notFound()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chapters = await queryPublishedChapters(story.id) as any[]
  const coverUrl = story.coverImage?.url
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tags = (story.tags ?? []).filter((t: any) => t.tag)
  const synopsisAr = story.synopsisAr

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <div className="container pt-6 pb-2">
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            الرئيسية
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium truncate">
            {story.titleAr}
          </span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="bg-card border-b">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover Image */}
            <div className="flex-shrink-0 w-full md:w-64">
              <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={story.titleAr}
                    className="w-full h-full object-cover"
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
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {story.titleAr}
              </h1>

              {story.titleZh && (
                <p className="text-base text-muted-foreground">
                  <span className="font-medium">العنوان الصيني:</span> {story.titleZh}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {story.authorName && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {story.authorName}
                  </span>
                )}
                {story.totalChapters != null && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {story.totalChapters} فصل
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {story.genre && (
                  <span className="inline-block text-sm px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {story.genre}
                  </span>
                )}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {tags.map((t: any, i: number) => (
                  <span
                    key={t.id ?? i}
                    className="inline-block text-sm px-3 py-1 rounded-full bg-muted text-muted-foreground"
                  >
                    {t.tag}
                  </span>
                ))}
              </div>

              {synopsisAr && (
                <div className="pt-4 border-t border-border">
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    نبذة عن القصة
                  </h2>
                  <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                    <RichText data={synopsisAr} enableGutter={false} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Chapters List */}
      <section className="container py-10">
        <h2 className="text-2xl font-semibold text-foreground mb-6">
          قائمة الفصول
          <span className="text-muted-foreground text-lg font-normal mr-3">
            ({chapters.length})
          </span>
        </h2>

        {chapters.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <p className="text-muted-foreground">لا توجد فصول منشورة بعد.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {chapters.map((chapter: any) => (
              <Link
                key={chapter.id}
                href={`/stories/${story.slug}/chapters/${chapter.chapterNumber}`}
                className="flex items-center justify-between p-4 bg-card rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    {chapter.chapterNumber}
                  </span>
                  <div>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {chapter.titleAr || `الفصل ${chapter.chapterNumber}`}
                    </h3>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                      {chapter.wordCount != null && (
                        <span>{chapter.wordCount} كلمة</span>
                      )}
                      {chapter.publishedAt && (
                        <span>
                          {new Date(chapter.publishedAt).toLocaleDateString('ar-SA')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ transform: 'scaleX(-1)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const story = await queryStoryBySlug(decodedSlug) as any

  if (!story) {
    return { title: 'غير موجود — KR1688' }
  }

  return {
    title: `${story.titleAr} — KR1688`,
    description: story.titleAr,
  }
}
