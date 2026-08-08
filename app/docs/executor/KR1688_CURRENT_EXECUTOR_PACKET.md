---
type: executor_packet
domain: publishing
project: kr1688-global-ai-story-entertainment
packet_id: KR1688-PHASE2B-REPAIR-02
phase_id: PHASE-2B
status: awaiting_acceptance
owner: Marvis
planner: Codex
acceptor: Codex
repository_url: https://github.com/xhs13689060096-a11y/kr1688
base_branch: main
working_branch: main
created: 2026-08-05
updated: 2026-08-07
tags: [kr1688, marvis, phase-2b, repair-02, payload, rtl, repository-mirror]
---

# KR1688 Phase 2B Repair-02 — Security, Test Truth, and Acceptance Closure (Repository Mirror)

> This file is the repository-side mirror of the Vault executor packet.
> Vault is authority. This file must stay synchronized.

## Mission

Repair the rejected Phase 2B baseline at commit `82e538e`. Make V1 safe, testable, truthful, and internally consistent.

## Long Task Queue

| ID | Status | Objective |
|---|---|---|
| S01 | done | Baseline evidence, mirror reconciliation, repair plan |
| S02 | done | Toolchain truth — flat ESLint, test discovery |
| S03 | done | Reader identity — roles, anti-spoofing, ownership |
| S04 | done | Comment authorization — req.user override, moderation |
| S05 | done | Stale template cleanup — /search, OG, README, tsconfig |
| S06 | done | Compatible runtime — lint/types/build 0 |
| S07 | done | Final QA — code review, status sync, commit, push |

## S06 Verification

| Verifier | Exit |
|---|---|
| Node v26.4.0 | 0 |
| pnpm install --frozen-lockfile | 0 |
| pnpm generate:types | 0 |
| pnpm lint | 0 |
| pnpm build | 0 |
| Integration tests | 36 discovered (needs PG) |

## Rejection Evidence — All Resolved

| E1-E7 | S01-S06 resolved all 7 findings |

## Permanent Guardrails

- No deployment/Vercel, cloud credentials/services, real content/assets, payment, author system, Meilisearch, recommendations, native app, sitemap, RSS, JSON-LD, IndexNow, indexing, SEO/search/reindex plugin, or Phase 3A.
