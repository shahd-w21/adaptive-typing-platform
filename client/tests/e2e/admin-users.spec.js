// Browser checks for FE-18 user-management presentation and retry states.
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

async function setupAdminUserPage(page, locale = 'en', theme = 'light') {
  const currentUser = {
    ...adminUser,
    preferences: {
      themePreference: theme,
      uiLocale: locale,
    },
  };
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace('/api/v1', '');
    if (path === '/auth/me') {
      return route.fulfill({
        json: {
          user: currentUser,
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

test.describe('Admin user management (FE-18)', () => {
  test('searches, paginates, creates and protects accounts', async ({ page }) => {
    await setupAdminUserPage(page);
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Users' }).click();

    await expect(page.getByText(/development fixture/i).first()).toBeVisible();
    await expect(page.getByText('Omar Salah')).toBeVisible();
    await expect(page.getByText('Protected (last active admin)')).toBeVisible();

    await page.getByLabel('Search users').fill('Layla');
    await expect(page.getByText('Layla Mahmoud')).toBeVisible();
    await expect(page.getByText('Omar Salah')).toHaveCount(0);

    await page.getByLabel('Search users').fill('');
    await page.getByRole('button', { name: 'Create Admin' }).click();
    await page.getByLabel('Name').fill('Nora Admin');
    await page.getByLabel('Email').fill('nora@example.test');
    await page.getByRole('dialog').getByRole('button', { name: 'Create Admin' }).click();
    await expect(page.getByText('Nora Admin')).toBeVisible();
  });

  test('keeps the record after failure and succeeds on confirmation retry', async ({ page }) => {
    await setupAdminUserPage(page);
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Users' }).click();
    await page.getByLabel('Search users').fill('Mina');

    await page.getByRole('button', { name: 'Deactivate' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Deactivate' }).click();
    await expect(page.getByRole('alertdialog').getByRole('alert')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Mina Adel' })).toBeVisible();

    await page.getByRole('alertdialog').getByRole('button', { name: 'Deactivate' }).click();
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(page.getByText('Inactive')).toBeVisible();
  });

  test('reflows on Arabic mobile and passes accessibility checks', async ({ page }) => {
    await setupAdminUserPage(page, 'ar', 'dark');
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/admin');
    await page.getByRole('button', { name: 'المستخدمون' }).click();
    await expect(page.getByRole('heading', { name: 'دليل المستخدمين' })).toBeVisible();

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
