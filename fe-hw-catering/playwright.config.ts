import type { PlaywrightTestConfig } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';

/**
 * Black Box Test configuration for HW Katering frontend (Next.js).
 *
 * The frontend communicates with the Laravel backend API at
 * http://127.0.0.1:8000/api (configured via NEXT_PUBLIC_API_URL in .env.local).
 *
 * Playwright drives the browser against http://localhost:3000 (the Next.js
 * dev server). Authentication is performed API-first (POST /api/login) and the
 * resulting token is injected into localStorage so the AuthContext hydrates
 * without going through the login UI on every test.
 */
export default defineConfig({
  // Directory where test files live.
  testDir: './tests',

  // Glob pattern for test files.
  testMatch: /(.+\.(test|spec))\.(ts|tsx)$/,

  // Base URL used by page.goto('/').
  baseURL: 'http://localhost:3000',

  // Timeout for each test.
  timeout: 30000,

  // Timeout for each expect() assertion.
  expect: {
    timeout: 5000,
  },

  // Run tests in CI-like isolation: one worker file at a time is not required,
  // but fully parallel workers can cause flaky API state. Keep it moderate.
  workers: process.env.CI ? 2 : undefined,

  // Retry strategy: retry once to tolerate transient timing issues.
  retries: 1,

  // Reporter: HTML report for reporting, list for console feedback.
  reporter: process.env.CI ? 'html' : 'list',

  // Screenshot and trace on failure.
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
    // Navigation timeout.
    navigationTimeout: 30000,
    // Headless by default; set HEADLESS=false to run headed.
    headless: process.env.HEADLESS !== 'false',
  },

  // Browser projects. Only Chromium (system Chrome via channel) is available
  // on this Ubuntu 26.04 host. Firefox/WebKit are not packaged for this
  // platform and are intentionally omitted (see PLAYWRIGHT_GUIDE.md).
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],

  // Start the backend (Laravel) and frontend (Next.js) servers before tests
  // and stop them afterwards. The script is idempotent: it skips starting a
  // server that is already listening on its port.
  webServer: {
    command: './scripts/start-servers.sh',
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
