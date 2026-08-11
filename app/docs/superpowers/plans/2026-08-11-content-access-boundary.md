# Content Access Boundary Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restrict story and chapter management to administrators and expose only published
content to readers and the public.

**Architecture:** Payload collection access is the enforcement point for every generic API.
Non-admin reads receive `Where` constraints; chapter constraints require both a published
chapter and a published related story. Administrators retain unrestricted collection management.

**Tech Stack:** Payload CMS 4, PostgreSQL, TypeScript, Vitest, GitHub Actions.

## Global Constraints

- Stay on `marvis/ops-01-automated-acceptance`; never alter, merge, or push `main`.
- Use RED → smallest GREEN repair → exact GitHub Actions evidence.
- Do not add author submissions, moderation workflow, payments, search, deployment, Cloudflare,
  real credentials, or Phase 3A.
- Local PostgreSQL absence is diagnostic only; the PostgreSQL GitHub Actions run is the semantic
  evidence.
- Stop after two failed repairs for the same root cause.

---

## File structure

| File | Responsibility |
| --- | --- |
| `src/collections/Stories.ts` | Administrator-only content management and published-only non-admin reads. |
| `src/collections/Chapters.ts` | Administrator-only chapter management and published story/chapter reads. |
| `tests/int/content-access.test.ts` | Generic Payload access proofs for reader, anonymous, and admin contexts. |
| `docs/executor/STATUS.yaml` | Exact RED/GREEN evidence and current acceptance state. |

### Task 1 (E05): Enforce operator-only content and published-only reads

**Files:**
- Modify: `app/src/collections/Stories.ts:8-14`
- Modify: `app/src/collections/Chapters.ts:8-21`
- Create: `app/tests/int/content-access.test.ts`
- Modify: `app/docs/executor/STATUS.yaml`

**Interfaces:**
- Consumes: Payload `CollectionConfig.access` and a user whose `role` is `reader` or `admin`.
- Produces: reader/non-authenticated reads constrained to publication state; administrator-only
  content write operations.

- [ ] **Step 1: Write failing integration tests**

Create a reader and an administrator, then create with `overrideAccess: true`:

```ts
const publicStory = await payload.create({
  collection: 'stories',
  data: { titleAr: 'قصة منشورة', contentStatus: 'published', demoOnly: true },
  overrideAccess: true,
})
const draftStory = await payload.create({
  collection: 'stories',
  data: { titleAr: 'قصة مسودة', contentStatus: 'draft', demoOnly: true },
  overrideAccess: true,
})
const publicChapter = await payload.create({
  collection: 'chapters',
  data: { titleAr: 'فصل منشور', chapterNumber: 1, story: publicStory.id, status: 'published' },
  overrideAccess: true,
})
const draftStoryChapter = await payload.create({
  collection: 'chapters',
  data: { titleAr: 'فصل ضمن مسودة', chapterNumber: 1, story: draftStory.id, status: 'published' },
  overrideAccess: true,
})
const archivedChapter = await payload.create({
  collection: 'chapters',
  data: { titleAr: 'فصل مؤرشف', chapterNumber: 2, story: publicStory.id, status: 'archived' },
  overrideAccess: true,
})

await expect(payload.create({
  collection: 'stories',
  data: { titleAr: 'محاولة قارئ', contentStatus: 'published' },
  req: { user: reader },
  overrideAccess: false,
})).rejects.toThrow()

const publicStories = await payload.find({ collection: 'stories', overrideAccess: false })
expect(publicStories.docs.map((story) => story.id)).toContain(publicStory.id)
expect(publicStories.docs.map((story) => story.id)).not.toContain(draftStory.id)

const readerChapters = await payload.find({
  collection: 'chapters',
  req: { user: reader },
  overrideAccess: false,
})
expect(readerChapters.docs.map((chapter) => chapter.id)).toContain(publicChapter.id)
expect(readerChapters.docs.map((chapter) => chapter.id)).not.toContain(draftStoryChapter.id)
expect(readerChapters.docs.map((chapter) => chapter.id)).not.toContain(archivedChapter.id)
```

Also assert a non-admin update and delete reject, while an administrator can update the draft
story and read it with `overrideAccess: false`.

- [ ] **Step 2: Run RED**

Run: `pnpm test:int -- tests/int/content-access.test.ts --reporter=verbose`

Expected locally: PostgreSQL connection diagnostic. Commit only the new test and push it to
GitHub Actions. Expected exact remote RED: reader story creation, update, and delete resolve;
draft story, draft-story chapter, and archived chapter appear in non-admin reads.

- [ ] **Step 3: Implement the smallest collection access repair**

```ts
const isAdmin = (user: { role?: string } | null | undefined) => user?.role === 'admin'

// Stories access
create: ({ req: { user } }) => isAdmin(user),
update: ({ req: { user } }) => isAdmin(user),
delete: ({ req: { user } }) => isAdmin(user),
read: ({ req: { user } }) => isAdmin(user) || { contentStatus: { equals: 'published' } },

// Chapters access
create: ({ req: { user } }) => isAdmin(user),
update: ({ req: { user } }) => isAdmin(user),
delete: ({ req: { user } }) => isAdmin(user),
read: ({ req: { user } }) => isAdmin(user) || {
  and: [
    { status: { equals: 'published' } },
    { 'story.contentStatus': { equals: 'published' } },
  ],
},
```

Use the collection-local functions directly; do not create a new service, endpoint, database
column, or publication synchronization hook.

- [ ] **Step 4: Run GREEN and exact remote verification**

Run the focused integration command locally as a diagnostic. Then push the production repair and
require its exact GitHub Actions PostgreSQL quality gate to pass all integration tests, Chrome
E2E tests, lint, build, and guardrails. Inspect any failure log before one minimal repair.

- [ ] **Step 5: Record and commit evidence**

After the exact GREEN SHA succeeds, set `E05: done` in `STATUS.yaml`, record the test-only RED
SHA/run and GREEN SHA/run, set the top-level `head_sha`, `evaluation_sha`, `ci_url`, and
`ci_conclusion` to the GREEN code commit, and set `next_task: E05-final-acceptance-review`.
Keep `acceptance_requested: false` until an independent final reviewer approves. Commit the
status update separately, push it, verify that documentation commit's exact CI, then stop for
Phase 2D final acceptance review.

## Self-review

- Coverage: the one task covers generic writes, generic public/reader reads, the related-story
  publication boundary, and retained admin operation.
- Scope: it changes only access rules and their proof; no product feature or external system is
  added.
- Consistency: all reader helpers use access-respecting local API calls, so their existing
  published-content checks remain compatible with the new collection boundary.
