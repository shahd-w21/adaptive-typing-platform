// FE-03 browser checks use installed Chrome and an isolated Vite test origin.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '*.spec.js',
  fullyParallel: true,
  workers: 2,
  // Allow cold Vite compilation on teammate laptops; assertions still wait
  // for concrete UI conditions rather than fixed sleeps.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: 'list',
  globalSetup: './tests/support/setup.js',
  use: {
    baseURL: 'http://127.0.0.1:5174',
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
