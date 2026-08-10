# Open Reading and Immediate Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make published reading public and make authenticated reader comments visible immediately, with only reactive operator hide/delete capability.

**Architecture:** Payload remains the sole data source. Story publication uses `draft` or `published`. A server-only comment helper derives the reader and published content context, creates a `published` comment, and public chapter pages query that same state.

**Tech Stack:** Next.js 16 App Router, Payload CMS 4, PostgreSQL, TypeScript, Vitest, Playwright, GitHub Actions.

## Global Constraints

- Stay on `marvis/ops-01-automated-acceptance`; never alter, merge, or push `main`.
- Every behavior uses RED → smallest GREEN repair → exact GitHub Actions evidence.
- Do not add anonymous posting, CAPTCHA, content-policy rules, external services, authors, payment, search, deployment, Cloudflare/R2, SEO, native app, or Phase 3A.
- Published reading is public; a reader logs in only for favorites, progress, and immediate comments.
- Preserve server-derived comment author/context and reject draft story or chapter comments.
- Stop and report after two minimal repairs fail for the same root cause.

---

## File structure

| File | Responsibility |
| --- | --- |
| `src/collections/Stories.ts` | Simple operator-only draft/published choice. |
| `src/collections/Comments.ts` | Immediate public comment state and reactive hide/delete access. |
| `src/utilities/readerComments.ts` | Validated server-only creation of a published comment. |
| `src/app/api/reader/comments/route.ts` | Narrow route returning the created public state. |
| `src/components/reader/CommentForm.tsx` | Arabic immediate-publication success copy. |
| `src/app/(frontend)/stories/[slug]/chapters/[chapterNumber]/page.tsx` | Public published-comment query. |
| `tests/int/reader-loop.test.ts` and `tests/int/comments.test.ts` | Lifecycle, visibility, draft and ownership proof. |
| `tests/e2e/frontend.e2e.spec.ts` | Visible-form submission and refresh proof. |
| `docs/executor/STATUS.yaml` and `docs/executor/OPEN_READING_COMMENTS_REPORT.md` | Exact CI source of truth and final handoff. |

### Task 1 (E01): Simplify operator publishing state

**Files:**
- Modify: `app/src/collections/Stories.ts:10-190`
- Modify: `app/tests/int/reader-loop.test.ts`

**Interfaces:**
- Consumes: public routes and reader helpers querying `contentStatus: 'published'`.
- Produces: `contentStatus: 'draft' | 'published'`.

- [ ] **Step 1: Write the failing test**

```ts
import { Stories } from '@/collections/Stories'

it('offers only draft and published story choices', () => {
  const tabs = (Stories.fields[0] as { tabs: { fields: { name?: string; options?: { value: string }[] }[] }[] }).tabs
  const field = tabs.flatMap((tab) => tab.fields).find((item) => item.name === 'contentStatus')
  expect(field?.options?.map((item) => item.value)).toEqual(['draft', 'published'])
})
```

- [ ] **Step 2: Run RED**

Run: `pnpm test:int -- tests/int/reader-loop.test.ts --reporter=verbose`

Expected: FAIL because the current choices include review, approved, and retired.

- [ ] **Step 3: Write the smallest implementation**

In `Stories.ts`, use this exact option set and remove the no-longer-used editorial, rights, and risk fields:

```ts
options: [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
]
```

Retain `publishedAt`; do not change public query conditions or mutate existing database values.

- [ ] **Step 4: Run focused GREEN**

Run: `pnpm test:int -- tests/int/reader-loop.test.ts --reporter=verbose`

Expected: PASS with exactly two publication choices.

- [ ] **Step 5: Commit and push**

```bash
git add app/src/collections/Stories.ts app/tests/int/reader-loop.test.ts
git commit -m "feat: simplify story publication"
git push origin marvis/ops-01-automated-acceptance
```

### Task 2 (E02): Publish signed-in reader comments immediately

**Files:**
- Modify: `app/src/collections/Comments.ts:5-270`
- Modify: `app/src/utilities/readerComments.ts:1-75`
- Modify: `app/src/app/api/reader/comments/route.ts:1-14`
- Modify: `app/src/components/reader/CommentForm.tsx:1-49`
- Modify: `app/src/app/(frontend)/stories/[slug]/chapters/[chapterNumber]/page.tsx:80-125`
- Modify: `app/tests/int/reader-loop.test.ts`, `app/tests/int/comments.test.ts`, `app/tests/e2e/frontend.e2e.spec.ts`

**Interfaces:**
- Consumes: `requireReader(request)` and a published story/chapter relation.
- Produces: `createPublishedComment(context, { chapterId, body }): Promise<Comment>` and `POST /api/reader/comments` response `{ id, status: 'published' }`.

- [ ] **Step 1: Write failing tests**

```ts
const comment = await createPublishedComment(context, { chapterId: chapter.id, body: 'تعليق ظاهر الآن' })
expect(comment.status).toBe('published')

const publicComments = await payload.find({
  collection: 'comments',
  where: { chapter: { equals: chapter.id }, status: { equals: 'published' } },
  overrideAccess: false,
})
expect(publicComments.docs.map((item) => item.id)).toContain(comment.id)
```

Also prove that an administrator changing the status to `hidden` removes it from the unauthenticated query. In E2E, submit the visible form, expect `نُشر تعليقك`, refresh, and expect the submitted text once.

- [ ] **Step 2: Run RED**

First run `pnpm test:int -- tests/int/reader-loop.test.ts tests/int/comments.test.ts --reporter=verbose` locally only to record the known PostgreSQL diagnostic. Because this machine has no PostgreSQL, it cannot establish semantic RED.

Then commit only the changed E02 tests, push that exact SHA, and wait for its GitHub Actions PostgreSQL quality run:

```bash
git add app/tests/int/reader-loop.test.ts app/tests/int/comments.test.ts app/tests/e2e/frontend.e2e.spec.ts
git commit -m "test: prove immediate comments red"
git push origin marvis/ops-01-automated-acceptance
gh run list --branch marvis/ops-01-automated-acceptance --limit 1 --json headSha,conclusion,url
```

Expected: the exact test-only SHA fails because readers are forced to `pending`, the endpoint returns `pending`, and the UI promises review. Do not write production code until this remote RED evidence exists.

- [ ] **Step 3: Write the smallest implementation**

```ts
// Comments beforeValidate for a reader create
data.author = req.user.id
data.status = 'published'

// public chapter query
{ status: { equals: 'published' } }
```

Rename the helper to `createPublishedComment`. Retain body length and published chapter/story validation. Delete only queue-only fields (`moderationReason`, `likeCount`, `aiRecommendation`) after removing every production reference. Keep browser-protected author, story, chapter, parent, and status. Administrators may hide/delete; readers cannot select a state.

- [ ] **Step 4: Run focused GREEN**

Run: `pnpm test:int -- tests/int/reader-loop.test.ts tests/int/comments.test.ts --reporter=verbose && pnpm test:e2e -- frontend.e2e.spec.ts --reporter=line`

Expected: created reader comment is immediately visible; hidden comments are absent; anonymous posting and draft comments remain rejected.

- [ ] **Step 5: Commit and push**

```bash
git add app/src/collections/Comments.ts app/src/utilities/readerComments.ts app/src/app/api/reader/comments/route.ts app/src/components/reader/CommentForm.tsx app/src/app/'(frontend)'/stories/'[slug]'/chapters/'[chapterNumber]'/page.tsx app/tests/int/reader-loop.test.ts app/tests/int/comments.test.ts app/tests/e2e/frontend.e2e.spec.ts
git commit -m "feat: publish reader comments immediately"
git push origin marvis/ops-01-automated-acceptance
```

### Task 3 (E03): Exact-CI acceptance and truthful handoff

**Files:**
- Modify: `app/docs/executor/STATUS.yaml`
- Create: `app/docs/executor/OPEN_READING_COMMENTS_REPORT.md`
- Modify: an E01/E02 file only for a test-proven CI failure.

**Interfaces:**
- Consumes: the pushed E02 SHA and `.github/workflows/kr1688-quality.yml`.
- Produces: `acceptance_requested` only with an exact-SHA successful Actions URL and actual test counts.

- [ ] **Step 1: Run local diagnostic verifier**

Run: `pnpm verify:ci`

Expected: local PostgreSQL absence may stop it; record it only as diagnostic evidence, never as a pass.

- [ ] **Step 2: Verify the exact pushed SHA in GitHub Actions**

Run: `gh run list --branch marvis/ops-01-automated-acceptance --limit 1 --json databaseId,headSha,status,conclusion,url`

Expected: `headSha` equals E02 and `conclusion` is `success`. On failure, inspect the job log and make at most two focused repairs per root cause.

- [ ] **Step 3: Record verified evidence**

Set `STATUS.yaml` to an open-reading packet only after exact-SHA success. The report names SHA, URL, actual integration/E2E counts, build/lint/guardrails, changed files, and confirms main, deployment, and Phase 3A were untouched.

- [ ] **Step 4: Commit, push, verify, and stop**

```bash
git add app/docs/executor/STATUS.yaml app/docs/executor/OPEN_READING_COMMENTS_REPORT.md
git commit -m "docs: record open reading acceptance"
git push origin marvis/ops-01-automated-acceptance
```

Wait for the exact documentation commit's CI result, then stop for product acceptance.

## Self-review

- Coverage: E01 removes the multi-stage internal publishing process; E02 implements immediate logged-in comments and reactive hiding; E03 requires exact CI evidence.
- Scope: no anonymous posts, legal/religious policy layer, external service, deployment, Phase 3A, or excluded product area appears.
- Consistency: public pages, reader helper, API response, UI copy, integration tests, and E2E all use the shared `published` comment state.
