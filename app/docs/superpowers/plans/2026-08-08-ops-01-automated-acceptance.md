# OPS-01 Automated Acceptance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a repeatable GitHub Actions gate that runs the KR1688 app against disposable PostgreSQL and blocks false completion claims.

**Architecture:** A single Linux GitHub Actions workflow owns the test database and invokes the repository's `verify:ci` script. The script invokes the checked-in ESLint config, all executable tests, Playwright E2E, build, and a guardrail scan. Execution state is maintained only in `app/docs/executor/STATUS.yaml`.

**Tech Stack:** GitHub Actions, Node 26, pnpm, Payload CMS, PostgreSQL 16 service container, Vitest, Playwright, Next.js.

## Global Constraints

- Use branch `marvis/ops-01-automated-acceptance`; do not push implementation directly to `main`.
- No production credentials. CI values are test fixtures only.
- Do not deploy or add sitemap, RSS, JSON-LD, IndexNow, SEO/search plugins, payment, author functionality, real content, or Phase 3.
- A test is complete only when it executes and passes; `skip`, `todo`, excluded glob patterns, and test discovery alone are failures.
- Use Node 26 in CI and require Node >=24.15 locally.

---

### Task 1: Make test environment initialization explicit

**Files:**
- Modify: `app/vitest.setup.ts`
- Modify: `app/test.env`
- Modify: `app/tests/int/api.int.spec.ts`
- Test: `app/tests/int/api.int.spec.ts`

**Interfaces:**
- Consumes `DATABASE_URL`, `PAYLOAD_SECRET`, and `NEXT_PUBLIC_SERVER_URL` from the process environment.
- Produces a Payload test process that initializes successfully against a disposable PostgreSQL database.

- [ ] **Step 1: Write the failing test assertion**

Add an assertion to `api.int.spec.ts` that `process.env.PAYLOAD_SECRET` and `process.env.DATABASE_URL` are non-empty before calling `getPayload`.

- [ ] **Step 2: Verify the expected failure**

Run: `pnpm test:int -- --reporter=verbose`

Expected: FAIL before Payload initialization with the missing test-environment assertion or the current missing-secret error.

- [ ] **Step 3: Implement only test-environment loading**

Load `test.env` explicitly from `vitest.setup.ts`. Keep test-only defaults non-production and allow CI-provided `DATABASE_URL` to override them. Ensure the setup sets `NODE_ENV=test` or the documented Payload development/test schema-push mode required for the disposable database.

- [ ] **Step 4: Verify initialization reaches PostgreSQL**

Run: `DATABASE_URL=postgresql://kr1688_test:kr1688_test@localhost:5432/kr1688_test PAYLOAD_SECRET=kr1688-test-only-not-a-production-secret pnpm test:int -- --reporter=verbose`

Expected: test output progresses beyond "missing secret key". If PostgreSQL is unavailable locally, record that exact connection error; GitHub Actions will supply it in Task 4.

- [ ] **Step 5: Commit**

```bash
git add app/vitest.setup.ts app/test.env app/tests/int/api.int.spec.ts
git commit -m "test: load explicit KR1688 test environment"
```

### Task 2: Restore real linting and create the repository verifier

**Files:**
- Modify: `app/package.json`
- Modify: `app/eslint.config.mjs`
- Create: `app/scripts/verify-guardrails.mjs`
- Test: `app/scripts/verify-guardrails.mjs`

**Interfaces:**
- `pnpm lint` loads `eslint.config.mjs` and returns non-zero for a temporary lint violation.
- `pnpm verify:ci` runs type generation, lint, integration tests, E2E tests, build, and the guardrail script in that order.
- `verify-guardrails.mjs` exits non-zero if active source files contain forbidden features.

- [ ] **Step 1: Write the failing verifier cases**

Create a temporary fixture under `app/tests/fixtures/guardrail-fail.txt` containing `next-sitemap` and add a Node assertion in `verify-guardrails.mjs` test mode that this fixture makes the verifier exit 1. Also add a temporary ESLint-invalid fixture and confirm `pnpm lint` exits non-zero while still loading `eslint.config.mjs`.

- [ ] **Step 2: Verify RED**

Run the guardrail script against the fixture and run `pnpm lint` with the invalid fixture included. Expected: both exit non-zero for the intended reasons, not because configuration was bypassed.

- [ ] **Step 3: Implement the minimal verifier and lint correction**

Remove `--no-config-lookup` from `lint`. Configure ignores in `eslint.config.mjs` for generated output only. Implement `verify-guardrails.mjs` to scan active source/configuration files, excluding documentation and lockfiles, for: sitemap, RSS route, JSON-LD output, IndexNow, Payload search/SEO plugins, MongoDB adapter, real `.env`, and committed credential patterns. Add `verify:ci` to `package.json` as the ordered full verifier.

- [ ] **Step 4: Verify GREEN**

Delete the temporary failing fixtures. Run `pnpm lint` and `node scripts/verify-guardrails.mjs`; both must exit 0. Confirm `pnpm exec eslint --print-config src/collections/Comments.ts` prints an object rather than `undefined`.

- [ ] **Step 5: Commit**

```bash
git add app/package.json app/eslint.config.mjs app/scripts/verify-guardrails.mjs
git commit -m "ci: add real lint and guardrail verification"
```

### Task 3: Make E2E self-contained and executable

**Files:**
- Modify: `app/playwright.config.ts`
- Modify: `app/tests/e2e/frontend.e2e.spec.ts`
- Modify: `app/tests/e2e/admin.e2e.spec.ts`
- Create or modify: `app/tests/helpers/seedKr1688.ts`
- Test: both E2E spec files

**Interfaces:**
- E2E setup seeds one test reader, one draft-safe demo Story, and one Chapter through Payload's local API using only CI test variables.
- E2E only checks approved routes: `/`, `/stories/[slug]`, `/stories/[slug]/chapters/[chapterNumber]`, and `/admin`.

- [ ] **Step 1: Write failing route assertions**

Replace any Posts/Pages/Search expectation with explicit story and chapter URL assertions based on the seeded record. Ensure the tests fail before a seeding helper exists.

- [ ] **Step 2: Verify RED**

Run `pnpm test:e2e`. Expected: failure due to missing seed helper or unavailable seeded story, never a skipped test.

- [ ] **Step 3: Implement minimal deterministic setup**

Create `seedKr1688.ts` with `seedKr1688TestData()` and `cleanupKr1688TestData()` functions. Use a unique `kr1688-e2e-` prefix and delete only records with that prefix in cleanup. Configure Playwright to receive the same explicit CI test variables as Vitest and to wait for the server's URL.

- [ ] **Step 4: Verify GREEN in CI environment**

Run `pnpm test:e2e` with a reachable disposable PostgreSQL database and test variables. Expected: all E2E tests execute and pass; zero skipped tests.

- [ ] **Step 5: Commit**

```bash
git add app/playwright.config.ts app/tests/e2e app/tests/helpers/seedKr1688.ts
git commit -m "test: make KR1688 E2E suite self-contained"
```

### Task 4: Add GitHub Actions PostgreSQL quality gate

**Files:**
- Create: `.github/workflows/kr1688-quality.yml`
- Modify: `app/package.json`
- Test: GitHub Actions run for this branch

**Interfaces:**
- Workflow runs on push and pull request for paths under `app/**` or workflow files.
- It provides Node 26 and PostgreSQL 16, then invokes `pnpm verify:ci` from `app/`.
- A failed required command fails the job.

- [ ] **Step 1: Write a deliberate failing workflow condition**

Initially make `verify:ci` invoke a missing test command and push the branch. Confirm the GitHub Actions job is created and red for that command.

- [ ] **Step 2: Verify RED in GitHub**

Record workflow URL, commit SHA, and failing command in `app/docs/executor/OPS_01_REPORT.md`.

- [ ] **Step 3: Implement the quality workflow**

Use `ubuntu-latest`, `actions/checkout`, `actions/setup-node` with Node 26, Corepack, locked pnpm install, and a PostgreSQL 16 service with a health check. Supply only these test environment values: `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL=http://127.0.0.1:3000`, `CRON_SECRET`, and `PREVIEW_SECRET`. Run `pnpm verify:ci` from `app/`. Do not upload database dumps, reports, or secrets.

- [ ] **Step 4: Verify GREEN in GitHub**

Push the branch and wait for the Actions run. Required result: install, types, lint, integration tests, E2E, build, and guardrail scan all exit 0; no required test is skipped.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/kr1688-quality.yml app/package.json app/docs/executor/OPS_01_REPORT.md
git commit -m "ci: gate KR1688 changes with PostgreSQL verification"
```

### Task 5: Establish the single execution truth and handoff gate

**Files:**
- Create: `app/docs/executor/STATUS.yaml`
- Modify: `app/docs/executor/KR1688_CURRENT_EXECUTOR_PACKET.md`
- Modify: `app/docs/executor/KR1688_STATUS.md`
- Create: `app/docs/executor/OPS_01_REPORT.md`

**Interfaces:**
- `STATUS.yaml` exposes `phase`, `state`, `next_task`, `branch`, `head_sha`, `ci_url`, `ci_conclusion`, and `acceptance_requested`.
- Only `ci_conclusion: success` permits `acceptance_requested: true`.

- [ ] **Step 1: Write failing state validation**

Add a fixture status with `acceptance_requested: true` and `ci_conclusion: failure`; make `verify-guardrails.mjs` reject it.

- [ ] **Step 2: Verify RED**

Run the guardrail verifier against the fixture. Expected: exit 1 with an acceptance-without-green-CI message.

- [ ] **Step 3: Implement the status transition rule**

Create `STATUS.yaml` as the only detailed execution truth and mark the old Markdown status files as historical mirrors only. Extend the verifier to reject contradictory status transitions. Populate `OPS_01_REPORT.md` with exact workflow run URLs, SHA, commands, results, and changed files.

- [ ] **Step 4: Verify GREEN**

Run `node scripts/verify-guardrails.mjs` and confirm the status is accepted only after the GitHub Actions job for the exact head SHA is green.

- [ ] **Step 5: Commit and stop**

```bash
git add app/docs/executor
git commit -m "docs: make CI status the KR1688 execution truth"
git push -u origin marvis/ops-01-automated-acceptance
```

Stop. Do not merge to `main`, start Phase 3, or mark Phase 2B accepted. Return the branch name, head SHA, CI URL, exact command results, and any blocker.

## Plan Self-Review

- Coverage: CI runtime, PostgreSQL, explicit test environment, real lint, test execution, E2E seeding, guardrails, single truth, branch handoff, and stop gate are each assigned a task.
- Placeholder scan: no implementation placeholder remains; each task names exact files, commands, expected results, and commit message.
- Consistency: `verify:ci` is the sole CI command and `STATUS.yaml` is the sole detailed execution status.
