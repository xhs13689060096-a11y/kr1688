# SSR Quality Repair Implementation Plan

**Goal:** Eliminate the unhandled SSR exception observed during the E05 Chrome E2E run and
make the quality gate reject it; complete the content-write access proof.

**Constraints:** Stay on `marvis/ops-01-automated-acceptance`; no main change, deployment,
external service, real credentials, or Phase 3A. Use RED → smallest GREEN → exact GitHub
Actions evidence. Local PostgreSQL absence is diagnostic only. Stop after two failed repairs
for the same root cause.

## E06 — clean SSR quality gate

1. Add the missing reader-denial assertions for Story delete and Chapter create/update to
   `tests/int/content-access.test.ts`.
2. Identify which E2E navigation causes SSR digest `1080787956`. Add a focused E2E assertion
   that the affected response is successful and does not render the error digest; make the
   test-only commit and require an exact remote RED that exposes the server error.
3. Inspect the server stack/build artifact and make only the smallest source/configuration fix
   for the identified route or component. Do not suppress or filter server logs.
4. Push one GREEN repair and require its exact PostgreSQL quality gate to pass integration,
   Chrome E2E, build, lint, and guardrails without the unhandled SSR error.
5. Record RED/GREEN SHA and CI URLs in `STATUS.yaml`, then request a fresh independent Phase
   2D final review.
