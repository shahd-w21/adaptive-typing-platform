// FE-29 preference checks cover guest/account precedence and recoverable account saves.
import { test, expect } from '../support/browser.js';
import AxeBuilder from '@axe-core/playwright';

const guest = {
  id: '00000000-0000-4000-8000-000000000030',
  email: 'guest-account@example.test',
  name: 'Account Preferences',
  role: 'student',
  timezone: 'UTC',
  targetWpm: 40,
  dailyGoalMinutes: 10,
  largeText: false,
  reducedPressure: false,
  xp: 0,
  level: 1,
  streak: 0,
  preferences: { themePreference: 'dark', uiLocale: 'en' },
};

async function mockPreferenceApi(page, { failFirstSave = false } = {}) {
  let authenticated = false;
  let saveAttempts = 0;
  const account = structuredClone(guest);
  const session = () => ({ user: structuredClone(account), csrfToken: 'b'.repeat(64) });

  await page.route('**/api/v1/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api/v1', '');
    if (path === '/auth/me') {
      return route.fulfill({
        status: authenticated ? 200 : 401,
        json: authenticated ? session() : { error: { code: 'UNAUTHENTICATED' } },
      });
    }
    if (path === '/auth/login') {
      authenticated = true;
      return route.fulfill({ json: session() });
    }
    if (path === '/auth/logout') {
      authenticated = false;
      return route.fulfill({ json: { message: 'Logged out' } });
    }
    if (path === '/users/me' && request.method() === 'PATCH') {
      saveAttempts += 1;
      if (failFirstSave && saveAttempts === 1) {
        return route.fulfill({
          status: 503,
          json: { error: { code: 'SERVICE_UNAVAILABLE' } },
        });
      }
      const patch = request.postDataJSON();
      account.preferences = {
        ...account.preferences,
        ...patch.preferences,
      };
      account.largeText = patch.largeText ?? account.largeText;
      account.reducedPressure = patch.reducedPressure ?? account.reducedPressure;
      return route.fulfill({ json: { user: structuredClone(account) } });
    }
    if (path === '/gamification') {
      return route.fulfill({ json: { xp: 0, level: 1, streak: 0, dailyGoal: 10 } });
    }
    return route.fulfill({ status: 503, json: { error: { code: 'SERVICE_UNAVAILABLE' } } });
  });

  return {
    getSaveAttempts: () => saveAttempts,
  };
}

test('visitor preferences are restored after account logout and account values win at login', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('typeflow_theme_pref', 'light');
    localStorage.setItem('typeflow_locale_pref', 'ar');
  });
  await mockPreferenceApi(page);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  await page.getByRole('banner').getByRole('button', { name: 'تسجيل الدخول' }).click();
  const authDialog = page.getByRole('dialog');
  await authDialog.getByLabel('البريد الإلكتروني').fill(guest.email);
  await authDialog.getByLabel('كلمة المرور').fill('Correct123');
  await authDialog.getByRole('button', { name: 'تسجيل الدخول', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

  await page.goto('/');
  await page.getByRole('button', { name: 'Log Out', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test('failed account preference save announces retry and preserves unrelated preferences', async ({ page }) => {
  const api = await mockPreferenceApi(page, { failFirstSave: true });
  await page.goto('/login');
  const authDialog = page.getByRole('dialog');
  await authDialog.getByLabel('Email Address').fill(guest.email);
  await authDialog.getByLabel('Password').fill('Correct123');
  await authDialog.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto('/profile');
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Failed to save preferences');
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByRole('button', { name: 'Dark', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(api.getSaveAttempts()).toBe(2);

  await page.setViewportSize({ width: 390, height: 844 });
  const results = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width + 1);
});
