---
type: executor_packet
packet_id: KR1688-EXECUTION-01-OPS-SECURITY
project: kr1688-global-ai-story-entertainment
status: ready_for_marvis
owner: Marvis
planner: Codex
acceptor: Codex
repository_url: https://github.com/xhs13689060096-a11y/kr1688
base_branch: main
working_branch: marvis/ops-01-automated-acceptance
created: 2026-08-08
supersedes: [KR1688-PHASE2B-REPAIR-02, OPS-01-AUTOMATED-ACCEPTANCE]
---

# KR1688 Execution 01 — Truthful CI then Security Baseline

## One mission

Make the Phase 2B foundation objectively verifiable, then complete the approved Phase 2C application security baseline. This packet is the sole Marvis instruction. Every older packet, report status, and completion claim is historical only.

## Authority order

1. `docs/executor/STATUS.yaml` — sole live state; update after each task.
2. This packet — task order, guardrails, and stop conditions.
3. `docs/superpowers/plans/2026-08-08-ops-01-automated-acceptance.md` — Stage A implementation detail.
4. `docs/superpowers/specs/2026-08-08-phase-2c-security-baseline-design.md` — approved security design.
5. `docs/superpowers/plans/2026-08-08-phase-2c-security-baseline.md` — Stage B implementation detail.
6. GitHub Actions for the exact HEAD SHA — only final acceptance evidence.

## Permanent guardrails

- Work only on `marvis/ops-01-automated-acceptance`; never push, merge, or alter `main`.
- No deployment, Vercel, production database, real secret, Cloudflare account connection, R2 connection, real content or assets, payment, author system, Meilisearch, recommendation system, native app, sitemap, RSS, JSON-LD, IndexNow, public indexing, SEO/search plugin, or Phase 3 work.
- No hidden test bypass: skipped, todo, excluded, discovered-only, or service-unavailable required tests are failures.
- Never claim 2FA, Cloudflare protection, HTTPS, or backups are active. This task builds their code contract and public-launch gates only.
- Do not store, echo, commit, or put real credentials in reports.

## Continuous queue

| Order | ID | Scope | Required completion proof | State |
|---:|---|---|---|---|
| 1 | A01 | Explicit test environment | Required integration tests initialize against disposable PostgreSQL; no missing-secret skip. | queued |
| 2 | A02 | Real lint and guardrail verifier | ESLint loads its config; deliberate lint and guardrail fixtures fail; clean verifier passes. | queued |
| 3 | A03 | Self-contained E2E | Deterministic seeded E2E executes only approved routes with zero skips. | queued |
| 4 | A04 | GitHub Actions quality gate | A deliberate red run is recorded, then Node 26 + PostgreSQL workflow configuration exists. | queued |
| 5 | A05 | CI truth handoff | Exact branch HEAD has green GitHub Actions; `STATUS.yaml` records SHA and URL. | queued |
| 6 | C01 | Auth and registration hardening | Public reader registration, role denial, five-attempt lockout, and non-disclosure tests pass. | blocked_by_A05 |
| 7 | C02 | Comment ownership and moderation | Admin preserves author; reader cannot mutate protected fields; lifecycle audit is tested. | blocked_by_A05 |
| 8 | C03 | Environment and API depth | Typed startup validation and `maxDepth` tests pass; no values leak. | blocked_by_A05 |
| 9 | C04 | Rate-limit and 2FA launch boundary | Provider-neutral, fail-closed state-change contract and honest 2FA gate tests pass. | blocked_by_A05 |
| 10 | C05 | Database roles and recovery contract | Least-privilege role script and restore-runbook document tests pass. | blocked_by_A05 |
| 11 | C06 | Final security acceptance | Complete GitHub Actions run is green for exact HEAD; report and status are factual. | blocked_by_A05 |

## Execution protocol

1. Start at `A01`; execute one queue item at a time, in order.
2. Read the matching task in its named plan before changing files.
3. Use test-first: commit the observed RED output to the task report, make the smallest GREEN change, run focused tests, then the relevant complete verifier.
4. Commit one focused change and push after each successful task.
5. Update only `STATUS.yaml` with task state, actual head SHA, actual command results, next task, and blocker. Do not alter old Markdown status files to create a second truth source.
6. `C01` may start only when `A05` has a green GitHub Actions result on the exact branch head. `C06` is the only task that may request Codex acceptance.

## Failure budget and stop conditions

- If a task needs production infrastructure, a real account, credential, deployment, or a guardrail exception: stop immediately and report the precise requirement.
- For one root cause: after two failed minimal repair attempts, stop rather than stack guesses.
- If GitHub Actions cannot run or a required test is skipped: the queue is blocked, not done.
- Stop after C06. Do not merge, start Phase 3A, or mark any phase accepted.

## Required final report

Return only: branch; exact HEAD SHA; GitHub Actions URL and conclusion; each queue ID with actual command results; changed files; unresolved blockers; and whether `acceptance_requested` is true. Do not summarize skipped tests as successful.
