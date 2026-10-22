/** FE-06/FE-10 contracts, exact retries and ownership races without a real database. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboardResponseSchema, pathResponseSchema } from '@typeflow/shared';
import {
  createSessionController,
  SESSION_POINTER_KEY,
} from '../../../client/src/features/typing/sessionController.js';
import {
  dashboardResponse,
  newStudentDashboardResponse,
  pathResponse,
} from '../../../client/src/mocks/dashboard.js';
import {
  sessionAssignment,
  sessionSubmission,
  sessionResult,
} from '../../../client/src/mocks/sessions.js';

/** Controllable I/O lets tests resolve stale requests after ownership changes. */
function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

/** Only a string map is needed to prove that raw events/text never enter storage. */
function harness(overrides = {}) {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  const results = [];
  const api = {
    startPracticeSession: async () => structuredClone(sessionAssignment),
    fetchSession: async () => ({ ...sessionAssignment, status: 'created' }),
    submitSession: async () => structuredClone(sessionResult),
    abandonSession: async () => ({ status: 'abandoned' }),
    ...overrides,
  };
  const options = {
    ownerId: 'student-a',
    csrfToken: 'a'.repeat(64),
    api,
    storage,
    now: () => 0,
    onResult: (...args) => results.push(args),
  };
  return {
    controller: createSessionController(options),
    options,
    values,
    results,
  };
}

test('current dashboard/path DTOs preserve zero/null and reject absent required fields', () => {
  for (const fixture of [dashboardResponse, newStudentDashboardResponse]) {
    assert.equal(dashboardResponseSchema.safeParse(fixture).success, true);
  }
  assert.equal(pathResponseSchema.safeParse(pathResponse).success, true);
  const sparse = structuredClone(dashboardResponse);
  sparse.user.xp = 0;
  sparse.recentSessions[0].netWpm = null;
  const parsed = dashboardResponseSchema.parse({
    ...sparse,
    secret: 'strip me',
  });
  assert.equal(parsed.user.xp, 0);
  assert.equal(parsed.recentSessions[0].netWpm, null);
  assert.equal(parsed.secret, undefined);
  delete sparse.dailyGoal;
  assert.equal(dashboardResponseSchema.safeParse(sparse).success, false);
});

test('double start and repeated start allocate only one assignment; storage contains IDs only', async () => {
  const waiting = deferred();
  let starts = 0;
  const { controller, values } = harness({
    startPracticeSession: () => {
      starts += 1;
      return waiting.promise;
    },
  });
  const first = controller.startPractice();
  assert.equal(await controller.startPractice(), false);
  waiting.resolve(sessionAssignment);
  await first;
  assert.equal(await controller.startPractice(), true);
  assert.equal(starts, 1);
  assert.deepEqual(JSON.parse(values.get(SESSION_POINTER_KEY)), {
    ownerId: 'student-a',
    sessionId: sessionAssignment.sessionId,
  });
});

test('lost start response remains explicit and is never automatically retried', async () => {
  let calls = 0;
  const { controller } = harness({
    startPracticeSession: async () => {
      calls += 1;
      throw new Error('network');
    },
  });
  assert.equal(await controller.startPractice(), false);
  assert.equal(controller.getSnapshot().status, 'start-error');
  assert.equal(calls, 1);
});

test('uncertain submission freezes body, blocks typing changes and retries identical data', async () => {
  const bodies = [];
  const { controller } = harness({
    submitSession: async (_id, body) => {
      bodies.push(structuredClone(body));
      if (bodies.length === 1)
        throw Object.assign(new Error('network'), { retryable: true });
      return sessionResult;
    },
  });
  await controller.startPractice();
  const payload = structuredClone(sessionSubmission);
  await controller.submit(payload);
  payload.events[0].char = 'x';
  payload.finishTimeMs += 100;
  controller.setPhase('typing');
  assert.equal(controller.getSnapshot().status, 'retry');
  await controller.retry();
  assert.deepEqual(bodies, [sessionSubmission, sessionSubmission]);
  assert.equal(controller.getSnapshot().status, 'completed');
});

test('a committed result recovered after dropped response is not resubmitted/rewarded as new', async () => {
  let submits = 0;
  const { controller, results } = harness({
    submitSession: async () => {
      submits += 1;
      throw Object.assign(new Error('lost response'), { retryable: true });
    },
    fetchSession: async () => sessionResult,
  });
  await controller.startPractice();
  await controller.submit(sessionSubmission);
  await controller.retry();
  assert.equal(submits, 1);
  assert.equal(results.length, 1);
  assert.deepEqual(results[0][1], { recovered: true, newRewards: [] });
});

test('reload restores status without resuming lost events; restart abandons before start', async () => {
  const calls = [];
  const h = harness({
    abandonSession: async () => {
      calls.push('abandon');
    },
    startPracticeSession: async () => {
      calls.push('start');
      return sessionAssignment;
    },
  });
  await h.controller.startPractice();
  const restored = createSessionController(h.options);
  await restored.recover();
  assert.equal(restored.getSnapshot().status, 'recovery-required');
  assert.equal(await restored.submit(sessionSubmission), false);
  await restored.restart();
  assert.deepEqual(calls, ['start', 'abandon', 'start']);
});

test('failed abandon cannot allocate a replacement', async () => {
  let starts = 0;
  const { controller } = harness({
    startPracticeSession: async () => {
      starts += 1;
      return sessionAssignment;
    },
    abandonSession: async () => {
      throw new Error('offline');
    },
  });
  await controller.startPractice();
  assert.equal(await controller.restart(), false);
  assert.equal(starts, 1);
});

test('a failed reload read keeps the pointer available for confirmed abandonment', async () => {
  let starts = 0;
  let abandons = 0;
  const h = harness({
    fetchSession: async () => {
      throw new Error('offline');
    },
    startPracticeSession: async () => {
      starts += 1;
      return sessionAssignment;
    },
    abandonSession: async () => {
      abandons += 1;
      throw new Error('offline');
    },
  });
  await h.controller.startPractice();
  const restored = createSessionController(h.options);
  await restored.recover();
  assert.equal(
    restored.getSnapshot().assignment.sessionId,
    sessionAssignment.sessionId,
  );
  assert.equal(await restored.restart(), false);
  assert.equal(starts, 1);
  assert.equal(abandons, 1);
});

test('expired/abandoned reloads and rejected submissions do not offer blind retries', async () => {
  for (const detail of [
    { ...sessionAssignment, status: 'abandoned' },
    {
      ...sessionAssignment,
      status: 'created',
      expiresAt: '1970-01-01T00:00:00Z',
    },
  ]) {
    const h = harness({ fetchSession: async () => detail });
    await h.controller.startPractice();
    const restored = createSessionController(h.options);
    await restored.recover();
    assert.ok(['expired', 'abandoned'].includes(restored.getSnapshot().status));
  }
  for (const status of [401, 403, 409, 422]) {
    const { controller } = harness({
      submitSession: async () => {
        throw { status };
      },
    });
    await controller.startPractice();
    await controller.submit(sessionSubmission);
    assert.equal(controller.getSnapshot().canRetry, false);
    assert.equal(await controller.retry(), false);
  }
});

test('account changes discard late assignments/results and cannot overwrite another owner pointer', async () => {
  const waiting = deferred();
  const h = harness({ startPracticeSession: () => waiting.promise });
  const pending = h.controller.startPractice();
  h.controller.deactivate();
  h.values.set(
    SESSION_POINTER_KEY,
    JSON.stringify({
      ownerId: 'student-b',
      sessionId: sessionAssignment.sessionId,
    }),
  );
  waiting.resolve(sessionAssignment);
  assert.equal(await pending, false);
  assert.equal(h.controller.getSnapshot().assignment, null);
  h.controller.clear();
  assert.equal(
    JSON.parse(h.values.get(SESSION_POINTER_KEY)).ownerId,
    'student-b',
  );
  assert.equal(h.results.length, 0);
});

test('a late submission after logout cannot publish a result or refresh protected cache', async () => {
  const waiting = deferred();
  const h = harness({ submitSession: () => waiting.promise });
  await h.controller.startPractice();
  const pending = h.controller.submit(sessionSubmission);
  h.controller.clear();
  waiting.resolve(sessionResult);
  await pending;
  assert.equal(h.controller.getSnapshot().result, null);
  assert.equal(h.results.length, 0);
});
