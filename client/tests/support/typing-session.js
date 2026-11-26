// Isolated authenticated practice API fixtures shared by typing browser tests.
import {
  dashboardResponse,
  pathResponse,
  sessionAssignment,
  sessionHistoryResponse,
  sessionResult,
  studentUser,
} from '../fixtures/data.js';

/**
 * Replace only session HTTP calls for browser presentation and retry checks.
 *
 * @param {import('@playwright/test').Page} page Browser page under test.
 * @param {object} [options] Passage and controlled submit-response behavior.
 * @param {string} [options.text] Exact server-assigned practice text.
 * @param {'success'|'commit-then-drop'|'drop-then-success'|'drop-then-conflict'|'drop-then-expire'} [options.submitBehavior] Simulated server/network outcome.
 * @returns {Promise<object>} Request observations and controls for assertions.
 */
export async function mockPracticeSession(page, {
  text = sessionAssignment.text,
  submitBehavior = 'success',
} = {}) {
  const account = structuredClone(studentUser);
  const csrfToken = 'a'.repeat(64);
  const assignment = {
    ...structuredClone(sessionAssignment),
    text,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
  let savedResult = null;
  let dashboard = structuredClone(dashboardResponse);
  const startBodies = [];
  const submitBodies = [];

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api/v1', '');
    const method = request.method();

    if (path === '/auth/me') {
      return route.fulfill({ json: { user: account, csrfToken } });
    }
    if (path === '/dashboard') {
      return route.fulfill({ json: dashboard });
    }
    if (path === '/path') {
      return route.fulfill({ json: pathResponse });
    }
    if (path === '/sessions' && method === 'POST') {
      startBodies.push(request.postDataJSON());
      return route.fulfill({ status: 201, json: assignment });
    }
    if (path === '/sessions' && method === 'GET') {
      return route.fulfill({
        json: savedResult
          ? {
              sessions: [
                {
                  ...sessionHistoryResponse.sessions[0],
                  id: assignment.sessionId,
                },
              ],
            }
          : { sessions: [] },
      });
    }
    if (path === `/sessions/${assignment.sessionId}` && method === 'GET') {
      if (savedResult) {
        return route.fulfill({ json: savedResult });
      }
      return route.fulfill({
        json: {
          sessionId: assignment.sessionId,
          status: 'created',
          mode: 'practice',
          text: assignment.text,
          expiresAt: assignment.expiresAt,
        },
      });
    }
    if (path.endsWith('/submit') && method === 'POST') {
      const body = request.postDataJSON();
      submitBodies.push(body);

      if (submitBehavior === 'commit-then-drop' && submitBodies.length === 1) {
        savedResult = structuredClone(sessionResult);
        return route.abort('failed');
      }
      if (submitBehavior === 'drop-then-success' && submitBodies.length === 1) {
        return route.abort('failed');
      }
      if (
        submitBehavior === 'drop-then-conflict' &&
        submitBodies.length === 1
      ) {
        return route.abort('failed');
      }
      if (submitBehavior === 'drop-then-expire') {
        if (submitBodies.length === 1) {
          assignment.expiresAt = new Date(Date.now() - 1000).toISOString();
          return route.abort('failed');
        }
        return route.fulfill({
          status: 409,
          json: { error: { code: 'SESSION_UNAVAILABLE' } },
        });
      }
      if (
        submitBehavior === 'drop-then-conflict' &&
        submitBodies.length === 2
      ) {
        return route.fulfill({
          status: 409,
          json: { error: { code: 'SESSION_CONFLICT' } },
        });
      }

      savedResult = structuredClone(sessionResult);
      dashboard = {
        ...dashboard,
        recentSessions: [
          {
            ...dashboard.recentSessions[0],
            id: assignment.sessionId,
          },
        ],
      };
      return route.fulfill({ json: savedResult });
    }
    if (path === '/users/me' && method === 'PATCH') {
      const patch = request.postDataJSON();
      account.preferences = { ...account.preferences, ...patch.preferences };
      return route.fulfill({ json: { user: account } });
    }

    return route.fulfill({
      status: 503,
      json: { error: { code: 'SERVICE_UNAVAILABLE' } },
    });
  });

  return {
    assignment,
    startBodies,
    submitBodies,
    async openPractice() {
      await page.goto('/dashboard');
      await page
        .getByRole('button', { name: 'Start adaptive practice', exact: true })
        .click();
      await page
        .getByRole('textbox', { name: 'Typing input stream' })
        .waitFor({ state: 'attached' });
    },
  };
}
