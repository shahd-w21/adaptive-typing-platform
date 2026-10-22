// Shared-interface and forum browser checks use Chrome and an isolated Vite origin.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['shared-ui.spec.js', 'forum.spec.js'],
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
