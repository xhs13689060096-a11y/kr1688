# KR1688 Phase 2C Security Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the KR1688 application safe to take into Phase 3A by enforcing authentication, authorization, environment, database, moderation, and recovery security gates with executable proof.

**Architecture:** OPS-01 first makes CI trustworthy using Node 26 and disposable PostgreSQL. Phase 2C then adds application controls that are provider-neutral and tests every negative authorization path. Cloudflare, HTTPS, production accounts, and real backups remain Phase 3A launch-gate work.

**Tech Stack:** Next.js 16, Payload CMS 4, PostgreSQL 16, Vitest, Playwright, GitHub Actions, Node 26.

## Global Constraints

- Execute only after OPS-01 GitHub Actions is green for the exact branch head.
- Stay on `marvis/ops-01-automated-acceptance`; never push or merge `main`.
- No deploy, Cloudflare account connection, real credential, production database, R2 connection, actual 2FA provider, content publishing, sitemap, RSS, JSON-LD, IndexNow, payment, author system, Meilisearch, recommendation engine, or Phase 3 feature.
- Every behavioural change follows RED → GREEN: write one failing test, run it, make the smallest change, re-run the focused and complete verifier, then commit and push.
- Do not count skipped, todo, excluded, or merely discovered tests as passing.

## Files and responsibilities

| File | Responsibility |
|---|---|
| `src/environment.ts` | Validate runtime configuration without exposing values. |
| `src/collections/Users/index.ts` | Payload authentication, role protection, session/lockout settings. |
| `src/collections/Comments.ts` | Pending-first comment lifecycle and immutable ownership. |
| `src/access/*` | Reusable ownership and administrator access rules. |
| `src/security/rateLimit.ts` | Provider-neutral limit interface and fail-closed state-changing policy. |
| `src/security/admin2fa.ts` | Explicit integration boundary and launch-gate state; no fake 2FA claim. |
| `tests/int/security-auth.test.ts` | Authentication, environment, and API negative tests. |
| `tests/int/comments.test.ts` | Ownership, moderation, and immutable relation tests. |
| `tests/int/favorites-reading.test.ts` | Foreign-record read/update/delete denial tests. |
| `docs/security/*` | Database roles, backup restore procedure, Phase 3A Cloudflare checklist. |
| `scripts/verify-guardrails.mjs` | Reject secrets, contradictory status, and excluded forbidden scope. |

---

### Task C01: Harden Payload authentication and reader registration

**Files:**
- Modify: `src/collections/Users/index.ts`
- Create: `tests/int/security-auth.test.ts`
- Modify: `tests/int/favorites-reading.test.ts`

**Interfaces:**
- `Users.auth` has `verify: true`, `maxLoginAttempts: 5`, `lockTime: 900000`, and a finite token lifetime.
- Public user creation is tested with `overrideAccess: false`; the result is always `role: 'reader'`.
- `assertPublicUserPayload(value: unknown): void` proves a returned public user object has no `password`, `hash`, `loginAttempts`, or `lockUntil` property.

- [ ] **Step 1: Write failing tests**

```ts
it('public registration ignores an attempted admin role', async () => {
  const user = await payload.create({
    collection: 'users',
    data: { email: uniqueEmail(), password: 'reader-only-password', role: 'admin' },
    overrideAccess: false,
    disableVerificationEmail: true,
  })
  expect(user.role).toBe('reader')
})

it('login locks after five failed passwords', async () => {
  const user = await createReader()
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await expect(payload.login({ collection: 'users', data: { email: user.email, password: 'wrong-password' } })).rejects.toThrow()
  }
  await expect(payload.login({ collection: 'users', data: { email: user.email, password: user.password })).rejects.toThrow()
})
```

- [ ] **Step 2: Verify RED**

Run: `pnpm test:int -- tests/int/security-auth.test.ts --reporter=verbose`

Expected: the lockout assertion fails because the auth options have not been configured, or the public-registration test exposes a role assignment defect.

- [ ] **Step 3: Implement minimal auth configuration**

Set Payload `auth` to `verify: true`, `maxLoginAttempts: 5`, `lockTime: 900000`, `tokenExpiration: 7200`, and production-safe cookie options derived from runtime environment. Keep the existing hook that forces non-admin creates to `reader`; do not create a custom password field or custom hash.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm test:int -- tests/int/security-auth.test.ts --reporter=verbose`

Expected: all focused tests execute and pass. Add a login-response assertion that confirms no raw password or hash exists.

- [ ] **Step 5: Commit and push**

```bash
git add src/collections/Users/index.ts tests/int/security-auth.test.ts tests/int/favorites-reading.test.ts
git commit -m "security: enforce reader registration and login lockout"
git push
```

### Task C02: Close comment mutation and moderation gaps

**Files:**
- Modify: `src/collections/Comments.ts`
- Modify: `tests/int/comments.test.ts`

**Interfaces:**
- `assertReaderCommentPatch(data: Record<string, unknown>, existing: Comment): void` rejects a reader patch containing `author`, `story`, `chapter`, `parent`, `status`, `moderationReason`, `likeCount`, or `aiRecommendation`.
- `recordModerationTransition(args)` writes actor ID, timestamp, prior status, next status, and reason to an admin-only audit record or structured moderation log.
- Administrative approval preserves the existing reader author.

- [ ] **Step 1: Write failing tests**

```ts
it('admin approval preserves the reader author', async () => {
  const comment = await createReaderPendingComment()
  const approved = await updateAsAdmin(comment.id, { status: 'approved', moderationReason: 'approved' })
  expect(approved.author).toBe(comment.author)
})

it.each(['story', 'chapter', 'parent', 'author'])('reader cannot replace %s on own comment', async (field) => {
  const comment = await createReaderPendingComment()
  await expect(updateAsOwner(comment.id, { [field]: foreignId() })).rejects.toThrow()
})
```

- [ ] **Step 2: Verify RED**

Run: `pnpm test:int -- tests/int/comments.test.ts --reporter=verbose`

Expected: the author-preservation assertion fails against the current unconditional `data.author = req.user.id`, and at least one relation-mutation assertion fails.

- [ ] **Step 3: Implement minimal ownership-safe hooks and field access**

On create, set author from `req.user`. On update, preserve the stored author for admins and readers. For readers, compare submitted keys to the permitted `body` field before validation and reject forbidden keys. Keep status pending for reader creates; only administrators may change moderation fields. Readers may delete only their own `pending` comments; approved, rejected, and hidden comments are administrator-only deletion. Do not allow nested replies beyond one level.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm test:int -- tests/int/comments.test.ts --reporter=verbose`

Expected: every comment test executes; no reader can modify another user's record or protected relation/moderation fields; admin approval does not reassign authorship.

- [ ] **Step 5: Commit and push**

```bash
git add src/collections/Comments.ts tests/int/comments.test.ts
git commit -m "security: preserve comment ownership during moderation"
git push
```

### Task C03: Validate runtime configuration and constrain API depth

**Files:**
- Create: `src/environment.ts`
- Modify: `src/payload.config.ts`
- Modify: `.env.example`
- Modify: `tests/int/security-auth.test.ts`

**Interfaces:**
- `loadEnvironment(input: NodeJS.ProcessEnv): RuntimeEnvironment` returns only validated values or throws `Missing required environment variable: NAME`.
- Production mode rejects `http://` server URLs and placeholder values including `YOUR_SECRET_HERE`.
- Payload uses `maxDepth: 2` unless a focused test documents a necessary higher value.

- [ ] **Step 1: Write failing tests**

```ts
it('rejects a production placeholder secret', () => {
  expect(() => loadEnvironment({ NODE_ENV: 'production', PAYLOAD_SECRET: 'YOUR_SECRET_HERE' } as NodeJS.ProcessEnv)).toThrow('PAYLOAD_SECRET')
})

it('accepts a complete non-production test environment', () => {
  expect(loadEnvironment(testEnvironment()).databaseURL).toMatch(/^postgresql:\/\//)
})
```

- [ ] **Step 2: Verify RED**

Run: `pnpm test:int -- tests/int/security-auth.test.ts --reporter=verbose`

Expected: import or validation failure because `loadEnvironment` does not exist.

- [ ] **Step 3: Implement validation at the configuration boundary**

Implement `loadEnvironment` without logging values. Require `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `CRON_SECRET`, and `PREVIEW_SECRET`; reject empty values and production placeholders. Import it once in `payload.config.ts`, use its values, and set `maxDepth: 2`. Keep `.env.example` inert.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm test:int -- tests/int/security-auth.test.ts --reporter=verbose`

Expected: all environment tests pass and no secret value appears in output.

- [ ] **Step 5: Commit and push**

```bash
git add src/environment.ts src/payload.config.ts .env.example tests/int/security-auth.test.ts
git commit -m "security: validate runtime environment and API depth"
git push
```

### Task C04: Introduce provider-neutral limits and 2FA launch boundary

**Files:**
- Create: `src/security/rateLimit.ts`
- Create: `src/security/admin2fa.ts`
- Create: `tests/int/security-auth.test.ts`
- Create: `docs/security/PHASE3A_LAUNCH_SECURITY_GATE.md`

**Interfaces:**
- `RateLimitCategory` is `'login' | 'registration' | 'password-reset' | 'comment-create' | 'public-read'`.
- `assertStateChangeAllowed(result: RateLimitResult): void` throws only for a non-public category when a provider fails or denies a request.
- `getAdmin2FALaunchState(): { requiredBeforePublicLaunch: true; enabledInApplication: false }` is an honest launch gate, not a claimed 2FA implementation.

- [ ] **Step 1: Write failing tests**

```ts
it('fails closed when login limiter is unavailable', () => {
  expect(() => assertStateChangeAllowed({ category: 'login', allowed: false, reason: 'unavailable' })).toThrow('login')
})

it('does not claim 2FA is enabled', () => {
  expect(getAdmin2FALaunchState()).toEqual({ requiredBeforePublicLaunch: true, enabledInApplication: false })
})
```

- [ ] **Step 2: Verify RED**

Run: `pnpm test:int -- tests/int/security-auth.test.ts --reporter=verbose`

Expected: failure because the security modules do not exist.

- [ ] **Step 3: Implement the minimal interfaces and checklist**

Implement types and pure functions only; do not connect a Redis, Cloudflare, Turnstile, email, or 2FA service. Document the Phase 3A Cloudflare proxy, Full (strict) HTTPS, edge limit categories, Turnstile, bot controls, admin 2FA enrollment, and proof requirements.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm test:int -- tests/int/security-auth.test.ts --reporter=verbose`

Expected: focused tests execute and pass; no outbound service call is made.

- [ ] **Step 5: Commit and push**

```bash
git add src/security/rateLimit.ts src/security/admin2fa.ts tests/int/security-auth.test.ts docs/security/PHASE3A_LAUNCH_SECURITY_GATE.md
git commit -m "security: add rate-limit and admin 2FA launch boundaries"
git push
```

### Task C05: Document least-privilege database roles and recoverability

**Files:**
- Create: `docs/security/postgres-roles.sql`
- Create: `docs/security/BACKUP_AND_RESTORE_RUNBOOK.md`
- Create: `tests/int/security-auth.test.ts`

**Interfaces:**
- SQL contains three literal roles: `kr1688_migrate`, `kr1688_app`, and `kr1688_backup`.
- `kr1688_app` receives only application-schema usage, table/sequence privileges; it does not receive `CREATEDB`, `CREATEROLE`, `SUPERUSER`, or replication.
- Backup runbook contains daily schedule, retention duration, media inventory, empty-environment restore, and five collection metadata checks.

- [ ] **Step 1: Write failing document-contract tests**

```ts
it('database role script contains the three required least-privilege roles', async () => {
  const sql = await readFile('docs/security/postgres-roles.sql', 'utf8')
  expect(sql).toContain('kr1688_migrate')
  expect(sql).toContain('kr1688_app')
  expect(sql).toContain('kr1688_backup')
  expect(sql).not.toMatch(/GRANT\s+(ALL|SUPERUSER|CREATEROLE)/i)
})
```

- [ ] **Step 2: Verify RED**

Run: `pnpm test:int -- tests/int/security-auth.test.ts --reporter=verbose`

Expected: failure because the role script does not exist.

- [ ] **Step 3: Write the reviewed role script and recovery runbook**

Provide parameterized role/password placeholders intended only for Phase 3A operator substitution outside Git. Grant schema privileges explicitly and revoke public schema creation. The runbook must require daily PostgreSQL backups, a 30-day retention policy, a separate R2 media inventory, monthly restore into an empty environment, and checks for users, stories, chapters, comments, and media metadata. Never insert production passwords or bucket names.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm test:int -- tests/int/security-auth.test.ts --reporter=verbose`

Expected: document-contract tests pass; `git diff --check` exits 0.

- [ ] **Step 5: Commit and push**

```bash
git add docs/security/postgres-roles.sql docs/security/BACKUP_AND_RESTORE_RUNBOOK.md tests/int/security-auth.test.ts
git commit -m "docs: add least-privilege database and recovery controls"
git push
```

### Task C06: Enforce the complete Phase 2C security gate

**Files:**
- Modify: `scripts/verify-guardrails.mjs`
- Modify: `package.json`
- Modify: `docs/executor/STATUS.yaml`
- Create: `docs/executor/PHASE2C_SECURITY_REPORT.md`

**Interfaces:**
- `pnpm verify:ci` runs generation, lint, integration tests, E2E tests, build, and guardrail verification without exclusions.
- `STATUS.yaml` may set `acceptance_requested: true` only with the exact green GitHub Actions SHA and URL.

- [ ] **Step 1: Write failing gate tests**

Create a temporary status fixture with `acceptance_requested: true` and `ci_conclusion: failure`; run the guardrail verifier and require exit 1. Create a temporary credential-shaped fixture outside documentation and require the scan to exit 1.

- [ ] **Step 2: Verify RED**

Run: `node scripts/verify-guardrails.mjs`

Expected: each deliberate fixture makes the command fail for its named reason.

- [ ] **Step 3: Implement only the final gate checks**

Remove fixtures. Extend the verifier to require the Phase 2C documentation and reject unsafe status transitions, committed credential patterns, raw `.env` files, forbidden scope, and incomplete test scripts. Record exact SHA, workflow URL, command results, and no-unresolved-risk statement in the report.

- [ ] **Step 4: Verify GREEN in GitHub Actions**

Run locally: `pnpm verify:ci`.

Push the branch and wait for GitHub Actions. Expected: Node 26/PostgreSQL job is green for the exact head SHA; all required tests execute and pass.

- [ ] **Step 5: Commit, push, stop**

```bash
git add scripts/verify-guardrails.mjs package.json docs/executor/STATUS.yaml docs/executor/PHASE2C_SECURITY_REPORT.md
git commit -m "ci: enforce Phase 2C security acceptance gate"
git push
```

Stop without merging or starting Phase 3A. Return branch, head SHA, workflow URL/conclusion, executed command results, changed files, and blockers.

## Plan self-review

- Coverage: authentication, password safety, role escalation, comment ownership/moderation, environment validation, query depth, API permissions, rate-limit and 2FA launch boundaries, database roles, backups, Cloudflare/HTTPS launch contract, and automatic CI acceptance are all assigned.
- Scope: actual Cloudflare, HTTPS, backup scheduling, R2, 2FA provider, deployment, and production credentials remain explicitly Phase 3A work.
- Consistency: all tests use the `pnpm verify:ci` gate created by OPS-01; no task permits a success state without GitHub Actions green for the exact SHA.
