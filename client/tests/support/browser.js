/** Keep UI checks independent of external font delivery; production fonts are unchanged. */
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, runFixture) => {
    // Offline font delivery can consume most of a test's timeout even when
    // React has rendered. These tests explicitly exercise fallback fonts.
    await page.route('https://fonts.googleapis.com/**', (route) =>
      route.fulfill({ body: '', contentType: 'text/css' }),
    );
    await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
    await runFixture(page);
  },
});

export { expect };
