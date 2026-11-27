/** Browser UI/accessibility checks for FE-21 Admin Analytics Panel. */
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

function buildPopulatedAnalytics(win = '7d', page = 1) {
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
    pagination: { page, pageSize: 20, total: 25 },
  };
}

async function setupAdminAnalytics(
  page,
  {
    analyticsStatus = 404,
    analyticsPayload = null,
    locale = 'en',
    theme = 'light',
  } = {},
) {
  const currentUser = {
    ...adminUser,
    preferences: { themePreference: theme, uiLocale: locale },
  };
  let currentStatus = analyticsStatus;
  let currentPayload = analyticsPayload;
  const requestedWindows = [];

  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace('/api/v1', '');

    if (path === '/auth/me') {
      return route.fulfill({
        json: { user: currentUser, csrfToken: 'a'.repeat(64) },
      });
    }
    if (path === '/admin/ping') {
      return route.fulfill({
        json: { message: 'Welcome, admin' },
      });
    }
    if (path === '/admin/analytics') {
      requestedWindows.push(currentStatus);
      if (currentStatus !== 200) {
        return route.fulfill({
          status: currentStatus,
          json: { error: { code: currentStatus === 404 ? 'NOT_FOUND' : 'SERVICE_UNAVAILABLE' } },
        });
      }
      return route.fulfill({
        status: 200,
        json: currentPayload ? currentPayload('7d', 1) : buildPopulatedAnalytics('7d', 1),
      });
    }
    return route.fulfill({ status: 404, json: { error: { code: 'NOT_FOUND' } } });
  });

  return {
    requestedWindows,
    setAnalytics(nextStatus, nextPayload = null) {
      currentStatus = nextStatus;
      currentPayload = nextPayload;
    },
  };
}

test.describe('Admin analytics panel (FE-21)', () => {
  test('shows development fixture notice and "Not available" for zero denominators on 404', async ({
    page,
  }) => {
    await setupAdminAnalytics(page, { analyticsStatus: 404 });
    await page.goto('/admin');

    await expect(page.getByRole('heading', { name: 'Platform Analytics' })).toBeVisible();
    await expect(page.getByText('Development fixture', { exact: true })).toBeVisible();
    await expect(page.getByText('Not available').first()).toBeVisible();
    await expect(page.getByText('0.0 %')).toHaveCount(0);
    await expect(page.getByText('100.0 %')).toHaveCount(0);
  });

  test('renders separated mode breakdowns, problem keys pagination, and updates on window change', async ({
    page,
  }) => {
    const mock = await setupAdminAnalytics(page, { analyticsStatus: 200 });
    await page.goto('/admin');

    await expect(page.getByRole('heading', { name: 'Platform Analytics' })).toBeVisible();
    await expect(page.getByText(/learning and assessment modes are always shown separately/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Practice (Learning)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Placement (Assessment)' })).toBeVisible();
    await expect(page.getByText(/all modes/i)).toHaveCount(0);

    // Problem keys table and pagination (total: 25, pageSize: 20 -> 2 pages)
    await expect(page.getByRole('region', { name: 'Problem keys table' })).toBeVisible();
    await expect(page.getByText('Page 1 of 2')).toBeVisible();

    // Switch window to 30d and confirm a fresh query is issued
    const beforeCount = mock.requestedWindows.length;
    await page.getByLabel(/Reporting window/i).selectOption('30d');
    await expect.poll(() => mock.requestedWindows.length).toBeGreaterThan(beforeCount);

    // Axe accessibility check on main content
    const results = await new AxeBuilder({ page })
      .include('#main-content')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('shows error message with retry on 503 and recovers; renders cleanly in RTL dark 320px', async ({
    page,
  }) => {
    const mock = await setupAdminAnalytics(page, { analyticsStatus: 503 });
    await page.goto('/admin');

    const alert = page.getByRole('alert').filter({ hasText: 'Could not load analytics' });
    await expect(alert).toBeVisible();

    mock.setAnalytics(200);
    await alert.getByRole('button', { name: /retry/i }).click();
    await expect(alert).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Practice (Learning)' })).toBeVisible();

    await page.evaluate(() => {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.classList.add('dark');
    });
    await page.setViewportSize({ width: 320, height: 800 });
    await expect(page.getByRole('heading', { name: 'Platform Analytics' })).toBeVisible();

    const hasScrollbar = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasScrollbar).toBe(false);
  });
});
