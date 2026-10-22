// FE-08 behavior checks: disposable fixture DTOs; no developer database or real forum writes.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { preview } from 'vite';
import { fileURLToPath } from 'node:url';

const firstTitle = 'Tips for overcoming the 50 WPM plateau on pinky reaches?';
const secondTitle = 'How does the Raw Accuracy gate calculate backspaced errors?';

/** Fail the check if this isolated forum entry attempts any HTTP API operation. */
async function openFixture(page, query = '') {
  await page.route('**/api/v1/**', route => route.abort());
  await page.goto(`/tests/fixtures/forum.html${query}`);
}

/** Schedule an explicit failure in the test-only adapter, optionally after committing. */
async function failNext(page, method, afterCommit = false, code = 'NETWORK_ERROR') {
  await page.evaluate(({ method, afterCommit, code }) => {
    window.forumFixture.failNext(method, { afterCommit, code });
  }, { method, afterCommit, code });
}

/** Check real layout width and WCAG rules on the full feature or its open dialog. */
async function checkPresentation(page, selector = '[data-forum]') {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  const results = await new AxeBuilder({ page })
    .include(selector)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
}

test('list loading, safe failure and explicit retry; empty collection', async ({ page }) => {
  await openFixture(page, '?failList');
  await expect(page.getByRole('status')).toContainText('Loading');
  await expect(page.getByRole('alert')).toContainText('could not be reached');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('button', { name: firstTitle })).toBeVisible();
  await openFixture(page, '?empty');
  await expect(page.getByRole('heading', { name: 'No discussions yet' })).toBeVisible();
  await expect(page.getByRole('button', { name: '+ New Discussion' })).toBeEnabled();
});

test('list/reply pagination, empty thread, hidden and unavailable posts', async ({ page }) => {
  await openFixture(page);
  const pages = page.getByRole('navigation', { name: 'Discussion pages' });
  await pages.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('This post is hidden.', { exact: true })).toBeVisible();
  await expect(page.locator('[data-forum]')).not.toContainText('PRIVATE');
  await pages.getByRole('button', { name: 'Previous' }).click();
  await page.getByRole('button', { name: secondTitle }).click();
  await expect(page.getByRole('heading', { name: 'No replies yet' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Accept answer', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Back to discussions' }).click();
  await page.getByRole('button', { name: firstTitle }).click();
  await expect(page.getByText('This post is hidden.', { exact: true })).toBeVisible();
  await page.getByRole('navigation', { name: 'Reply pages' }).getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('This post is unavailable.', { exact: true })).toBeVisible();
  await expect(page.locator('[data-forum]')).not.toContainText('PRIVATE');
});

test('reply lost response keeps the draft; retry adds exactly one safe authored reply', async ({ page }) => {
  await openFixture(page);
  await page.getByRole('button', { name: firstTitle }).click();
  const text = 'مرحبا <img src=x onerror="window.forumXss=true">\n<script>alert(1)</script> & English';
  const reply = page.getByRole('textbox', { name: 'Your reply', exact: true });
  await reply.fill('   ');
  await expect(page.getByRole('button', { name: 'Post reply', exact: true })).toBeDisabled();
  await reply.fill(text);
  await failNext(page, 'reply', true);
  await page.getByRole('button', { name: 'Post reply', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Your draft is kept');
  await expect(reply).toHaveValue(text);
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(reply).toHaveValue('');
  await expect(page.getByRole('heading', { name: '5 replies', exact: true })).toBeVisible();
  await expect(page.getByText(text, { exact: true })).toHaveCount(1);
  expect(await page.locator('[data-forum] img, [data-forum] script').count()).toBe(0);
  expect(await page.evaluate(() => window.forumXss)).toBeUndefined();
});

test('create retries one submission and renders authored title/body verbatim', async ({ page }) => {
  await openFixture(page, '?empty');
  await page.getByRole('button', { name: '+ New Discussion' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Question or title').fill('سؤال <b>plain text</b>');
  await dialog.getByLabel('Discussion text').fill('English & العربية\nSecond line');
  await failNext(page, 'create', true);
  await dialog.getByRole('button', { name: 'Publish Discussion' }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog.getByLabel('Question or title')).toHaveValue('سؤال <b>plain text</b>');
  await dialog.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'سؤال <b>plain text</b>' })).toBeVisible();
  await expect(page.getByText('English & العربية\nSecond line', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back to discussions' }).click();
  await expect(page.getByRole('button', { name: 'سؤال <b>plain text</b>' })).toHaveCount(1);
});

test('accepted answer is owner-only and replacement leaves exactly one accepted reply', async ({ page }) => {
  await openFixture(page);
  await page.getByRole('button', { name: firstTitle }).click();
  await expect(page.locator('[data-accepted-answer]')).toHaveCount(1);
  await failNext(page, 'accept');
  await page.getByRole('button', { name: 'Use this answer instead' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('article', { name: 'Reply', exact: true }).filter({ hasText: 'Slow down' }).locator('[data-accepted-answer]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Accepted answer updated' })).toBeVisible();
  await expect(page.locator('[data-accepted-answer]')).toHaveCount(1);
  await expect(page.getByRole('article', { name: 'Reply', exact: true }).filter({ hasText: 'Try short' }).locator('[data-accepted-answer]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Back to discussions' }).click();
  await page.getByRole('button', { name: secondTitle }).click();
  await page.getByRole('textbox', { name: 'Your reply', exact: true }).fill('A reply in another student’s thread');
  await page.getByRole('button', { name: 'Post reply', exact: true }).click();
  await expect(page.getByRole('heading', { name: '1 replies', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Accept answer|Use this answer instead/ })).toHaveCount(0);
});

test('report failure/retry acknowledges without hiding the post', async ({ page }) => {
  await openFixture(page);
  await page.getByRole('button', { name: firstTitle }).click();
  await page.getByRole('button', { name: 'Report post', exact: true }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Reason for reporting').fill('Please review this example.');
  await failNext(page, 'report', true);
  await dialog.getByRole('button', { name: 'Send report', exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await dialog.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Report received' })).toBeVisible();
  await expect(page.getByRole('heading', { name: firstTitle })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Report post', exact: true })).toHaveCount(2);
});

test('pending creation cannot dismiss; permission failure retains draft without success', async ({ page }) => {
  await openFixture(page, '?slow');
  await page.getByRole('button', { name: '+ New Discussion' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Question or title').fill('A denied discussion');
  await dialog.getByLabel('Discussion text').fill('Keep this draft after denial.');
  await failNext(page, 'create', false, 'FORBIDDEN');
  await dialog.getByRole('button', { name: 'Publish Discussion' }).click();
  await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('alert')).toContainText('do not have permission');
  await expect(dialog.getByLabel('Discussion text')).toHaveValue('Keep this draft after denial.');
  await expect(dialog.getByRole('button', { name: 'Retry', exact: true })).toHaveCount(0);
  await expect(page.getByRole('status').filter({ hasText: 'Discussion published' })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('button', { name: '+ New Discussion' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'A denied discussion' })).toHaveCount(0);
});

test('read-only permission DTO, unavailable detail and malicious hidden payload', async ({ page }) => {
  await openFixture(page, '?readOnly');
  await expect(page.getByText('Reading is available.', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: '+ New Discussion' })).toHaveCount(0);
  await page.getByRole('button', { name: firstTitle }).click();
  await expect(page.getByText('Replies are unavailable', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: /Report post|Accept answer|Use this answer instead/ })).toHaveCount(0);
  await openFixture(page, '?failDetail');
  await page.getByRole('button', { name: firstTitle }).click();
  await expect(page.getByRole('alert')).toContainText('unavailable');
  await expect(page.getByLabel('Your reply', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('heading', { name: firstTitle })).toBeVisible();
  await openFixture(page, '?hiddenDetail');
  await page.getByRole('button', { name: firstTitle }).click();
  await expect(page.getByText('This post is hidden.', { exact: true })).toBeVisible();
  await expect(page.locator('[data-forum]')).not.toContainText('SHOULD_NOT_RENDER');
  await expect(page.getByLabel('Your reply', { exact: true })).toHaveCount(0);
});

for (const locale of ['en', 'ar']) {
  for (const theme of ['light', 'dark']) {
    for (const width of [320, 1280]) {
      test(`forum list/detail/create/report reflow and accessibility in ${locale}/${theme}/${width}`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await openFixture(page, `?locale=${locale}&theme=${theme}`);
        await expect(page.getByRole('button', { name: firstTitle })).toBeVisible();
        await checkPresentation(page);
        const create = page.getByRole('button', { name: locale === 'ar' ? '+ نقاش جديد' : '+ New Discussion' });
        await create.focus();
        await page.keyboard.press('Enter');
        await expect(page.getByRole('dialog')).toBeVisible();
        await checkPresentation(page, 'dialog[open]');
        await page.keyboard.press('Escape');
        await expect(create).toBeFocused();
        await page.getByRole('button', { name: firstTitle }).focus();
        await page.keyboard.press('Enter');
        await expect(page.getByRole('heading', { name: firstTitle })).toBeFocused();
        await checkPresentation(page);
        await page.screenshot({ path: testInfo.outputPath('forum-detail.png'), fullPage: true });
        await page.getByRole('button', { name: locale === 'ar' ? 'الإبلاغ عن المشاركة' : 'Report post', exact: true }).first().click();
        await checkPresentation(page, 'dialog[open]');
      });
    }
  }
}

test('draft/page/authored text survive appearance, locale and viewport changes', async ({ page }) => {
  await openFixture(page);
  await page.getByRole('button', { name: firstTitle }).click();
  await page.getByRole('navigation', { name: 'Reply pages' }).getByRole('button', { name: 'Next' }).click();
  const reply = page.getByRole('textbox', { name: 'Your reply', exact: true });
  await reply.fill('مسودة & unchanged draft');
  await page.getByRole('button', { name: 'Appearance: Light' }).click();
  await page.getByRole('menuitemradio', { name: 'Dark', exact: true }).click();
  await page.getByRole('button', { name: 'Language: English' }).click();
  await page.getByRole('menuitemradio', { name: 'العربية', exact: true }).click();
  await page.setViewportSize({ width: 320, height: 740 });
  await expect(page.getByRole('textbox', { name: 'ردك', exact: true })).toHaveValue('مسودة & unchanged draft');
  await expect(page.getByRole('heading', { name: firstTitle })).toBeVisible();
  await expect(page.getByText('الصفحة 2 من 2', { exact: true })).toBeVisible();
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await checkPresentation(page);
});

test('production build reports API unavailable and makes no forum requests', async ({ page }) => {
  const server = await preview({
    root: fileURLToPath(new URL('../../', import.meta.url)),
    logLevel: 'error',
    preview: { host: '127.0.0.1', port: 5175, strictPort: true },
  });
  const forumRequests = [];
  await page.route('**/api/v1/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.includes('/forum')) {
      forumRequests.push(path);
    }
    await route.fulfill({ json: {
      user: {
        id: '00000000-0000-4000-8000-000000000008',
        name: 'Forum reviewer',
        email: 'forum@example.test',
        role: 'student',
        timezone: 'Africa/Cairo',
        targetWpm: 40,
        dailyGoalMinutes: 15,
        largeText: false,
        reducedPressure: false,
        xp: 0,
        level: 1,
        streak: 0,
        preferences: { themePreference: 'light', uiLocale: 'en' },
      },
      csrfToken: 'a'.repeat(64),
    } });
  });
  try {
    await page.goto('http://127.0.0.1:5175/forum');
    await expect(page.getByRole('alert')).toContainText('not connected to an API yet');
    await expect(page.getByRole('button', { name: '+ New Discussion' })).toHaveCount(0);
    await expect(page.locator('[data-forum]')).not.toContainText('temporary sample data');
    expect(forumRequests).toEqual([]);
    // Preserve the existing authenticated route until the public reading gate is agreed.
    await page.unrouteAll();
    await page.route('**/api/v1/**', route => route.fulfill({
      status: 401,
      json: { error: { code: 'UNAUTHENTICATED' } },
    }));
    await page.reload();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.locator('[data-forum]')).toHaveCount(0);
  } finally {
    await new Promise(resolve => server.httpServer.close(resolve));
  }
});
