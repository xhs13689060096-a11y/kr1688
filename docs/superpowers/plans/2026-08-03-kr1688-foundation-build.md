# KR1688 Foundation Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the KR1688 workspace into a real Saudi-first, Arabic-native project foundation under `/kr1688`.

**Architecture:** Use an official Payload website-style starter as the preferred base, but keep the repository split strict: PV under `/pv`, KR1688 under `/kr1688`. If external bootstrap is blocked, fall back to a local no-dependency skeleton so the workspace still becomes executable and AI-readable.

**Tech Stack:** Payload CMS starter direction, Next.js direction, Node.js, pnpm, repository-local docs

## Global Constraints

- Do not modify `/pv` as part of KR1688 foundation build.
- Do not deploy.
- Do not configure secrets.
- Do not add author ecosystem features.
- Do not add search/recommendation/payment systems.
- Keep all KR1688 work under `/kr1688`.

---

### Task 1: Replace placeholder workspace with real KR1688 workspace docs

**Files:**
- Modify: `kr1688/README.md`
- Create: `kr1688/docs/superpowers/specs/2026-08-03-kr1688-foundation-build-design.md`
- Create: `kr1688/docs/superpowers/plans/2026-08-03-kr1688-foundation-build.md`

**Interfaces:**
- Consumes: existing `/kr1688` placeholder workspace
- Produces: workspace-level truth for future bootstrap and executor work

- [ ] Rewrite `kr1688/README.md` as the KR1688 workspace charter.
- [ ] Save the foundation build design doc.
- [ ] Save the implementation plan doc.

### Task 2: Bootstrap the first real project skeleton

**Files:**
- Create or import: files under `kr1688/`
- Test: workspace structure under `kr1688/`

**Interfaces:**
- Consumes: approved KR1688 foundation design
- Produces: a real inspectable KR1688 app skeleton

- [ ] Try the official Payload website-style bootstrap inside `kr1688/`.
- [ ] If bootstrap is blocked, create a local fallback skeleton with package and app boundaries.
- [ ] Verify `/kr1688` is no longer placeholder-only.

### Task 3: Verify repository split integrity

**Files:**
- Test: `pv/`
- Test: `kr1688/`

**Interfaces:**
- Consumes: migrated split repository
- Produces: evidence that KR1688 bootstrap did not cross into PV

- [ ] Verify only `/kr1688` changed for KR1688 foundation work.
- [ ] Run `git diff --check`.
- [ ] Commit KR1688 foundation bootstrap as its own isolated change.
