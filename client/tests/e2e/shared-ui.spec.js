// FE-03 behavior checks use explicit HTTP fixtures; no account or scored session is created.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const student = {
  id: '00000000-0000-4000-8000-000000000003',
  email: 'fe03@example.test',
  name: 'FE-03',
  role: 'student',
  timezone: 'Africa/Cairo',
  targetWpm: 40,
  dailyGoalMinutes: 15,
  largeText: false,
  reducedPressure: false,
  xp: 120,
  level: 1,
  streak: 2,
  preferences: {
    themePreference: 'light',
    uiLocale: 'en',
  },
};

/** Intercept all API traffic so tests cannot write to a developer's database. */
async function mockApi(page, { role, theme = 'light', locale = 'en' } = {}) {
  const user = {
    ...student,
    role,
    preferences: {
      themePreference: theme,
      uiLocale: locale,
    },
  };
  await page.addInitScript(({ theme, locale }) => {
    localStorage.setItem('typeflow_theme_pref', theme);
    localStorage.setItem('typeflow_locale_pref', locale);
  }, { theme, locale });

  await page.route('**/api/v1/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/me')) {
      return route.fulfill({
        status: role ? 200 : 401,
        json: role
          ? { user, csrfToken: 'a'.repeat(64) }
          : { error: { code: 'UNAUTHENTICATED' } },
      });
    }
    if (path.endsWith('/users/me') && route.request().method() === 'PATCH') {
      const patch = route.request().postDataJSON();
      user.preferences = {
        ...user.preferences,
        ...patch.preferences,
      };
      return route.fulfill({ json: { user } });
    }
    if (path.endsWith('/admin/ping')) {
      return route.fulfill({ json: { message: 'Fixture access check' } });
    }
    return route.fulfill({
      status: 503,
      json: { error: { code: 'SERVICE_UNAVAILABLE' } },
    });
  });
}

/** Assert reflow instead of masking overflow with body overflow-x:hidden. */
async function expectReflow(page) {
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width + 1);
}

/** Restrict automated accessibility review to the FE-03 shared interface. */
async function expectAccessible(page, selector) {
  const results = await new AxeBuilder({ page })
    .include(selector)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
}

for (const locale of ['en', 'ar']) {
  for (const theme of ['light', 'dark']) {
    for (const role of ['public', 'student', 'admin']) {
      test(`${role} navigation reflows at 320px in ${locale}/${theme}`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width: 320, height: 740 });
        await mockApi(page, {
          role: role === 'public' ? undefined : role,
          theme,
          locale,
        });
        await page.goto(role === 'public' ? '/' : role === 'admin' ? '/admin' : '/practice');
        await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expectReflow(page);

        const trigger = page.getByRole('button', {
          name: locale === 'ar' ? 'فتح قائمة التنقل' : 'Open navigation menu',
        });
        await trigger.focus();
        await page.keyboard.press('Enter');
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expectAccessible(page, 'dialog[open]');
        await page.screenshot({ path: testInfo.outputPath('mobile-drawer.png') });

        // Exercise forward/backward traversal while the background is inert.
        for (let index = 0; index < 16; index += 1) {
          await page.keyboard.press(index % 2 ? 'Shift+Tab' : 'Tab');
          expect(await page.evaluate(() => Boolean(document.activeElement.closest('dialog[open]')))).toBe(true);
        }
        await page.keyboard.press('Escape');
        await expect(dialog).not.toBeVisible();
        await expect(trigger).toBeFocused();
        await expectReflow(page);
        await expectAccessible(page, 'header');
        await page.screenshot({
          path: testInfo.outputPath('mobile-page.png'),
          fullPage: true,
        });
        await page.setViewportSize({ width: 1280, height: 900 });
        await expectReflow(page);
        await expectAccessible(page, role === 'public' ? 'header' : 'aside');
      });
    }
  }
}

test('account menus navigate by keyboard, with the same admin actions on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await mockApi(page, { role: 'admin' });
  await page.goto('/admin');
  const desktopActions = await page.locator('aside nav button').allTextContents();
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  expect(await page.locator('dialog nav button').allTextContents()).toEqual(desktopActions);
  const profile = page.getByRole('dialog').getByRole('button', { name: 'Profile & Settings' });
  await profile.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.locator('#main-content')).toBeFocused();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.locator('aside nav').getByRole('button', { name: 'Admin Panel' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/admin$/);
});

test('public keyboard navigation reaches every destination and returns focus from authentication', async ({ page }) => {
  await mockApi(page);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
  await page.getByRole('button', { name: 'Open navigation menu' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('dialog').getByRole('button', { name: 'Verify Certificate' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/verify-certificate$/);
  await expect(page.locator('#main-content')).toBeFocused();
  await page.getByRole('button', { name: 'Log In', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('Email Address')).toBeFocused();
  await expectAccessible(page, 'dialog[open]');
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('#main-content')).toBeFocused();
});

test('typing assignment and entered characters survive theme, RTL and viewport changes', async ({ page }) => {
  await mockApi(page, { role: 'student' });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/review');
  await page.getByRole('button', { name: 'Begin sample review' }).click();
  await expect(page).toHaveURL(/\/typing$/);
  const input = page.getByRole('textbox', { name: 'Typing input stream' });
  await input.pressSequentially('trex');
  const passage = input.locator('..').locator('.select-none');
  const text = await passage.textContent();
  const correctCount = await passage.locator('span.text-success-text').count();
  expect(correctCount).toBe(3);
  await page.getByRole('button', { name: 'Appearance: Light' }).click();
  await page.getByRole('menuitemradio', { name: 'Dark' }).click();
  await page.getByRole('button', { name: 'Language: English' }).click();
  await page.getByRole('menuitemradio', { name: 'العربية' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(passage).toHaveText(text);
  expect(await passage.evaluate(element => getComputedStyle(element).direction)).toBe('ltr');
  await page.setViewportSize({ width: 320, height: 740 });
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(passage).toHaveText(text);
  expect(await passage.locator('span.text-success-text').count()).toBe(correctCount);
  await page.getByRole('button', { name: 'خروج', exact: true }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'خروج', exact: true })).toBeFocused();
  await expect(passage).toHaveText(text);
});

test('admin sections and table remain reachable at 320px and increased text size', async ({ page }) => {
  await mockApi(page, { role: 'admin', theme: 'dark', locale: 'ar' });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/admin');
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  const sections = page.getByRole('navigation', { name: 'أقسام الإدارة' });
  for (const button of await sections.getByRole('button').all()) {
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expectReflow(page);
  }
  await sections.getByRole('button', { name: 'المستخدمون' }).click();
  await expect(page.getByRole('region', { name: /دليل المستخدمين/ })).toBeVisible();
});

test('preference menus support arrows, Home/End, Escape and focus return', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await mockApi(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Appearance: Light' }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitemradio', { name: 'Light' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Appearance: Dark' })).toBeFocused();
  await page.getByRole('button', { name: 'Language: English' }).click();
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('button', { name: /اللغة/ }).click();
  await expectReflow(page);
  await page.keyboard.press('Home');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /اللغة/ })).toBeFocused();
});

test('mobile guidance never creates an assignment', async ({ page }) => {
  let assignments = 0;
  page.on('request', request => {
    if (request.method() === 'POST' && /\/sessions(?:\/start)?$/.test(new URL(request.url()).pathname)) {
      assignments += 1;
    }
  });
  await page.setViewportSize({ width: 320, height: 740 });
  await mockApi(page, { role: 'student' });
  await page.goto('/practice');
  const start = page.getByRole('button', { name: 'Start practice' });
  await start.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(assignments).toBe(0);
  await page.keyboard.press('Escape');
  await expect(start).toBeFocused();
  await expect(page).toHaveURL(/\/practice$/);
});

for (const locale of ['en', 'ar']) {
  for (const theme of ['light', 'dark']) {
    test(`shared states and confirmation recovery in ${locale}/${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 740 });
      await page.goto(`/tests/fixtures/shared-ui.html?locale=${locale}&theme=${theme}`);
      await expect(page.locator('[role="status"]')).toBeVisible();
      await expect(page.getByText('private-error-must-not-render')).toHaveCount(0);
      const retry = page.getByRole('button', {
        name: locale === 'ar' ? 'إعادة المحاولة' : 'Retry',
      });
      await expect(retry).toHaveCount(1);
      await retry.click();
      await expect(page.getByTestId('retries')).toHaveText('1');
      await expectReflow(page);
      await expectAccessible(page, 'main');

      const opener = page.getByRole('button', { name: 'Open confirmation' });
      await opener.click();
      const cancel = page.getByRole('button', {
        name: locale === 'ar' ? 'إلغاء' : 'Cancel',
        exact: true,
      });
      await expect(cancel).toBeFocused();
      await expectAccessible(page, 'dialog[open]');
      await page.keyboard.press('Shift+Tab');
      expect(await page.evaluate(() => document.activeElement.closest('dialog') !== null)).toBe(true);
      await page.keyboard.press('Escape');
      await expect(opener).toBeFocused();
      await opener.click();

      const confirm = page.getByRole('button', {
        name: locale === 'ar' ? 'تأكيد' : 'Confirm',
        exact: true,
      });
      await confirm.click();
      await expect(cancel).toBeDisabled();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('alertdialog')).toBeVisible();
      await expect(page.getByRole('alertdialog').getByRole('alert')).toHaveCount(1);
      await expect(page.getByText('private-error-must-not-render')).toHaveCount(0);
      await confirm.click();
      await expect(page.getByRole('alertdialog')).not.toBeVisible();
      await expect(opener).toBeFocused();
      await expect(page.getByTestId('confirmed')).toHaveText('true');
    });
  }
}

test('supporting pages and role denial retain 320px reflow', async ({ page, browser }) => {
  console.log(`FE-03 browser: Chrome ${browser.version()}`);
  await mockApi(page, { role: 'student' });
  await page.setViewportSize({ width: 320, height: 740 });
  for (const path of ['/dashboard', '/forum', '/certificates', '/profile', '/admin']) {
    await page.goto(path);
    await expect(page.locator('#main-content')).toBeVisible();
    await expectReflow(page);
  }
  await expect(page.getByRole('alert')).toContainText('You do not have permission');
  await expect(page.getByRole('button', { name: 'Admin Panel' })).toHaveCount(0);
});

test('existing profile and forum dialogs contain focus and restore their opener', async ({ page }) => {
  await mockApi(page, { role: 'student' });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/profile');
  const deleteButton = page.getByRole('button', { name: 'Delete account', exact: true });
  await deleteButton.click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await expectAccessible(page, 'dialog[open]');
  await page.keyboard.press('Escape');
  await expect(deleteButton).toBeFocused();
  await page.goto('/forum');
  const discussionButton = page.getByRole('button', { name: '+ New Discussion' });
  await discussionButton.click();
  await expectAccessible(page, 'dialog[open]');
  await expectReflow(page);
  await page.keyboard.press('Escape');
  await expect(discussionButton).toBeFocused();
});
