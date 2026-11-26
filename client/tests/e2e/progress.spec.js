/** Browser UI/accessibility checks for FE-11 Progress, Heat Map & History Filters. */
import { test, expect } from '../support/browser.js';
import AxeBuilder from '@axe-core/playwright';
import {
  studentUser,
  newStudentUser,
  completedSessions,
  keyStats,
} from '../fixtures/data.js';

async function setupProgress(
  page,
  {
    user = studentUser,
    locale = 'en',
    theme = 'light',
    progressStatus = 200,
    progressPayload = { sessions: completedSessions, keys: keyStats },
  } = {},
) {
  let currentUser = structuredClone(user);
  currentUser.preferences = { themePreference: theme, uiLocale: locale };
  let currentStatus = progressStatus;
  let currentPayload = structuredClone(progressPayload);

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
      currentUser.preferences = {
        ...currentUser.preferences,
        ...patch.preferences,
      };
      return route.fulfill({ json: { user: currentUser } });
    }
    if (path === '/auth/logout') {
      return route.fulfill({ json: { ok: true } });
    }
    if (path === '/progress') {
      return route.fulfill({
        status: currentStatus,
        json:
          currentStatus === 200
            ? currentPayload
            : { error: { code: 'SERVICE_UNAVAILABLE' } },
      });
    }
    return route.fulfill({ status: 404, json: { error: { code: 'NOT_FOUND' } } });
  });

  return {
    setProgress(nextStatus, nextPayload) {
      currentStatus = nextStatus;
      if (nextPayload) currentPayload = structuredClone(nextPayload);
    },
    switchUser(nextUser, nextPayload) {
      currentUser = structuredClone(nextUser);
      currentPayload = structuredClone(nextPayload);
    },
  };
}

test('renders separated trends, QWERTY heat map with unavailable latency, and accessible tables', async ({
  page,
}) => {
  await setupProgress(page);
  await page.goto('/progress');

  await expect(
    page.getByRole('heading', { name: 'Progress & Session Analytics' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Learning Sessions' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Assessment Sessions' }),
  ).toBeVisible();

  // Locked key 'q' has null avgMs and must show "Not available", never "0 ms".
  await page.getByRole('button', { name: /^Q — Locked/i }).click();
  const detailRegion = page.locator('[aria-live="polite"]');
  await expect(detailRegion).toContainText('Not available');
  await expect(detailRegion).not.toContainText('0 ms');

  // Toggle accessible tables for trends and key evidence.
  await page.getByRole('button', { name: 'View trend data table' }).click();
  await expect(page.getByRole('table').first()).toBeVisible();
  await page.getByRole('button', { name: 'View key evidence table' }).click();
  await expect(
    page.getByRole('table', { name: 'Key Evidence Table' }),
  ).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include('#main-content')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('supports mode/difficulty/time filters, empty state recovery, and error retry', async ({
  page,
}) => {
  const controller = await setupProgress(page, { progressStatus: 503 });
  await page.goto('/progress');

  await expect(
    page.getByRole('button', { name: 'Retry', exact: true }),
  ).toBeVisible();
  controller.setProgress(200, { sessions: completedSessions, keys: keyStats });
  await page.getByRole('button', { name: 'Retry', exact: true }).click();

  await expect(page.getByText('Session records')).toBeVisible();
  await page.getByLabel('Mode').selectOption('timed');
  await expect(
    page.getByText('No sessions match these filters.'),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Clear filters' }).first().click();
  await expect(page.getByRole('cell', { name: 'Practice' }).first()).toBeVisible();
});

test('supports Arabic RTL, Dark mode, and 320px mobile reflow without horizontal page overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await setupProgress(page, {
    user: newStudentUser,
    locale: 'ar',
    theme: 'dark',
    progressPayload: { sessions: [], keys: keyStats },
  });
  await page.goto('/progress');

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(
    page.getByRole('heading', { name: 'التقدم وتحليلات الجلسات' }),
  ).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});

test('keeps filters intact across theme/language changes and isolates private data on account switch', async ({
  page,
}) => {
  const controller = await setupProgress(page);
  await page.goto('/progress');

  // Real migrated /progress response has no development fixture notice.
  await expect(page.getByText('Development fixture')).toHaveCount(0);

  // Set explicit filters before changing appearance and language.
  await page.getByLabel('Mode').selectOption('practice');
  await page.getByLabel('Time range').selectOption('30d');
  await expect(page.getByLabel('Mode')).toHaveValue('practice');
  await expect(page.getByLabel('Time range')).toHaveValue('30d');

  // Switch appearance to Dark and language to Arabic.
  await page.getByRole('button', { name: /Appearance:/i }).click();
  await page.getByRole('menuitemradio', { name: 'Dark' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('button', { name: /Language:/i }).click();
  await page.getByRole('menuitemradio', { name: 'العربية' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  // Selected filter values must remain unchanged after theme/locale switches.
  await expect(page.locator('select').nth(0)).toHaveValue('practice');
  await expect(page.locator('select').nth(2)).toHaveValue('30d');

  // Switching accounts via logout clears previous private progress data.
  controller.switchUser(
    { ...newStudentUser, preferences: { themePreference: 'light', uiLocale: 'en' } },
    { sessions: [], keys: [] },
  );
  await page.getByRole('button', { name: 'تسجيل الخروج' }).click();
  await page.goto('/progress');
  await expect(
    page.getByText('Across 0 completed sessions.').first(),
  ).toBeVisible();
});
