# E02 Important review fixes

## Scope

- `POST /api/reader/comments` and `createPublishedComment` now accept only `{ chapterId, body }`.
- Extra protected client fields `author`, `story`, `chapter`, `parent`, and `status` are explicitly rejected. The existing route error mapping returns HTTP 400.
- The hidden-comment integration test now uses an unauthenticated Payload query filtered only by `chapter`, proving access control excludes the hidden comment without a caller-supplied status filter.

## Test coverage

`tests/int/reader-loop.test.ts` creates its reader, published story, and published chapter within each protected-field case. It verifies every protected field is rejected by both the helper and the authenticated POST route (400), and it creates/hides the comment used by the unauthenticated chapter-only visibility test in that same test.

## Local verification

- `pnpm test:int -- tests/int/reader-loop.test.ts tests/int/comments.test.ts --reporter=verbose` — blocked before semantic execution because this workstation cannot connect to the required PostgreSQL instance (`EPERM` for `127.0.0.1:5432` and `::1:5432`).
- `pnpm exec eslint src/utilities/readerComments.ts tests/int/reader-loop.test.ts` — passed.
- `pnpm exec tsc --noEmit --incremental false --pretty false` — reports existing errors in `tests/int/comments.test.ts`, `tests/int/favorites-reading.test.ts`, and `tests/int/security-auth.test.ts`; it reports no error in either changed file.

## Preserved behavior

- Author derivation, published/draft chapter checks, administrator hide/delete, and reader delete refusal are unchanged.
- `payload-types.ts` and `tsconfig.tsbuildinfo` were not modified.
