# Open Reading Comments: Security Repair Evidence

## Verified assessment evidence

- Packet: `KR1688-EXECUTION-02-READER-LOOP`
- Phase: `PHASE-2D-READER-LOOP`
- Branch: `marvis/ops-01-automated-acceptance`
- Assessment commit: `dc1619c76d194c26e35bb39afd2b1a2534d34958`
- Exact CI run: <https://github.com/xhs13689060096-a11y/kr1688/actions/runs/31464529539>
- CI conclusion: `success`

The CI run checked out exactly `dc1619c76d194c26e35bb39afd2b1a2534d34958`; it is the
security-repair evidence for this packet. It is not inferred from a later branch head or an
earlier passing run.

## CI results

The single `quality` job completed successfully with its PostgreSQL 16 service available.
The Verify step completed all required checks:

- Integration tests: 64 passed across 5 test files.
- Chrome E2E tests: 11 passed.
- Lint: completed with 2 warnings and 0 errors.
- Build: completed successfully, including TypeScript checking.
- Guardrails: passed with zero forbidden patterns.

The CI workflow also completed dependency installation and type generation successfully.

## RED evidence and repair

The security test-only RED commit was `c1d6ca05ce1821d9efca2c168a696170ea049442`, with
Actions run <https://github.com/xhs13689060096-a11y/kr1688/actions/runs/31464368773>. It
correctly failed because generic authenticated reader creates succeeded: author spoofing,
mismatched story/chapter references, and replies could bypass the server helper.

The minimal repair makes collection creation admin-only by default and grants readers a
local Payload context capability only from `createPublishedComment`, after it has derived a
published chapter and story. The exact GREEN CI run above validates this behavior. It is not
inferred from an earlier passing run.

## Scope and handoff state

E04 changed these files:

- `app/src/collections/Comments.ts`
- `app/src/utilities/readerComments.ts`
- `app/tests/int/comments.test.ts`
- `app/docs/executor/STATUS.yaml`

`main` was not changed, nothing was deployed, and Phase 3A was not entered. The pre-existing
`app/src/payload-types.ts` and `app/tsconfig.tsbuildinfo` working-tree changes were not touched.

The local PostgreSQL service is unavailable. This was retained solely as a local diagnostic;
it is not presented as a local passing verifier result. The successful GitHub Actions run,
which supplied PostgreSQL, is the evidence used for this security repair.

The next task is final Phase 2D acceptance review; this report does not itself declare product
acceptance.
