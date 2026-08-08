import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ slug: string; chapterNumber: string }>
}

const queryChapter = cache(async (slug: string, chapterNumber: number) => {
  const payload = await getPayload({ config: configPromise })

  // First, find the story by slug
  const storyResult = await payload.find({
    collection: 'stories',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [
        { slug: { equals: slug } },
        { contentStatus: { equals: 'published' } },
      ],
    },
  })

  const story = storyResult.docs[0]
  if (!story) return null

  // Find the chapter
  const chapterResult = await payload.find({
    collection: 'chapters',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [
        { story: { equals: story.id } },
        { chapterNumber: { equals: chapterNumber } },
        { status: { equals: 'published' } },
      ],
    },
  })

  return { chapter: chapterResult.docs[0] ?? null, story }
})

const queryAdjacentChapters = cache(async (storyId: number, currentChapterNumber: number) => {
  const payload = await getPayload({ config: configPromise })

  // Previous chapter
  const prevResult = await payload.find({
    collection: 'chapters',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [
        { story: { equals: storyId } },
        { chapterNumber: { less_than: currentChapterNumber } },
        { status: { equals: 'published' } },
      ],
    },
    sort: '-chapterNumber',
    select: { chapterNumber: true, titleAr: true },
  })

  // Next chapter
  const nextResult = await payload.find({
    collection: 'chapters',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [
        { story: { equals: storyId } },
        { chapterNumber: { greater_than: currentChapterNumber } },
        { status: { equals: 'published' } },
      ],
    },
    sort: 'chapterNumber',
    select: { chapterNumber: true, titleAr: true },
  })

  return {
    prev: prevResult.docs[0] ?? null,
    next: nextResult.docs[0] ?? null,
  }
})

const queryApprovedComments = cache(async (chapterId: number) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'comments',
    depth: 1,
    limit: 50,
    overrideAccess: false,
    where: {
      and: [
        { chapter: { equals: chapterId } },
        { status: { equals: 'approved' } },
      ],
    },
    sort: '-createdAt',
  })

  return result.docs
})

export default async function ChapterReaderPage({ params: paramsPromise }: Args) {
  const { slug, chapterNumber } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const num = parseInt(chapterNumber, 10)

  if (isNaN(num) || num < 1) {
    notFound()
  }

  const result = await queryChapter(decodedSlug, num)
  if (!result) {
    notFound()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { chapter, story } = result as any
  if (!chapter) {
    notFound()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { prev, next } = await queryAdjacentChapters(story.id, num) as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comments = await queryApprovedComments(chapter.id) as any[]

  const bodyAr = chapter.bodyAr
  const chapterTitle = chapter.titleAr || `الفصل ${num}`
  const _totalChapters = story.totalChapters

  // Calculate reading progress
  const totalPublishedResult = await getPayload({ config: configPromise }).then((p) =>
    p.find({
      collection: 'chapters',
      depth: 0,
      limit: 200,
      overrideAccess: false,
      where: {
        and: [
          { story: { equals: story.id } },
          { status: { equals: 'published' } },
        ],
      },
      select: { chapterNumber: true },
      sort: 'chapterNumber',
    }),
  )
  const totalPublishedChapters = totalPublishedResult.totalDocs
  const progressPercent =
    totalPublishedChapters > 0
      ? Math.round((num / totalPublishedChapters) * 100)
      : 0

  // Helper to render rich text as plain text for comments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderRichTextPlain = (body: any): string => {
    if (!body) return ''
    try {
      const data = typeof body === 'string' ? JSON.parse(body) : body
      if (data?.root?.children) {
        return data.root.children
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((p: any) => p.children?.map((c: any) => c.text || '').join('') || '')
          .join(' ')
          .trim()
      }
    } catch {
      return ''
    }
    return ''
  }

  return (
    <main className="min-h-screen">
      {/* Reading Progress Bar */}
      <div className="sticky top-0 z-10 w-full bg-background">
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container pt-4 pb-2">
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            الرئيسية
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/stories/${story.slug}`}
            className="hover:text-foreground transition-colors"
          >
            {story.titleAr}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium truncate">
            {chapterTitle}
          </span>
        </nav>
      </div>

      {/* Chapter Navigation Top */}
      <div className="container py-4">
        <div className="flex items-center justify-between gap-4">
          {prev ? (
            <Link
              href={`/stories/${story.slug}/chapters/${prev.chapterNumber}`}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors px-4 py-2 rounded-lg border border-border hover:border-primary/50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ transform: 'scaleX(-1)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="hidden sm:inline">الفصل السابق</span>
            </Link>
          ) : (
            <div />
          )}

          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              {chapterTitle}
            </h1>
            {story.titleAr && (
              <p className="text-sm text-muted-foreground mt-1">{story.titleAr}</p>
            )}
          </div>

          {next ? (
            <Link
              href={`/stories/${story.slug}/chapters/${next.chapterNumber}`}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors px-4 py-2 rounded-lg border border-border hover:border-primary/50"
            >
              <span className="hidden sm:inline">الفصل التالي</span>
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ transform: 'scaleX(-1)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* Chapter Body */}
      <article className="container py-6">
        <div className="max-w-3xl mx-auto">
          {bodyAr ? (
            <div className="reader-content prose dark:prose-invert prose-lg max-w-none text-foreground">
              <RichText data={bodyAr} enableGutter={false} />
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground bg-card rounded-lg border">
              <p>محتوى الفصل غير متوفر.</p>
            </div>
          )}
        </div>
      </article>

      {/* Chapter Navigation Bottom */}
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-4 pb-8 border-b border-border">
            {prev ? (
              <Link
                href={`/stories/${story.slug}/chapters/${prev.chapterNumber}`}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors px-5 py-3 rounded-lg border border-border hover:border-primary/50"
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ transform: 'scaleX(-1)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">الفصل السابق</span>
                  <span className="font-medium">
                    {prev.titleAr || `الفصل ${prev.chapterNumber}`}
                  </span>
                </div>
              </Link>
            ) : (
              <div />
            )}

            <Link
              href={`/stories/${story.slug}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              قائمة الفصول
            </Link>

            {next ? (
              <Link
                href={`/stories/${story.slug}/chapters/${next.chapterNumber}`}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors px-5 py-3 rounded-lg border border-border hover:border-primary/50"
              >
                <div className="text-left">
                  <span className="text-xs text-muted-foreground block">الفصل التالي</span>
                  <span className="font-medium">
                    {next.titleAr || `الفصل ${next.chapterNumber}`}
                  </span>
                </div>
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ transform: 'scaleX(-1)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>

      {/* Chapter Info */}
      <div className="container pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap justify-between gap-4 text-sm text-muted-foreground bg-muted/50 rounded-lg px-5 py-4">
            <span>
              الفصل {num}
              {totalPublishedChapters > 0 && ` من ${totalPublishedChapters}`}
            </span>
            {chapter.wordCount != null && <span>{chapter.wordCount} كلمة</span>}
            {chapter.publishedAt && (
              <span>
                نُشر في {new Date(chapter.publishedAt).toLocaleDateString('ar-SA')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <section className="container pb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-foreground mb-6 border-b border-border pb-3">
            التعليقات
            <span className="text-muted-foreground text-base font-normal mr-2">
              ({comments.length})
            </span>
          </h2>

          {comments.length === 0 ? (
            <div className="text-center py-8 bg-card rounded-lg border">
              <p className="text-muted-foreground">لا توجد تعليقات بعد.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {comments.map((comment: any) => (
                <div
                  key={comment.id}
                  className="bg-card rounded-lg border p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                      {(comment.author?.name || comment.author?.email || '?')
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {comment.author?.name || comment.author?.email || 'مستخدم'}
                      </span>
                      <span className="text-xs text-muted-foreground mr-2">
                        {comment.createdAt
                          ? new Date(comment.createdAt).toLocaleDateString('ar-SA')
                          : ''}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed pr-10">
                    {renderRichTextPlain(comment.body)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug, chapterNumber } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const num = parseInt(chapterNumber, 10)

  if (isNaN(num)) {
    return { title: 'غير موجود — KR1688' }
  }

  const result = await queryChapter(decodedSlug, num)

  if (!result?.chapter) {
    return { title: 'غير موجود — KR1688' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chapter = result.chapter as any

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    title: `${chapter.titleAr || `الفصل ${num}`} — ${(result.story as any).titleAr} — KR1688`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    description: chapter.titleAr || `الفصل ${num} من ${(result.story as any).titleAr}`,
  }
}
