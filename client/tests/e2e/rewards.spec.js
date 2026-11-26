/** Browser acceptance checks for FE-31 reward deduplication, retry safety, and zero typing polling. */
import { test, expect } from '../support/browser.js';
import {
  studentUser,
  newStudentUser,
  dashboardResponse,
  pathResponse,
  sessionAssignment,
  sessionResult,
} from '../fixtures/data.js';

async function setupRewardsFlow(
  page,
  { dropSubmit = false, recovered = false } = {},
) {
  let currentUser = structuredClone(studentUser);
  currentUser.preferences = { themePreference: 'light', uiLocale: 'en' };
  let shouldDropSubmit = dropSubmit;
  let isSaved = recovered;
  let submitCount = 0;
  const networkLog = [];

  const assignment = {
    ...sessionAssignment,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  };

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api/v1', '');
    networkLog.push(`${request.method()} ${path}`);

    if (path === '/auth/me') {
      return route.fulfill({
        json: { user: currentUser, csrfToken: 'a'.repeat(64) },
      });
    }
    if (path === '/auth/logout') {
      return route.fulfill({ json: { ok: true } });
    }
    if (path === '/dashboard') {
      return route.fulfill({ json: dashboardResponse });
    }
    if (path === '/path') {
      return route.fulfill({ json: pathResponse });
    }
    if (path === '/gamification') {
      return route.fulfill({
        json: {
          xp: currentUser.xp,
          level: currentUser.level,
          streak: currentUser.streak,
          dailyGoal: { goalMinutes: 10, minutesToday: 4.5, done: false },
        },
      });
    }
    if (
      (path === '/sessions' || path === '/sessions/start') &&
      request.method() === 'POST'
    ) {
      return route.fulfill({ status: 201, json: assignment });
    }
    if (path === `/sessions/${assignment.sessionId}` && request.method() === 'GET') {
      if (!isSaved) {
        return route.fulfill({
          status: 404,
          json: { error: { code: 'NOT_FOUND' } },
        });
      }
      return route.fulfill({
        json: {
          ...sessionResult,
          sessionId: assignment.sessionId,
          xpEarned: 19,
          streak: 2,
        },
      });
    }
    if (path === `/sessions/${assignment.sessionId}/submit` && request.method() === 'POST') {
      submitCount += 1;
      isSaved = true;
      if (shouldDropSubmit) {
        shouldDropSubmit = false;
        return route.abort('failed');
      }
      return route.fulfill({
        json: {
          ...sessionResult,
          sessionId: assignment.sessionId,
          xpEarned: 19,
          streak: 2,
        },
      });
    }
    return route.fulfill({ status: 404, json: { error: { code: 'NOT_FOUND' } } });
  });

  return {
    assignment,
    networkLog,
    getSubmitCount: () => submitCount,
    switchUser(nextUser) {
      currentUser = structuredClone(nextUser);
    },
  };
}

test('deduplicates reward notifications, avoids double celebration on retry recovery, and issues zero polling during typing', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const mock = await setupRewardsFlow(page, { dropSubmit: true });
  await page.goto('/dashboard');
  await page
    .getByRole('button', { name: 'Start adaptive practice', exact: true })
    .click();

  const input = page.getByRole('textbox', { name: 'Typing input stream' });
  await expect(input).toBeAttached();

  // Measure network traffic while typing characters over > 500ms.
  const countBeforeTyping = mock.networkLog.length;
  await input.pressSequentially(mock.assignment.text.slice(0, 9), { delay: 65 });
  await page.waitForTimeout(300);
  const requestsDuringTyping = mock.networkLog.slice(countBeforeTyping);
  expect(requestsDuringTyping).toEqual([]);

  // Finish the remaining passage to trigger submission (first submit drops).
  await input.pressSequentially(mock.assignment.text.slice(9), { delay: 10 });
  await expect(
    page.getByRole('button', { name: /Retry/i }).first(),
  ).toBeVisible();

  // Retry recovers the already-committed result without celebrating twice.
  await page.getByRole('button', { name: /Retry/i }).first().click();
  await expect(
    page.getByRole('button', { name: 'Return to dashboard' }),
  ).toBeVisible();

  // Recovered result must not trigger a celebratory reward notification toast.
  await expect(
    page.getByRole('region', { name: 'Reward notifications' }),
  ).toHaveCount(0);
});

test('deduplicates identical server reward event IDs on fresh commit and clears on logout/account switch', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const mock = await setupRewardsFlow(page, { dropSubmit: false });
  await page.goto('/dashboard');
  await page
    .getByRole('button', { name: 'Start adaptive practice', exact: true })
    .click();

  const input = page.getByRole('textbox', { name: 'Typing input stream' });
  await expect(input).toBeAttached();
  await input.pressSequentially(mock.assignment.text, { delay: 10 });

  // Return to dashboard (RewardNotifications renders outside active typing in StudentShell).
  await page.getByRole('button', { name: 'Return to dashboard' }).click();

  // Fresh commit renders deduplicated official reward notifications (streak + daily goal).
  const region = page.getByRole('region', { name: 'Reward notifications' });
  await expect(region).toBeVisible();
  await expect(region.getByRole('listitem')).toHaveCount(2);
  await expect(region).toContainText('2');

  // Logging out and switching accounts must clear the previous user's notifications.
  mock.switchUser({
    ...newStudentUser,
    preferences: { themePreference: 'light', uiLocale: 'en' },
  });
  await page.getByRole('button', { name: 'Log Out' }).click();
  await page.goto('/dashboard');
  await expect(
    page.getByRole('region', { name: 'Reward notifications' }),
  ).toHaveCount(0);
});
