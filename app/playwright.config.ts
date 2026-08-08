import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv'

dotenv.config({ path: 'test.env' })

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
  ],
  webServer: {
    command: 'pnpm build && pnpm start',
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? '',
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ?? '',
      NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://127.0.0.1:3000',
      CRON_SECRET: process.env.CRON_SECRET ?? '',
      PREVIEW_SECRET: process.env.PREVIEW_SECRET ?? '',
    },
    reuseExistingServer: true,
    timeout: 5 * 60 * 1000,
    url: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://127.0.0.1:3000',
  },
})
