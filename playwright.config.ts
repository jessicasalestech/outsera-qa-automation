import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { env } from './src/config/env';

// A suíte E2E é escrita em Gherkin e o playwright-bdd converte em testes do Playwright.
// O bddgen roda antes do teste (veja o script test:e2e no package.json).
const e2eTestDir = defineBddConfig({
  features: 'tests/e2e/features/**/*.feature',
  steps: ['tests/e2e/steps/**/*.ts', 'tests/e2e/fixtures.ts'],
  outputDir: '.features-gen',
  language: 'pt',
  missingSteps: 'fail-on-gen',
});

export default defineConfig({
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // Os sites testados são demos públicos e às vezes oscilam. Retry só no CI,
  // para que a execução local mostre sempre o resultado da primeira tentativa.
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],
  use: {
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
        actionTimeout: 20_000,
      },
    },
    {
      name: 'e2e',
      testDir: e2eTestDir,
      timeout: 120_000,
      // O site demo usa uma conta só e mantém o carrinho no servidor,
      // então rodo um teste por vez para não misturar estado.
      fullyParallel: false,
      workers: 1,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: env.baseUrl,
      },
    },
  ],
});
