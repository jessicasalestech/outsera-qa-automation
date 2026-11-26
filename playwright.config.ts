import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { env } from './src/config/env';

/**
 * Gherkin (Cucumber) suite is compiled into native Playwright tests by playwright-bdd.
 * `npm run test:e2e` runs `bddgen` first, which generates the files inside `.features-gen`.
 * The fixtures file is part of the `steps` pattern on purpose: it is the test
 * instance that the generated specs import.
 */
const e2eTestDir = defineBddConfig({
  features: 'tests/e2e/features/**/*.feature',
  steps: ['tests/e2e/steps/**/*.ts', 'tests/e2e/fixtures.ts'],
  outputDir: '.features-gen',
  language: 'en',
  missingSteps: 'fail-on-gen',
});

export default defineConfig({
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // Public demo targets occasionally hiccup; retries are limited to CI runs
  // so a local run always shows the real, first-attempt result.
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],
  use: {
    // All page objects and steps use the `data-test` attribute from the app under test.
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      fullyParallel: true,
      use: {
        baseURL: env.apiUrl,
        extraHTTPHeaders: { Accept: 'application/json' },
        // Restful-booker is a free public demo API: give it a bit of slack.
        actionTimeout: 20_000,
      },
    },
    {
      name: 'e2e',
      testDir: e2eTestDir,
      timeout: 120_000,
      // The demo site shares one customer account and one server-side cart per session,
      // so the E2E project runs serially on purpose (stable > fast).
      fullyParallel: false,
      workers: 1,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: env.baseUrl,
      },
    },
  ],
});
