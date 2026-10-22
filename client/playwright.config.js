// FE-03 browser checks use installed Chrome and an isolated Vite test origin.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'shared-ui.spec.js',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  globalSetup: './tests/support/setup.js',
  use: {
    baseURL: 'http://127.0.0.1:5174',
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
