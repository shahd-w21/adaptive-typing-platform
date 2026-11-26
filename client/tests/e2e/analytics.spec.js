/** Browser acceptance checks for FE-31 analytics flows, fixture labelling, and filter stability. */
import { test, expect } from '../support/browser.js';
import AxeBuilder from '@axe-core/playwright';
import { studentUser } from '../fixtures/data.js';

const adminUser = {
  ...studentUser,
  id: '10000000-0000-4000-8000-000000000099',
  email: 'admin@example.test',
  name: 'Admin User',
  role: 'admin',
};

function buildAnalyticsPayload(win = '7d') {
  return {
    window: win,
    windowStart: '2026-11-19T00:00:00.000Z',
    windowEnd: '2026-11-26T00:00:00.000Z',
    activeUsers: { count: 14, windowDays: win === '90d' ? 90 : win === '30d' ? 30 : 7 },
    sessions: {
      total: 42,
      byMode: { practice: 30, placement: 12 },
      completionRate: 0.905,
    },
    speedByMode: [
      {
        mode: 'practice',
        sessionCount: 30,
        avgNetWpm: 46.4,
        avgGrossWpm: 49.1,
        avgRawAccuracy: 94.2,
        avgFinalAccuracy: 95.5,
      },
      {
        mode: 'placement',
        sessionCount: 12,
        avgNetWpm: 39.8,
        avgGrossWpm: 42.0,
        avgRawAccuracy: 91.0,
        avgFinalAccuracy: 92.3,
      },
    ],
    problemKeys: [
      { key: 'p', errorCount: 18, attemptCount: 120, errorRate: 0.15 },
      { key: 'q', errorCount: 0, attemptCount: 0, errorRate: null },
    ],
    generation: {
      totalAssignments: 42,
      aiPassCount: 0,
      fallbackCount: 42,
      aiPassRate: null,
      fallbackRate: 1,
    },
    pagination: { page: 1, pageSize: 20, total: 2 },
  };
}

async function setupAnalyticsAcceptance(page, { status = 404 } = {}) {
  const currentUser = {
    ...adminUser,
    preferences: { themePreference: 'light', uiLocale: 'en' },
  };

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api/v1', '');

    if (path === '/auth/me') {
      return route.fulfill({
        json: { user: currentUser, csrfToken: 'a'.repeat(64) },
      });
    }
    if (path === '/users/me' && request.method() === 'PATCH') {
      const patch = request.postDataJSON();
      currentUser.preferences = { ...currentUser.preferences, ...patch.preferences };
      return route.fulfill({ json: { user: currentUser } });
    }
    if (path === '/admin/ping') {
      return route.fulfill({ json: { message: 'Welcome, admin' } });
    }
    if (path === '/admin/analytics') {
      if (status !== 200) {
        return route.fulfill({
          status,
          json: { error: { code: 'NOT_FOUND' } },
        });
      }
      return route.fulfill({ json: buildAnalyticsPayload('7d') });
    }
    return route.fulfill({ status: 404, json: { error: { code: 'NOT_FOUND' } } });
  });
}

test('labels future analytics endpoint as fixture/API-blocked when 404 and keeps zero denominators unavailable', async ({
  page,
}) => {
  await setupAnalyticsAcceptance(page, { status: 404 });
  await page.goto('/admin');

  await expect(page.getByText('Development fixture', { exact: true })).toBeVisible();
  await expect(page.getByText('Not available').first()).toBeVisible();
  await expect(page.getByText('0.0 %')).toHaveCount(0);
  await expect(page.getByText('100.0 %')).toHaveCount(0);
});

test('separates learning and assessment modes, preserves window filter across appearance/language changes, and passes axe', async ({
  page,
}) => {
  await setupAnalyticsAcceptance(page, { status: 200 });
  await page.goto('/admin');

  await expect(page.getByRole('heading', { name: 'Practice (Learning)' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Placement (Assessment)' })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();

  // Change window filter to 30d, then switch theme and language.
  await page.locator('#analytics-window').selectOption('30d');
  await expect(page.locator('#analytics-window')).toHaveValue('30d');

  await page.getByRole('button', { name: /Appearance:/i }).click();
  await page.getByRole('menuitemradio', { name: 'Dark' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('button', { name: /Language:/i }).click();
  await page.getByRole('menuitemradio', { name: 'العربية' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  // Reporting window selection must remain 30d after appearance/locale switches.
  await expect(page.locator('#analytics-window')).toHaveValue('30d');

  const results = await new AxeBuilder({ page })
    .include('#main-content')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
