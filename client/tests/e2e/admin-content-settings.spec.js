// Browser checks for FE-23 content validation and versioned settings.
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

async function setupAdminPage(page, locale = 'en', theme = 'light') {
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace('/api/v1', '');
    if (path === '/auth/me') {
      return route.fulfill({
        json: {
          user: {
            ...adminUser,
            preferences: {
              themePreference: theme,
              uiLocale: locale,
            },
          },
          csrfToken: 'a'.repeat(64),
        },
      });
    }
    if (path === '/admin/ping') {
      return route.fulfill({
        json: { message: 'Welcome, admin' },
      });
    }
    return route.fulfill({
      status: 404,
      json: { error: { code: 'NOT_FOUND' } },
    });
  });
}

test.describe('Admin content and settings (FE-23)', () => {
  test('validates content preview and activates only after confirmation', async ({ page }) => {
    await setupAdminPage(page);
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Content & Wordlists' }).click();

    await expect(page.getByText(/exercise topic/i)).toBeVisible();
    await page.getByRole('button', { name: 'Validate and preview' }).click();
    await expect(page.getByText('Validation passed')).toBeVisible();
    await expect(page.getByText('Beginner preview', { exact: false })).toBeVisible();

    await page.getByRole('button', { name: 'Activate new content version' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Activate new content version' }).click();
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
  });

  test('shows feasibility errors and rejects stale learning-settings versions', async ({ page }) => {
    await setupAdminPage(page);
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Content & Wordlists' }).click();
    await page.getByLabel('English word list').fill('ask, blocked-example');
    await page.getByLabel('Blocked words').fill('blocked-example');
    await page.getByRole('button', { name: 'Validate and preview' }).click();
    await expect(page.getByText('Validation found issues')).toBeVisible();
    await expect(page.getByText(/blocked word is present/i)).toBeVisible();

    await page.getByRole('button', { name: 'Learning Settings' }).click();
    await expect(page.getByText(/future sessions only/i)).toBeVisible();
    await page.getByLabel('Expected current version').fill('v1.1.0');
    await page.getByRole('button', { name: 'Activate new settings version' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Activate new settings version' }).click();
    await expect(page.getByRole('alertdialog').getByRole('alert')).toBeVisible();
  });

  test('reflows in Arabic dark 320px and passes accessibility checks', async ({ page }) => {
    await setupAdminPage(page, 'ar', 'dark');
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/admin');
    await page.getByRole('button', { name: 'إعدادات التعلم' }).click();
    await expect(page.getByRole('heading', { name: 'إعدادات التعلم ذات الإصدارات' })).toBeVisible();
    await expect(page.getByText(/الجلسات المستقبلية/i)).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include('#main-content')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);

    const hasHorizontalPageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalPageOverflow).toBe(false);
  });
});
