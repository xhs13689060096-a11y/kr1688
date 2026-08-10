# E02 final test repair

## Changes

- Removed the direct route POST and `payload.login` JWT construction from the protected-field table test in `app/tests/int/reader-loop.test.ts`.
- Kept all five helper whitelist-rejection cases: `author`, `story`, `chapter`, `parent`, and `status`.
- Added the route-level protected `status` assertion to the existing authenticated reader E2E flow. It uses `page.evaluate()` and the browser's established session cookie to POST `{ chapterId, body, status: 'hidden' }`, then asserts HTTP 400 and an error containing `status`.

## Verification

- `pnpm exec prettier --check tests/int/reader-loop.test.ts tests/e2e/frontend.e2e.spec.ts` — passed.
- `pnpm exec eslint tests/int/reader-loop.test.ts tests/e2e/frontend.e2e.spec.ts` — passed.
- `pnpm test:int -- tests/int/reader-loop.test.ts --reporter=verbose` — could not reach semantic test execution because PostgreSQL is unavailable in this environment: `EPERM` connecting to both `::1:5432` and `127.0.0.1:5432`. This also prevented a local red run against the old production behavior.

## Scope preserved

- No production files were changed.
- `app/src/payload-types.ts` and `app/tsconfig.tsbuildinfo` were left untouched; their pre-existing working-tree changes are not part of this fix.
