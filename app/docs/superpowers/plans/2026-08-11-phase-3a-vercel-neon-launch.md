# Phase 3A Vercel, Neon, and Cloudflare Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the retired `kr1688-site` production deployment with the accepted KR1688 story platform at `https://kr1688.com` without exposing database credentials or causing an avoidable outage.

**Architecture:** A new Vercel project hosts the current accepted execution branch from `app/`. Neon supplies the production PostgreSQL connection only through Vercel Production environment variables. The first deployment is tested at its generated Vercel hostname; after it is healthy, Vercel reassigns both hostnames atomically and supports immediate reassignment rollback before the old project is deleted.

**Tech Stack:** Next.js 16, Payload CMS 4, PostgreSQL 18 on Neon, Vercel Node.js 24 runtime, Cloudflare DNS.

## Global Constraints

- Work only from `marvis/ops-01-automated-acceptance`; never modify or merge `main`.
- Never print, commit, transmit, or store a real `DATABASE_URL` or secret in this repository, chat, CI logs, or status files.
- Do not run `neonctl init`, enable Neon Auth, or use the old `kr1688-site` project for the new deployment.
- Canonical URL is `https://kr1688.com`; `https://www.kr1688.com` must redirect permanently.
- Do not alter Cloudflare DNS or delete `kr1688-site` until the new deployment has passed all documented smoke checks.
- Exact GitHub Actions success is necessary but production readiness also requires a successful Vercel deployment and live HTTPS checks.
- Every Vercel CLI deployment and link command uses `--cwd app`; repository-root deployment is forbidden.

---

## File structure

- Modify: `app/docs/executor/STATUS.yaml` — record real Phase 3A task state, Vercel deployment URL, domain state, and any credential-handling block.
- Create: `app/docs/executor/PHASE3A_LAUNCH_REPORT.md` — immutable handoff record of deployment, smoke checks, DNS cutover, rollback decision, and old-project retirement.
- Modify: `app/docs/superpowers/specs/2026-08-11-phase-3a-vercel-neon-launch-design.md` only if actual provider requirements differ from the approved design.

### Task 1: Create and bind the isolated Vercel project

**Files:**
- Modify: `app/docs/executor/STATUS.yaml`

**Consumes:** accepted branch `marvis/ops-01-automated-acceptance`; Vercel account `jt6kbggd86-3765`.

**Produces:** a new Vercel project named `kr1688-reader`, linked to this checkout with `app/` as root, but with no production aliases and no deployment accepted yet.

- [ ] **Step 1: Record the expected unsafe condition**

Run: `vercel inspect https://kr1688-site.vercel.app`

Expected: the retired project owns `kr1688.com` and `www.kr1688.com`; therefore the new project must not be given either alias before its smoke checks pass.

- [ ] **Step 2: Create the new project without deploying it**

Run: `vercel project add kr1688-reader`

Expected: Vercel reports a newly created `kr1688-reader` project in the authenticated account. If it already exists, inspect it and continue only if it has no production aliases and is not linked to unrelated code.

- [ ] **Step 3: Link the actual application directory**

Run: `vercel link --cwd app --yes --project kr1688-reader && vercel project inspect kr1688-reader`

Expected: `app/.vercel/project.json` identifies `kr1688-reader`; all later deployment commands use `--cwd app`, so no repository-root deployment can occur.

- [ ] **Step 4: Verify the project has no production domain aliases**

Run: `vercel project ls && vercel domains ls kr1688-reader`

Expected: no `kr1688.com` or `www.kr1688.com` alias belongs to `kr1688-reader` yet.

- [ ] **Step 5: Commit executor state**

Run: `git add app/docs/executor/STATUS.yaml && git commit -m "docs: record Phase 3A Vercel project preflight"`

Expected: one documentation-only commit records project identity and alias safety state without secrets.

### Task 2: Configure secret-safe Vercel environments

**Files:**
- Modify: `app/docs/executor/STATUS.yaml`

**Consumes:** Vercel project `kr1688-reader`; Neon project `kr1688-production`; app required variables declared in `app/src/environment.ts`.

**Produces:** Production environment contains all five required variables; no value appears in command output or repository files.

- [ ] **Step 1: Prove deployment cannot safely start without production configuration**

Run: `vercel env ls production`

Expected: required production variables are absent before configuration. Do not deploy while any required variable is absent.

- [ ] **Step 2: Add non-database production settings**

Run: add `NEXT_PUBLIC_SERVER_URL` with value `https://kr1688.com`; generate each of `PAYLOAD_SECRET`, `CRON_SECRET`, and `PREVIEW_SECRET` with a cryptographically secure local generator and pipe each value directly to `vercel env add <NAME> production` without echoing it.

Expected: `vercel env ls production` lists the four variable names but never their values.

- [ ] **Step 3: Stop at the owner-only database input boundary**

Action: open Vercel Dashboard → `kr1688-reader` → Settings → Environment Variables → Production; owner pastes the Neon production connection string into the `DATABASE_URL` value field and saves it.

Expected: the agent receives only confirmation that `DATABASE_URL` is set; the connection string is never requested or displayed. This is required because the value exists only in the owner-controlled Neon dashboard.

- [ ] **Step 4: Verify variable names only**

Run: `vercel env ls production`

Expected: exactly `DATABASE_URL`, `PAYLOAD_SECRET`, `CRON_SECRET`, `PREVIEW_SECRET`, and `NEXT_PUBLIC_SERVER_URL` appear in Production. No command may output a value.

- [ ] **Step 5: Commit executor state**

Run: `git add app/docs/executor/STATUS.yaml && git commit -m "docs: record Phase 3A production environment readiness"`

Expected: the status contains only variable names and readiness result, not values.

### Task 3: Deploy and verify the new production candidate

**Files:**
- Modify: `app/docs/executor/STATUS.yaml`

**Consumes:** Task 2's complete Production environment and the accepted branch.

**Produces:** a generated Vercel-hostname production candidate with a healthy Payload app connected to the owner-configured Neon database.

- [ ] **Step 1: Establish the failing precondition check**

Run: `vercel env ls production`

Expected: if any of the five variable names is absent, do not run deployment; record the missing name as a block. If all exist, proceed.

- [ ] **Step 2: Deploy the accepted branch as a Vercel production candidate**

Run: `vercel --cwd app deploy --prod --yes`

Expected: Vercel reports a unique `kr1688-reader` deployment URL; it is not yet assigned `kr1688.com` or `www.kr1688.com`.

- [ ] **Step 3: Run public and authenticated smoke checks**

Run: `curl --fail --silent --show-error <deployment-url>/` and Playwright against `<deployment-url>` using a newly created reader account.

Expected: public home/story/chapter pages return HTTPS success; reader login, favorite, progress, immediate comment, and Payload `/admin/login` render without a server error. Record response codes and test names only.

- [ ] **Step 4: Verify schema/database behavior without exposing credentials**

Run: inspect Vercel function/deployment logs for successful Payload startup and absence of `cannot connect to Postgres`; do not request or print connection data.

Expected: no connection error; the new Neon database accepts the application schema and records the smoke-test data.

- [ ] **Step 5: Commit executor state**

Run: `git add app/docs/executor/STATUS.yaml && git commit -m "docs: record Phase 3A deployment candidate evidence"`

Expected: the status records deployment URL, exact SHA, smoke outcome, and rollback condition without credentials.

### Task 4: Cut over the canonical domain and retire the old project

**Files:**
- Create: `app/docs/executor/PHASE3A_LAUNCH_REPORT.md`
- Modify: `app/docs/executor/STATUS.yaml`

**Consumes:** healthy Task 3 deployment; Cloudflare DNS zone; existing `kr1688-site` aliases.

**Produces:** apex domain on `kr1688-reader`, `www` redirect, a recorded rollback choice, and no remaining `kr1688-site` project.

- [ ] **Step 1: Establish the pre-cutover safety check**

Run: `vercel inspect <deployment-url>` and `vercel inspect https://kr1688-site.vercel.app`

Expected: the candidate is Ready and the old project still owns the production aliases; if candidate is not Ready, stop without changing DNS.

- [ ] **Step 2: Execute the atomic project-domain reassignment**

Run: `vercel domains add kr1688.com kr1688-reader --force` and `vercel domains add www.kr1688.com kr1688-reader --force`

Expected: Vercel reassigns both aliases from `kr1688-site` to `kr1688-reader` and reports any required DNS records. This is the production routing cutover. Do not delete the old project yet.

- [ ] **Step 3: Apply Cloudflare DNS change and canonical redirect**

Action: preserve existing Cloudflare records if Vercel reports they are valid; otherwise replace only the exact records Vercel reports as invalid. Configure Vercel domain settings to redirect `www.kr1688.com` permanently to `kr1688.com`.

Expected: `curl -I https://kr1688.com` returns HTTPS success and `curl -I https://www.kr1688.com` returns a permanent redirect to `https://kr1688.com`. If either check fails, immediately run `vercel domains add kr1688.com kr1688-site --force` and `vercel domains add www.kr1688.com kr1688-site --force`, then record the rollback.

- [ ] **Step 4: Execute post-cutover smoke checks**

Run: repeat Task 3 Step 3 against `https://kr1688.com` and confirm no Vercel/Cloudflare TLS error, no Payload startup error, and correct canonical redirect.

Expected: all previously tested reader and admin routes work under the canonical domain.

- [ ] **Step 5: Delete the retired Vercel project only after healthy checks**

Run: `vercel project rm kr1688-site --yes`

Expected: Vercel confirms deletion; `kr1688.com` remains served by `kr1688-reader`. If any post-cutover check fails, do not run this command and restore the prior DNS records instead.

- [ ] **Step 6: Create the launch record and commit it**

Run: create `app/docs/executor/PHASE3A_LAUNCH_REPORT.md`, then `git add app/docs/executor/PHASE3A_LAUNCH_REPORT.md app/docs/executor/STATUS.yaml && git commit -m "docs: record Phase 3A production launch"`

Expected: report includes exact deployment URL, SHA, domain result, smoke test result, old-project deletion result, and rollback decision; it contains no secrets.

### Task 5: Final independent launch review

**Files:**
- Modify: `app/docs/executor/STATUS.yaml`

**Consumes:** Task 4 launch report, Vercel deployment evidence, Cloudflare DNS evidence, and exact GitHub Actions run for the final branch HEAD.

**Produces:** an independent accept/reject decision. A rejection preserves the new project and old-project deletion evidence; it never silently alters DNS.

- [ ] **Step 1: Request read-only review**

Review scope: domain ownership, HTTPS/canonical redirect, no exposed credentials, Vercel project isolation, Neon connection health, public reader paths, Payload admin login, exact GitHub Actions SHA, and proof that `kr1688-site` was deleted only after healthy cutover.

Expected: reviewer reports Critical/Important/Minor findings or approves.

- [ ] **Step 2: Record acceptance only with complete evidence**

Run: update `STATUS.yaml`, commit with `git commit -m "docs: record Phase 3A acceptance"`, push, and verify exact GitHub Actions HEAD success.

Expected: `acceptance_requested: true` only if no review blocker exists and the final exact CI succeeds.
