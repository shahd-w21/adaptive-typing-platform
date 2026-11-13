// FE-29 account lifecycle checks use explicit API fixtures and never write local accounts.
import { test, expect } from '../support/browser.js';
import AxeBuilder from '@axe-core/playwright';

const user = {
  id: '00000000-0000-4000-8000-000000000029',
  email: 'fe29@example.test',
  name: 'FE-29 Learner',
  role: 'student',
  timezone: 'Africa/Cairo',
  targetWpm: 40,
  dailyGoalMinutes: 15,
  largeText: false,
  reducedPressure: false,
  xp: 120,
  level: 2,
  streak: 3,
  preferences: {
    themePreference: 'light',
    uiLocale: 'en',
  },
};

async function mockAccountApi(page) {
  let authenticated = false;
  const session = () => ({
    user: { ...user },
    csrfToken: 'a'.repeat(64),
  });

  await page.route('**/api/v1/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api/v1', '');

    if (path === '/auth/me') {
      return route.fulfill({
        status: authenticated ? 200 : 401,
        json: authenticated
          ? session()
          : { error: { code: 'UNAUTHENTICATED' } },
      });
    }
    if (path === '/auth/login') {
      const body = request.postDataJSON();
      if (body.email !== user.email || body.password !== 'Correct123') {
        return route.fulfill({
          status: 401,
          json: { error: { code: 'INVALID_CREDENTIALS' } },
        });
      }
      authenticated = true;
      return route.fulfill({ json: session() });
    }
    if (path === '/auth/logout') {
      authenticated = false;
      return route.fulfill({ json: { message: 'Logged out' } });
    }
    if (path === '/gamification') {
      return route.fulfill({
        json: { xp: user.xp, level: user.level, streak: user.streak, dailyGoal: user.dailyGoalMinutes },
      });
    }
    if (path === '/dashboard') {
      return route.fulfill({
        json: { user, streak: user.streak, dailyGoal: { minutes: user.dailyGoalMinutes, completed: 0 }, recommendation: null, recentSessions: [] },
      });
    }
    return route.fulfill({
      status: 503,
      json: { error: { code: 'SERVICE_UNAVAILABLE' } },
    });
  });
}

test('login errors are generic, successful login shows account actions, and logout clears them', async ({ page }) => {
  await mockAccountApi(page);
  await page.goto('/login');

  await page.getByLabel('Email Address').fill('unknown@example.test');
  await page.getByLabel('Password').fill('Wrong123');
  const authDialog = page.getByRole('dialog');
  await authDialog.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Email or password');
  await expect(page.getByRole('alert')).not.toContainText('unknown@example.test');

  await page.getByLabel('Email Address').fill(user.email);
  await page.getByLabel('Password').fill('Correct123');
  await authDialog.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Dashboard', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Log Out', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Log In', exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Log Out', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('button', { name: 'Log In', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Get Started', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Dashboard', exact: true })).toHaveCount(0);
});

test('login dialog and public navigation remain keyboard accessible on phone layouts', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockAccountApi(page);
  await page.goto('/login');

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.getByLabel('Email Address').focus();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => Boolean(document.activeElement.closest('dialog[open]')))).toBe(true);

  const results = await new AxeBuilder({ page })
    .include('dialog[open]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
