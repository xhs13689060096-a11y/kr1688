# Phase 2B Repair-02 Plan — Security, Test Truth, and Acceptance Closure

**Created**: 2026-08-05
**Baseline Commit**: 82e538e
**Phase**: Phase 2B Repair-02
**Repository**: https://github.com/xhs13689060096-a11y/kr1688

## Baseline Review — Seven Rejection Findings (Confirmed)

### E1: ESLint FlatCompat Circular JSON (lint exit 2)
- **Evidence**: `pnpm lint` → `TypeError: Converting circular structure to JSON` at `@eslint/eslintrc` `config-validator.js:308`
- **Root Cause**: `eslint.config.mjs` uses `FlatCompat` from `@eslint/eslintrc` to bridge `.eslintrc`-style configs (`next/core-web-vitals`, `next/typescript`). ESLint 9.x flat config cannot serialize plugin objects with circular references through FlatCompat.
- **Fix Direction**: Convert to pure ESLint flat config using `@eslint/js`, `typescript-eslint`, `eslint-config-next` direct imports, removing FlatCompat entirely.

### E2: Integration Tests Excluded
- **Evidence**: `vitest.config.mts` includes only `tests/int/**/*.int.spec.ts`. `comments.test.ts` and `favorites-reading.test.ts` use `.test.ts` suffix → excluded.
- **Root Cause**: Wrong glob pattern in vitest config.
- **Fix Direction**: Expand include to capture all `tests/int/**/*.{test,spec}.ts` or rename files to `.int.spec.ts`. Also verify safe test-only Payload variables are configured.

### E3: E2E Tests Target Deleted Collections
- **Evidence**: 
  - `tests/e2e/frontend.e2e.spec.ts`: imports `seedRelatedPosts` from `../helpers/seedRelatedPosts` (deleted), tests `/posts/` routes, expects "Payload Website Template" title.
  - `tests/e2e/admin.e2e.spec.ts`: navigates to `pages/create` (Pages collection deleted).
- **Fix Direction**: Rewrite E2E to cover only home `/`, story detail `/stories/[slug]`, chapter reader `/stories/[slug]/chapters/[number]`, and admin dashboard. Delete all Posts/Pages/search references.

### E4: Unrestricted Comment Authorization
- **Evidence**:
  - `Comments.ts`: `update: authenticated`, `delete: authenticated` — any logged-in user can mutate any comment.
  - `beforeChange` sets author only if missing — caller can supply any `author` to forge identity.
  - `status`, `moderationReason`, `likeCount`, `aiRecommendation` fields have no field-level access control.
  - Public read returns only `approved`, but authenticated users see all comments regardless of ownership.
- **Fix Direction**: 
  - `author` always overwritten by `req.user.id` in `beforeChange`.
  - Readers can only create pending comments and edit their own permitted content (body only).
  - Only admin controls `status`, `moderationReason`, `likeCount`, `aiRecommendation`.
  - Readers see only approved + their own; admin sees all.
  - Validate one-level replies and story/chapter relation.

### E5: Favorites/ReadingProgress Spoofing + No Roles
- **Evidence**:
  - `Favorites.ts` and `ReadingProgress.ts` `beforeValidate` reads `data?.user` from request body → caller can pass any user ID.
  - `ownerOrAdmin.ts` has TODO: "all authenticated users are admin-level" — no actual role system.
  - No `reader` role exists; Users collection lacks role field.
- **Fix Direction**:
  - Add `role` field to Users collection (`admin` / `reader`).
  - Public signup creates `reader` only.
  - Favorites/ReadingProgress always derive user from `req.user`, reject spoofing, enforce one user/story record.
  - `ownerOrAdmin` access checks `user.role === 'admin'` for admin bypass.

### E6: Stale Template Product Remnants
- **Evidence**:
  - `src/Header/Nav/index.tsx:19`: `<Link href="/search">` — links to deleted search page.
  - `tests/e2e/frontend.e2e.spec.ts`: expects "Payload Website Template" title.
  - Likely stale Open Graph / README / admin copy / tsconfig / deploy/redirect/seed artifacts.
- **Fix Direction**:
  - Remove `/search` link from Nav.
  - Update E2E title expectations.
  - Audit and remove all template references: deploy configs, redirects, seed scripts, Open Graph metadata referencing template defaults.
  - Preserve only Arabic RTL story routes and normal title/description/Open Graph.

### E7: Status Mirrors Stale
- **Evidence**:
  - Repository mirror `app/docs/executor/KR1688_STATUS.md` does not exist.
  - Vault `KR1688_STATUS.md` shows "Last Completed Task: Repair-01 implementation claim rejected at 82e538e" — but R05/R06 individual status not recorded; mirrors still show R05 in progress.
- **Fix Direction**:
  - Create `app/docs/executor/KR1688_STATUS.md` synchronized with Vault.
  - Update Vault status: all R01-R06 statuses finalized, current task set to S01 `doing`.

## Task Execution Order

| Task | Objective | Dependency |
|------|-----------|------------|
| S01 | Baseline evidence, mirrors, plan | None |
| S02 | Lint fix + test discovery + E2E rewrite | S01 |
| S03 | Reader identity + roles + Favorites/ReadingProgress security | S02 |
| S04 | Comment authorization + moderation | S03 |
| S05 | Stale template cleanup | S04 |
| S06 | Full verification (lint, test, build) | S05 |
| S07 | Final guardrail QA + acceptance request | S06 |

## Guardrails (unchanged)
- No deployment, cloud credentials, real content, payment, author system, Meilisearch, recommendations, native app, sitemap, RSS, JSON-LD, IndexNow, SEO/search plugins, or Phase 3A.
- Test-first for all behavioral corrections.
- Every task: update both mirrors → verify → commit → push main → next task.
