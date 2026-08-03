# KR1688 Workspace

KR1688 is the Saudi-first, Arabic-native story product workspace inside this repository.

## Workspace truth

- Workspace root: `/kr1688`
- Product direction: AI-driven Arabic story and culture platform
- Foundation stack direction: Payload website foundation, Next.js direction, structured story data, future PostgreSQL + object storage integration

## Current build phase

Phase 2A — Official Foundation Replacement + First Content Model Base.

Status: **Official Payload website starter imported.** `/kr1688/app` is now a real Payload 4 / Next.js 16 project (not fallback skeleton).

Foundation stack:
- **CMS:** Payload 4 (official website template)
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS 4 + shadcn/ui
- **Database:** MongoDB (local dev)
- **Runtime:** Node.js >= 24.15.0, pnpm ^11

This phase delivers:
- Official starter imported and verified
- First content model base (stories, chapters, media, users, comments)
- Arabic-first site settings (RTL default, Saudi-first emphasis)
- Minimal frontend direction (story-first, no ecommerce framing)

This phase is not for:

- deployment
- secrets / real database connections
- payments
- author ecosystem
- search/recommendation
- large AI automation layers
- merging to main

## Repository boundary rules

- PV lives under `/pv`
- KR1688 lives under `/kr1688`
- KR1688 work must not modify PV files unless there is a later explicit repository-level migration task

## Working documents

- Design: `docs/superpowers/specs/2026-08-03-kr1688-foundation-build-design.md`
- Plan: `docs/superpowers/plans/2026-08-03-kr1688-foundation-build.md`
