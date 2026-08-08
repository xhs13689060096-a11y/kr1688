---
type: executor_packet
project: kr1688-global-ai-story-entertainment
packet_id: OPS-01-AUTOMATED-ACCEPTANCE
phase_id: PHASE-2B-REPAIR-02
status: ready_for_marvis
owner: Marvis
planner: Codex
acceptor: Codex
repository_url: https://github.com/xhs13689060096-a11y/kr1688
base_branch: main
working_branch: marvis/ops-01-automated-acceptance
created: 2026-08-08
---

# OPS-01 — Automated Acceptance and Execution Truth

## Mission

Replace claim-based completion with an automatic GitHub quality gate for the existing Phase 2B repair. This is operational infrastructure only: it does not start Phase 3 or add product features.

## Authority

1. This packet controls Marvis execution.
2. `docs/executor/STATUS.yaml` is the only detailed execution state.
3. `docs/superpowers/specs/2026-08-08-ops-01-automated-acceptance-design.md` is the approved design.
4. `docs/superpowers/plans/2026-08-08-ops-01-automated-acceptance.md` is the task-level plan.
5. GitHub Actions for the exact branch head is the sole acceptance evidence. A local report can never override it.

## Permanent Guardrails

- Work only on `marvis/ops-01-automated-acceptance`; never push implementation to `main`.
- No deployment, Vercel, production database, real secrets, real content/assets, R2 connection, payment, author system, Meilisearch, recommendations, app, sitemap, RSS, JSON-LD, IndexNow, search/SEO plugin, or Phase 3 work.
- Never store, echo, commit, or report credentials. CI values are disposable test fixtures.
- Do not mark Phase 2B accepted. Do not merge the branch.
- A discovered, skipped, todo, excluded, or locally-unrunnable required test is not a passing test.

## Long Task Queue

| ID | Objective | Completion proof | Status |
|---|---|---|---|
| O01 | Create the branch and initialize `STATUS.yaml` as planned. | Branch exists remotely at `c107bb3`; status names branch and next task O02. | done |
| O02 | Make test environment, lint, and guardrail verification real. | A deliberate test/lint/guardrail violation is observed failing, then the clean suite passes locally as far as local services permit. | queued |
| O03 | Make integration and E2E suites self-contained for a disposable PostgreSQL database. | Tests target only approved routes and include deterministic seed/cleanup. | queued |
| O04 | Add the GitHub Actions Node 26 + PostgreSQL 16 workflow. | One deliberate red workflow run is recorded, then workflow configuration is corrected. | queued |
| O05 | Run the exact branch head through CI and make the acceptance handoff. | GitHub Actions is green for install, types, lint, integration, E2E, build, and guardrails; status references its URL/SHA. | queued |

## Per-task protocol

For each O-task: read the matching plan task; use test-first; record the observed red result before implementation; run the required verifier; commit one focused change; push the working branch; update only `STATUS.yaml` with the actual SHA, command outputs, and next task. If one task has two failed root-cause fix attempts, stop and report the evidence rather than guessing.

## Stop and report

Stop after O05, or immediately if a change needs a real account/service/credential, production data, a guardrail exception, or a third failed root-cause repair. Return only: branch, head SHA, GitHub Actions URL/conclusion, executed command results, modified files, and blocker (if any).
