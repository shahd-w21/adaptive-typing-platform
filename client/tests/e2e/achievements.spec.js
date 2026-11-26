/** Browser UI/accessibility checks for Achievements, Gamification & Rewards. */
import { test, expect } from '../support/browser.js';
import AxeBuilder from '@axe-core/playwright';
import { studentUser, newStudentUser } from '../fixtures/data.js';

async function setupAchievements(
  page,
  {
    user = studentUser,
    locale = 'en',
    theme = 'light',
    gamificationStatus = 200,
    gamificationPayload = {
      xp: 620,
      level: 2,
      streak: 3,
      dailyGoal: { goalMinutes: 10, minutesToday: 4.5, done: false },
    },
  } = {},
) {
  const currentUser = structuredClone(user);
  currentUser.preferences = { themePreference: theme, uiLocale: locale };
  let currentStatus = gamificationStatus;
  let currentPayload = structuredClone(gamificationPayload);

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api/v1', '');
    if (path === '/auth/me') {
      return route.fulfill({
        json: { user: currentUser, csrfToken: 'a'.repeat(64) },
      });
    }
    if (path === '/gamification') {
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
    setGamification(nextStatus, nextPayload) {
      currentStatus = nextStatus;
      if (nextPayload) currentPayload = structuredClone(nextPayload);
    },
  };
}

test('renders real XP/level policy, daily goal in minutes with timezone, and unavailable badge policy', async ({
  page,
}) => {
  await setupAchievements(page);
  await page.goto('/achievements');

  await expect(
    page.getByRole('heading', { name: 'Achievements & Milestones' }),
  ).toBeVisible();
  await expect(page.getByText('120 / 500 XP')).toBeVisible();
  await expect(page.getByText('380 XP until Level 3')).toBeVisible();
  await expect(page.getByText('4.5 / 10.0 min')).toBeVisible();
  await expect(
    page.getByText(`Measured in your timezone: ${studentUser.timezone}`).first(),
  ).toBeVisible();
  await expect(page.getByText('Badge policy not yet enabled')).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include('#main-content')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('handles gamification 503 error and explicit retry recovery', async ({
  page,
}) => {
  const controller = await setupAchievements(page, { gamificationStatus: 503 });
  await page.goto('/achievements');

  await expect(
    page.getByRole('button', { name: 'Retry', exact: true }),
  ).toBeVisible();
  controller.setGamification(200);
  await page.getByRole('button', { name: 'Retry', exact: true }).click();

  await expect(page.getByText('120 / 500 XP')).toBeVisible();
});

test('supports Arabic RTL, Dark mode, and 320px mobile reflow without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await setupAchievements(page, {
    user: newStudentUser,
    locale: 'ar',
    theme: 'dark',
    gamificationPayload: {
      xp: 0,
      level: 1,
      streak: 0,
      dailyGoal: { goalMinutes: 10, minutesToday: 0, done: false },
    },
  });
  await page.goto('/achievements');

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(
    page.getByRole('heading', { name: 'الإنجازات والمعالم' }),
  ).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
