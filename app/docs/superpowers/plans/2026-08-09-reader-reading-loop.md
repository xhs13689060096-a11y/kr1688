# Reader Reading Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give an authenticated Arabic reader a safe account page, favorites, resume reading, progress saving, and pending comment submission.

**Architecture:** Next.js server-only route handlers authenticate the request through Payload and call the existing collections with `overrideAccess: false`. Small client controls call those handlers; the account and reading pages render RTL Arabic state from Payload. Existing collection hooks remain the authorization authority.

**Tech Stack:** Next.js 16 App Router, Payload CMS 4, PostgreSQL, TypeScript, Vitest, Playwright, GitHub Actions.

## Global Constraints

- Stay on `marvis/ops-01-automated-acceptance`; never alter or merge `main`.
- Every behavior is RED → minimal GREEN → exact GitHub Actions verification.
- Do not add payment, search, recommendation, author upload/revenue, deployment, Cloudflare, R2, production credentials, sitemap, RSS, JSON-LD, IndexNow, or native app work.
- Local PostgreSQL absence is not a passing result; GitHub Actions PostgreSQL is required.
- State changes derive the reader from request authentication, never from a browser user ID.

---

## File structure

| File | Responsibility |
|---|---|
| `src/utilities/readerRequest.ts` | Authenticate a request and reject non-reader state changes. |
| `src/app/api/reader/*/route.ts` | Favorite, progress, and pending-comment routes. |
| `src/app/(frontend)/account/page.tsx` | RTL reader account: continue reading, favorites, empty states. |
| `src/components/reader/*` | Accessible client controls with Arabic status messages. |
| `tests/int/reader-loop.test.ts` | Local-API ownership and lifecycle proof. |
| `tests/e2e/frontend.e2e.spec.ts` | Anonymous public reading and signed-in reader journey. |

### Task D01: Reader request boundary and route contracts

**Files:** Create `src/utilities/readerRequest.ts`, `tests/int/reader-loop.test.ts`; modify `src/payload.config.ts` only if a route registration is required.

**Interfaces:**

```ts
export type ReaderRequestContext = { payload: Payload; user: User }
export async function requireReader(request: Request): Promise<ReaderRequestContext>
```

- [ ] **Step 1: Write failing tests** proving an anonymous request rejects and an authenticated reader context contains only that reader identity.
- [ ] **Step 2: Run RED**

`pnpm test:int -- tests/int/reader-loop.test.ts --reporter=verbose`

Expected: module import failure.

- [ ] **Step 3: Implement minimum boundary** using `getPayload({ config })`, `payload.auth({ headers: request.headers })`, and `createLocalReq({ user }, payload)`. Throw `Authentication required` without exposing token details when no user exists.
- [ ] **Step 4: Run focused GREEN** with the command above.
- [ ] **Step 5: Commit and push**

`git add app/src/utilities/readerRequest.ts app/tests/int/reader-loop.test.ts && git commit -m "feat: add reader request boundary" && git push`

### Task D02: Favorite toggle and account favorites

**Files:** Create `src/app/api/reader/favorites/route.ts`, `src/components/reader/FavoriteButton.tsx`; modify `src/app/(frontend)/stories/[slug]/page.tsx`, `tests/int/reader-loop.test.ts`.

**Interfaces:** `POST { storyId: number }` creates only the authenticated reader's favorite; `DELETE { storyId: number }` deletes only that reader's favorite; both return `{ favorited: boolean }`.

- [ ] **Step 1: Write failing tests** for reader A creating/removing A's favorite and reader B receiving no access to A's record.
- [ ] **Step 2: Run RED** with `pnpm test:int -- tests/int/reader-loop.test.ts --reporter=verbose`.
- [ ] **Step 3: Implement minimum route**: validate a positive integer `storyId`, call `requireReader`, find by `{ user: user.id, story: storyId }`, and use Payload local API with `req` plus `overrideAccess: false`. Return `401`, `400`, or `{ favorited }`; never accept a user ID.
- [ ] **Step 4: Add button** with Arabic labels `أضف إلى المفضلة` / `إزالة من المفضلة`, `aria-pressed`, and a sign-in link for anonymous readers.
- [ ] **Step 5: Run focused GREEN, commit, push**

`git add app/src/app/api/reader/favorites/route.ts app/src/components/reader/FavoriteButton.tsx app/src/app/'(frontend)'/stories/'[slug]'/page.tsx app/tests/int/reader-loop.test.ts && git commit -m "feat: add reader favorites" && git push`

### Task D03: Progress persistence, resume card, and account page

**Files:** Create `src/app/api/reader/progress/route.ts`, `src/app/(frontend)/account/page.tsx`, `src/components/reader/ProgressButton.tsx`; modify `tests/int/reader-loop.test.ts`, `tests/e2e/frontend.e2e.spec.ts`.

**Interfaces:** `POST { storyId, chapterId, progressPercentage }` upserts the current reader's sole story-progress record. `GET /account` presents the most recently read incomplete chapter first and favorites below it.

- [ ] **Step 1: Write failing tests** for 0–100 validation, update-not-duplicate behavior, foreign record denial, and a continue link containing the seeded story and chapter URL.
- [ ] **Step 2: Run RED** with the focused integration test and Chrome E2E test.
- [ ] **Step 3: Implement minimum route/page**: validate positive IDs and integer percentage; find the reader's existing record; create or update through authenticated Payload request; set `completed` only at 100 and `lastReadAt` server-side. Account queries use `overrideAccess: false`, RTL Arabic empty copy, and no data when unauthenticated except redirect to login.
- [ ] **Step 4: Add chapter control** that saves its current chapter at 100% only after explicit reader action; it never trusts a browser user ID.
- [ ] **Step 5: Run GREEN, commit, push**

`git add app/src/app/api/reader/progress/route.ts app/src/app/'(frontend)'/account/page.tsx app/src/components/reader/ProgressButton.tsx app/tests/int/reader-loop.test.ts app/tests/e2e/frontend.e2e.spec.ts && git commit -m "feat: add reader progress and account" && git push`

### Task D04: Pending comment submission

**Files:** Create `src/app/api/reader/comments/route.ts`, `src/components/reader/CommentForm.tsx`; modify `src/app/(frontend)/stories/[slug]/chapters/[chapterNumber]/page.tsx`, `tests/int/reader-loop.test.ts`, `tests/e2e/frontend.e2e.spec.ts`.

**Interfaces:** `POST { chapterId: number, body: string }` creates a `comments` document with the request reader as author and `pending` status; response is `{ status: 'pending' }`.

- [ ] **Step 1: Write failing tests** for anonymous rejection, server-derived author, pending status, and no pending comment displayed in the public comment list.
- [ ] **Step 2: Run RED** with focused integration/E2E tests.
- [ ] **Step 3: Implement minimum route/form**: trim body, require 1–2000 characters, validate chapter ID, derive story context from the published chapter server-side, and create using authenticated `req` plus `overrideAccess: false`. The form announces `سيظهر تعليقك بعد المراجعة` and handles 401/400 with Arabic messages.
- [ ] **Step 4: Run GREEN, commit, push**

`git add app/src/app/api/reader/comments/route.ts app/src/components/reader/CommentForm.tsx app/src/app/'(frontend)'/stories/'[slug]'/chapters/'[chapterNumber]'/page.tsx app/tests/int/reader-loop.test.ts app/tests/e2e/frontend.e2e.spec.ts && git commit -m "feat: add pending reader comments" && git push`

### Task D05: Reader-loop acceptance and truthful handoff

**Files:** Modify `tests/e2e/frontend.e2e.spec.ts`, `docs/executor/STATUS.yaml`; create `docs/executor/READER_LOOP_REPORT.md`.

- [ ] **Step 1: Add failing E2E assertions** for RTL labels, favorite state, progress/resume link, and pending-comment feedback.
- [ ] **Step 2: Run RED**, then the complete verifier:

`pnpm verify:ci`

- [ ] **Step 3: Make only test-proven fixes**, rerun `pnpm verify:ci`, then push.
- [ ] **Step 4: Wait for exact HEAD GitHub Actions success**. Record SHA, run URL, executed test counts, changed files, and blockers in the report and `STATUS.yaml`. Do not mark success for skipped or unavailable tests.
- [ ] **Step 5: Commit, push, stop for Codex acceptance**

`git add app/tests/e2e/frontend.e2e.spec.ts app/docs/executor/STATUS.yaml app/docs/executor/READER_LOOP_REPORT.md && git commit -m "test: record reader loop acceptance" && git push`

## Self-review

- Coverage: every approved capability has a dedicated task; server identity, ownership, Arabic/RTL UX, pending moderation, and CI evidence are covered.
- Scope: no task adds deployment, real infrastructure, payments, search, authorship, recommendations, or SEO work.
- Consistency: all state-changing routes use `requireReader`; later tasks consume the interfaces defined in D01.
