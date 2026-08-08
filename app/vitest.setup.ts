// KR1688 test environment setup
import dotenv from 'dotenv'
import path from 'path'

// Load test.env explicitly before any test runs.
// CI-provided DATABASE_URL and other vars take precedence via process.env override.
const testEnvPath = path.resolve(import.meta.dirname, 'test.env')
const result = dotenv.config({ path: testEnvPath })
if (result.error) {
  console.warn(`vitest.setup.ts: failed to load test.env from ${testEnvPath}:`, result.error.message)
}
// CI overrides: allow process.env to shadow test.env defaults
// dotenv.config with override=false (default) means existing keys are kept
