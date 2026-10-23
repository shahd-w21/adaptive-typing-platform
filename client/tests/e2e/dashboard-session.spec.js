/** Browser UI/failure fixtures only; the real API loop is tested separately in PostgreSQL. */
import { test, expect } from '../support/browser.js';
import AxeBuilder from '@axe-core/playwright';
import { studentUser } from '../../src/mocks/users.js';
import {
  dashboardResponse,
  newStudentDashboardResponse,
  pathResponse,
} from '../../src/mocks/dashboard.js';
import { sessionAssignment, sessionResult } from '../../src/mocks/sessions.js';

/** Intercept every request: presentation tests never write to a developer's database. */
async function setup(
  page,
  {
    locale = 'en',
    theme = 'light',
    fresh = false,
    dashboardStatus = 200,
    pathStatus = 200,
    pointer = false,
    recovered = false,
    dropSubmit = false,
    rejectSubmit = false,
    delayDashboard = false,
    assignedText = sessionAssignment.text,
    resultDto = sessionResult,
  } = {},
) {
  const account = structuredClone(studentUser);
  account.preferences = { themePreference: theme, uiLocale: locale };
  let summary = structuredClone(
    fresh ? newStudentDashboardResponse : dashboardResponse,
  );
  let saved = recovered;
  let starts = 0;
  let submits = 0;
  let currentDashboardStatus = dashboardStatus;
  const bodies = [];
  let releaseDashboard;
  const dashboardGate = new Promise((resolve) => {
    releaseDashboard = resolve;
  });
  if (!delayDashboard) {
    releaseDashboard();
  }
  const assignment = {
    ...sessionAssignment,
    text: assignedText,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  };
  await page.addInitScript(
    ({ pointer, ownerId, sessionId }) => {
      if (pointer && !sessionStorage.getItem('typeflow.activeSession')) {
        sessionStorage.setItem(
          'typeflow.activeSession',
          JSON.stringify({ ownerId, sessionId }),
        );
      }
    },
    { pointer, ownerId: account.id, sessionId: assignment.sessionId },
  );
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api/v1', '');
    if (path === '/auth/me') {
      return route.fulfill({
        json: { user: account, csrfToken: 'a'.repeat(64) },
      });
    }
    if (path === '/users/me' && request.method() === 'PATCH') {
      const patch = request.postDataJSON();
      account.preferences = { ...account.preferences, ...patch.preferences };
      return route.fulfill({ json: { user: account } });
    }
    if (path === '/dashboard') {
      await dashboardGate;
      return route.fulfill({
        status: currentDashboardStatus,
        json:
          currentDashboardStatus === 200
            ? summary
            : {
                error: {
                  code:
                    currentDashboardStatus === 403
                      ? 'FORBIDDEN'
                      : 'SERVICE_UNAVAILABLE',
                },
              },
      });
    }
    if (path === '/path') {
      return route.fulfill({
        status: pathStatus,
        json:
          pathStatus === 200 ? pathResponse : { error: { code: 'FORBIDDEN' } },
      });
    }
    if (path === '/sessions' && request.method() === 'POST') {
      starts += 1;
      return route.fulfill({ json: assignment });
    }
    if (path.endsWith('/submit')) {
      submits += 1;
      bodies.push(request.postDataJSON());
      if (rejectSubmit) {
        return route.fulfill({
          status: 422,
          json: { error: { code: 'INVALID_SUBMISSION' } },
        });
      }
      saved = true;
      summary = {
        ...dashboardResponse,
        user: { ...dashboardResponse.user, xp: 777 },
      };
      return dropSubmit
        ? route.abort('failed')
        : route.fulfill({ json: resultDto });
    }
    if (path === `/sessions/${assignment.sessionId}`) {
      return route.fulfill({
        json: saved ? resultDto : { ...assignment, status: 'created' },
      });
    }
    if (path.endsWith('/abandon')) {
      return route.fulfill({ json: { status: 'abandoned' } });
    }
    return route.fulfill({
      status: 503,
      json: { error: { code: 'SERVICE_UNAVAILABLE' } },
    });
  });
  return {
    get starts() {
      return starts;
    },
    get submits() {
      return submits;
    },
    bodies,
    succeed: () => {
      currentDashboardStatus = 200;
    },
    fail: () => {
      currentDashboardStatus = 503;
    },
    releaseDashboard,
  };
}

for (const locale of ['en', 'ar']) {
  for (const theme of ['light', 'dark']) {
    test(`dashboard reflows and is accessible in ${locale}/${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await setup(page, { locale, theme });
      await page.goto('/dashboard');
      await expect(page.getByRole('table')).toBeVisible();
      await expect(page.getByRole('progressbar')).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute(
        'dir',
        locale === 'ar' ? 'rtl' : 'ltr',
      );
      const width = await page.evaluate(() => ({
        visible: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(width.scroll).toBeLessThanOrEqual(width.visible + 1);
      const axe = await new AxeBuilder({ page })
        .include('#main-content')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(axe.violations).toEqual([]);
    });
  }
}

test('new account shows no history and an honest placement/practice distinction', async ({
  page,
}) => {
  const api = await setup(page, { fresh: true });
  await page.goto('/dashboard');
  await expect(
    page.getByText('This recommended mode is not available yet.', {
      exact: false,
    }),
  ).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Start adaptive practice instead' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Course resume is not connected' }),
  ).toBeDisabled();
  expect(api.starts).toBe(0);
});

test('loading remains explicit until the dashboard response arrives', async ({
  page,
}) => {
  const api = await setup(page, { delayDashboard: true });
  await page.goto('/dashboard');
  await expect(page.getByRole('status')).toContainText(
    'Loading your dashboard',
  );
  await expect(page.getByRole('progressbar')).toHaveCount(0);
  api.releaseDashboard();
  await expect(page.getByRole('table')).toBeVisible();
});

test('server failure retries successfully and path permission failure remains isolated', async ({
  page,
}) => {
  const api = await setup(page, { dashboardStatus: 503, pathStatus: 403 });
  await page.goto('/dashboard');
  await expect(
    page.getByRole('button', { name: 'Retry', exact: true }),
  ).toBeVisible();
  api.succeed();
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('permission');
  await expect(page.getByRole('progressbar')).toBeVisible();
});

test('dashboard permission denial does not offer a blind retry', async ({
  page,
}) => {
  await setup(page, { dashboardStatus: 403 });
  await page.goto('/dashboard');
  await expect(page.getByRole('alert')).toContainText('permission');
  await expect(
    page.getByRole('button', { name: 'Retry', exact: true }),
  ).toHaveCount(0);
});

test('reload recovers a saved result without start or submit', async ({
  page,
}) => {
  const api = await setup(page, { pointer: true, recovered: true });
  await page.goto('/typing');
  await expect(
    page.getByRole('button', { name: 'Return to dashboard' }),
  ).toBeVisible();
  await expect(page.getByText('Fetched saved result')).toBeVisible();
  expect(api.starts).toBe(0);
  expect(api.submits).toBe(0);
});

for (const locale of ['en', 'ar']) {
  for (const theme of ['light', 'dark']) {
    test(`saved result is responsive and accessible in ${locale}/${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 740 });
      await setup(page, {
        locale,
        theme,
        pointer: true,
        recovered: true,
      });
      await page.goto('/typing');

      await expect(
        page.getByRole('heading', {
          name: locale === 'ar' ? 'اكتملت الجلسة' : 'Session completed',
        }),
      ).toBeVisible();
      await expect(
        page.getByText(
          locale === 'ar' ? 'تم جلب النتيجة المحفوظة' : 'Fetched saved result',
        ),
      ).toBeVisible();

      const width = await page.evaluate(() => ({
        visible: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(width.scroll).toBeLessThanOrEqual(width.visible + 1);

      const axe = await new AxeBuilder({ page })
        .include('#main-content')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(axe.violations).toEqual([]);
    });
  }
}

test('unfinished reload explains lost progress; explicit restart allocates one attempt', async ({
  page,
}) => {
  const api = await setup(page, { pointer: true });
  await page.goto('/typing');
  await expect(
    page.getByText('Typing progress was not stored', { exact: false }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Abandon and start a new attempt' })
    .click();
  await expect(
    page.getByRole('textbox', { name: 'Typing input stream' }),
  ).toBeAttached();
  expect(api.starts).toBe(1);
});

test('typing survives preference/viewport changes; lost submission recovers and refreshes dashboard', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const api = await setup(page, { dropSubmit: true });
  await page.goto('/dashboard');
  await page
    .getByRole('button', { name: 'Start adaptive practice', exact: true })
    .click();
  const input = page.getByRole('textbox', { name: 'Typing input stream' });
  await input.pressSequentially(sessionAssignment.text.slice(0, 3), {
    delay: 20,
  });
  // Existing controls update presentation, not assignment identity/recorded events.
  await page.getByRole('button', { name: /Large Text:/ }).click();
  await page.getByRole('button', { name: 'Appearance: Light' }).click();
  await page.getByRole('menuitemradio', { name: 'Dark', exact: true }).click();
  await page.getByRole('button', { name: 'Language: English' }).click();
  await page.getByRole('menuitemradio', { name: 'العربية' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.setViewportSize({ width: 900, height: 800 });
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 900 });
  // Switch back using the existing localized preference menu, not a remount.
  await page.getByRole('button', { name: /اللغة:/ }).click();
  await page.getByRole('menuitemradio', { name: 'English' }).click();
  await input.focus();
  await input.pressSequentially(sessionAssignment.text.slice(3), { delay: 20 });
  await expect(
    page.getByRole('button', {
      name: 'Check result and retry save',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/couldn't confirm whether the server saved/),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Check result and retry save', exact: true })
    .click();
  await expect(page.getByText('Fetched saved result')).toBeVisible();
  await page.getByRole('button', { name: 'Return to dashboard' }).click();
  await expect(page.getByText('777 XP', { exact: true })).toBeVisible();
  expect(api.starts).toBe(1);
  expect(api.submits).toBe(1);
  expect(
    api.bodies[0].events
      .filter((event) => event.type === 'insert')
      .map((event) => event.char)
      .join(''),
  ).toBe(sessionAssignment.text);
  expect(Object.keys(api.bodies[0]).sort()).toEqual(['events', 'finishTimeMs']);
});

test('rejected submission explains no result was saved and offers no blind retry', async ({
  page,
}) => {
  await setup(page, {
    assignedText: 'asdf',
    rejectSubmit: true,
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/dashboard');
  await page
    .getByRole('button', { name: 'Start adaptive practice', exact: true })
    .click();
  const input = page.getByRole('textbox', { name: 'Typing input stream' });
  await input.pressSequentially('asdf');

  await expect(page.getByRole('alert'))
    .toContainText('The server rejected this attempt, so no result was saved.');
  await expect(
    page.getByRole('button', {
      name: 'Check result and retry save',
      exact: true,
    }),
  ).toHaveCount(0);
});

test('official result uses server metrics after a corrected error and omits absent effects', async ({
  page,
}) => {
  const resultDto = structuredClone(sessionResult);
  resultDto.metrics = {
    ...resultDto.metrics,
    grossWpm: 12,
    netWpm: 10,
    rawAccuracy: 50,
    finalAccuracy: 100,
  };
  resultDto.rewards = [];
  resultDto.xpEarned = 0;
  resultDto.problemKeys = [
    { key: 'a', errors: 1, attempts: 2, avgMs: null },
  ];

  const api = await setup(page, {
    assignedText: 'ab',
    resultDto,
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/dashboard');
  await page
    .getByRole('button', { name: 'Start adaptive practice', exact: true })
    .click();
  const input = page.getByRole('textbox', { name: 'Typing input stream' });
  await input.press('x');
  await input.press('Backspace');
  await input.press('a');
  await input.press('b');

  await expect(page.getByRole('heading', { name: 'Session completed' }))
    .toBeVisible();
  await expect(page.getByText('10', { exact: true })).toBeVisible();
  await expect(page.getByText('12', { exact: true })).toBeVisible();
  await expect(page.getByText('50%', { exact: true })).toBeVisible();
  await expect(page.getByText('100%', { exact: true })).toBeVisible();
  await expect(page.getByText('Key Performance & Evidence')).toBeVisible();
  await expect(page.getByText('1 errors across 2 attempts')).toBeVisible();
  await expect(page.getByText('+0 XP earned')).toHaveCount(0);
  await expect(page.getByText(/latest recommendation/)).toHaveCount(0);

  const submitted = api.bodies[0];
  expect(submitted.events.map((event) => event.type)).toEqual([
    'insert',
    'backspace',
    'insert',
    'insert',
  ]);
  expect(submitted.events[0].char).toBe('x');
  expect(submitted.events[2].char).toBe('a');
  expect(submitted.events[3].char).toBe('b');
});

test('paste, drop, IME, repeats, and non-ASCII keys never enter the submission', async ({
  page,
}) => {
  const api = await setup(page, { assignedText: 'A' });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/dashboard');
  await page
    .getByRole('button', { name: 'Start adaptive practice', exact: true })
    .click();

  const input = page.getByRole('textbox', { name: 'Typing input stream' });
  const stage = input.locator('..');
  await input.evaluate((element) => {
    element.blur();
    window.dispatchEvent(new Event('blur'));
    window.dispatchEvent(new Event('focus'));
  });
  await expect(input).toBeFocused();
  await stage.evaluate((element) => {
    element.dispatchEvent(
      new ClipboardEvent('paste', {
        bubbles: true,
        clipboardData: new DataTransfer(),
      }),
    );
    element.dispatchEvent(
      new DragEvent('drop', { bubbles: true, dataTransfer: new DataTransfer() }),
    );
  });
  await input.evaluate((element) => {
    element.dispatchEvent(
      new CompositionEvent('compositionstart', {
        bubbles: true,
        data: 'a',
      }),
    );
    element.dispatchEvent(
      new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: 'paste',
      }),
    );
    element.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'a',
        repeat: true,
      }),
    );
    const compositionKey = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'a',
    });
    Object.defineProperty(compositionKey, 'isComposing', { value: true });
    element.dispatchEvent(compositionKey);
    element.dispatchEvent(
      new CompositionEvent('compositionend', {
        bubbles: true,
        data: 'a',
      }),
    );
    element.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'ش',
      }),
    );
  });

  await expect(stage.locator('span.text-success-text')).toHaveCount(0);
  await input.pressSequentially('A');
  await expect(page.getByRole('button', { name: 'Return to dashboard' }))
    .toBeVisible();
  expect(api.bodies).toHaveLength(1);
  expect(api.bodies[0].events).toHaveLength(1);
  expect(api.bodies[0].events[0]).toMatchObject({
    seq: 0,
    type: 'insert',
    char: 'A',
  });
});

test('a summary refresh failure retains previous data after an official result', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const api = await setup(page);
  await page.goto('/dashboard');
  await page
    .getByRole('button', { name: 'Start adaptive practice', exact: true })
    .click();
  await page
    .getByRole('textbox', { name: 'Typing input stream' })
    .pressSequentially(sessionAssignment.text);
  await expect(
    page.getByRole('button', { name: 'Return to dashboard' }),
  ).toBeVisible();
  api.fail();
  await page.getByRole('button', { name: 'Return to dashboard' }).click();
  await expect(
    page.getByText('Showing previously loaded data. Refresh failed.'),
  ).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('progressbar')).toBeVisible();
});
