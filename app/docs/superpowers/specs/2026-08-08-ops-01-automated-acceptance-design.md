# OPS-01 Automated Acceptance Design

## Goal

Make GitHub Actions the objective quality gate for KR1688. Marvis may execute queued work autonomously, but may not claim a task or phase passes without a successful GitHub Actions run for the pushed commit.

## Decisions

- Repository execution documents are the sole detailed task truth. Obsidian holds only project-level summaries after Codex acceptance.
- The CI job runs Node 26, a disposable PostgreSQL service, the lockfile install, type generation, lint, integration tests, Playwright E2E, build, and a forbidden-feature scan.
- Test environment values are non-production fixtures supplied only by CI or local test setup. No real credentials or cloud services are permitted.
- `pnpm lint` must load the checked-in ESLint configuration. A flag that disables configuration lookup is forbidden.
- Every required test must execute; skipped, TODO, or merely discovered tests fail the quality gate.
- Marvis works from a feature branch and fixes CI until green. It stops after two root-cause cycles or whenever a task requires an advanced-model/security/architecture decision.

## Architecture

```text
Marvis branch + commits
        -> GitHub Actions (Node 26 + temporary PostgreSQL)
        -> verify:ci (types, lint, integration, E2E, build, guardrails)
        -> green commit SHA
        -> Codex acceptance review
```

The Postgres service is temporary and contains test-only data. Payload uses its normal PostgreSQL adapter; test setup initializes the disposable schema in development/test mode, not against a production database.

## Non-goals

- No production deployment, Vercel integration, secrets, R2, payment, indexing, sitemap, JSON-LD, RSS, author system, or Phase 3 implementation.
- No GitHub Action artifact uploads unless separately approved.

