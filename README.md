# KR1688

Independent repository for KR1688 — a Saudi-first, Arabic-native story product. Built on the official Payload 4 / Next.js 16 website starter.

## Workspace truth

- Repository: `https://github.com/xhs13689060096-a11y/kr1688`
- Branch: `main`
- Product direction: AI-driven Arabic story and culture platform
- Foundation stack: Payload website foundation, Next.js, structured story data

## Current build phase

Phase 2B — Saudi-first Product Base (active)

Foundation stack:
- **CMS:** Payload 4 (official website template)
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS 4 + shadcn/ui
- **Database:** MongoDB (local dev)
- **Runtime:** Node.js >= 24.15.0, pnpm ^11

This phase delivers:
- Saudi-first, Arabic-RTL public pages (home, story detail, chapter reader)
- Story, Chapter, Media, Comment, Favorite, ReadingProgress data models
- Reader user account, AI Tasks internal layer
- Minimal frontend direction (story-first, no ecommerce framing)

This phase is not for:
- deployment / secrets / real database connections
- payments / author ecosystem / search / recommendation
- large AI automation layers / real external API calls

## Working documents

- Status: `docs/executor/KR1688_STATUS.md`
- Startup: `docs/executor/PHASE2B_STARTUP_NOTE.md`
- Design: `docs/superpowers/specs/2026-08-03-kr1688-foundation-build-design.md`
- Plan: `docs/superpowers/plans/2026-08-03-kr1688-foundation-build.md`
