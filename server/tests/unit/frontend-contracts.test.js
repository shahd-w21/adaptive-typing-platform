/**
 * FE-02 boundary tests executed by the root Node test runner.
 * Injected Fetch responses and synthetic DTOs test serialization/error handling;
 * real HTTP/database authentication is covered in integration/features.test.js.
 * TanStack tests below use its real cache without mounting React components.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { request, ApiError } from '../../../client/src/api/client.js';
import { queryKeys } from '../../../client/src/lib/queryKeys.js';
import {
  sessionAssignmentSchema,
  sessionResultSchema,
  sessionDetailSchema,
  sessionHistorySchema,
  publicUserSchema,
} from '@typeflow/shared';
import {
  sessionAssignment,
  sessionResult,
  sessionHistoryResponse,
} from '../../../client/src/mocks/sessions.js';
import { studentUser } from '../../../client/src/mocks/users.js';
import { QueryClient } from '@tanstack/react-query';
import { fetchDashboard } from '../../../client/src/api/dashboard.js';
import en from '../../../client/src/i18n/dictionaries/en.json' with { type: 'json' };
import ar from '../../../client/src/i18n/dictionaries/ar.json' with { type: 'json' };

// Shape-valid test value only: it cannot authenticate against a real server.
const csrfToken = 'a'.repeat(64);

// Build a Fetch-compatible JSON response so tests exercise actual response parsing.
const json = (body, status = 200, headers) =>
  new Response(JSON.stringify(body), { status, headers });

test('transport preserves credentials and parses/allowlists auth fields before sending', async () => {
  await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: ' TEST@example.test ',
      password: 'abc',
      role: 'admin',
    }),
    headers: { Authorization: 'Bearer forbidden' },
    fetchImpl: async (_url, options) => {
      assert.equal(options.credentials, 'include');
      assert.equal(options.headers.has('Authorization'), false);
      assert.deepEqual(JSON.parse(options.body), {
        email: 'test@example.test',
        password: 'abc',
      });
      return json({
        user: { ...studentUser, passwordHash: 'private' },
        csrfToken,
        token: 'private',
      });
    },
  }).then((value) => {
    assert.equal(value.token, undefined);
    assert.equal(value.user.passwordHash, undefined);
  });
});

test('strict request boundaries reject unknown nested fields and client scores before fetching', async () => {
  const fetchImpl = () => assert.fail('invalid request reached fetch');
  for (const [path, body] of [
    ['/users/me', { preferences: { uiLocale: 'ar', role: 'admin' } }],
    ['/sessions', { mode: 'practice', enrollmentId: 'draft' }],
    [
      `/sessions/${sessionAssignment.sessionId}/submit`,
      {
        events: [{ seq: 0, type: 'insert', t: 0, char: 'a' }],
        finishTimeMs: 0,
        score: 100,
      },
    ],
  ]) {
    await assert.rejects(
      request(path, {
        method: path === '/users/me' ? 'PATCH' : 'POST',
        csrfToken,
        body,
        fetchImpl,
      }),
      { code: 'INVALID_REQUEST' },
    );
  }
});

test('authenticated writes require explicit CSRF and caller headers cannot override it', async () => {
  await assert.rejects(
    request('/users/me', {
      method: 'PATCH',
      body: '{}',
      fetchImpl: () => assert.fail(),
    }),
    { code: 'CSRF_FAILED', status: 403 },
  );
  await request('/users/me', {
    method: 'PATCH',
    csrfToken,
    body: { name: 'New' },
    headers: { 'X-CSRF-Token': 'wrong' },
    fetchImpl: async (_url, options) => {
      assert.equal(options.headers.get('X-CSRF-Token'), csrfToken);
      return json({ user: studentUser });
    },
  });
});

test('status mapping hides untrusted server messages and supports bounded retry metadata', async () => {
  for (const [status, code] of [
    [400, 'INVALID_REQUEST'],
    [401, 'UNAUTHENTICATED'],
    [403, 'FORBIDDEN'],
    [404, 'NOT_FOUND'],
    [409, 'CONFLICT'],
    [422, 'INVALID_SUBMISSION'],
    [429, 'RATE_LIMITED'],
    [503, 'SERVICE_UNAVAILABLE'],
  ]) {
    let calls = 0;
    await assert.rejects(
      request('/progress', {
        fetchImpl: async () => {
          calls++;
          return json(
            {
              error: {
                code: 'UNKNOWN_PRIVATE_CODE',
                message: '<private database details>',
              },
            },
            status,
            { 'Retry-After': '2' },
          );
        },
      }),
      (error) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.status, status);
        assert.equal(error.code, code);
        assert.equal(error.messageKey, `apiErrors.${code}`);
        assert.equal(typeof en.apiErrors[code], 'string');
        assert.equal(typeof ar.apiErrors[code], 'string');
        assert.equal(error.retryAfterMs, 2000);
        assert.doesNotMatch(error.message, /private/);
        return true;
      },
    );
    assert.equal(calls, 1);
  }
});

test('login rejection is distinct from an expired protected session', async () => {
  await assert.rejects(
    request('/auth/login', {
      method: 'POST',
      body: { email: 'a@example.test', password: 'wrong' },
      fetchImpl: async () =>
        json({ error: { code: 'INVALID_CREDENTIALS' } }, 401),
    }),
    (error) => error.authenticationRequired === false,
  );
  await assert.rejects(
    request('/auth/me', {
      fetchImpl: async () => json({ error: { code: 'UNAUTHENTICATED' } }, 401),
    }),
    (error) => error.authenticationRequired === true,
  );
});

test('network errors retain their cause; cancellation remains cancellation; writes are not retried', async () => {
  const cause = new TypeError('offline');
  let count = 0;
  await assert.rejects(
    request('/auth/logout', {
      method: 'POST',
      csrfToken,
      fetchImpl: async () => {
        count++;
        throw cause;
      },
    }),
    (error) => error.code === 'NETWORK_ERROR' && error.cause === cause,
  );
  assert.equal(count, 1);
  const cancellation = new DOMException('cancelled', 'AbortError');
  await assert.rejects(
    request('/progress', {
      fetchImpl: async () => {
        throw cancellation;
      },
    }),
    (error) => error === cancellation,
  );
});

test('malformed and incomplete successful responses are contract errors, not empty data', async () => {
  for (const response of [
    new Response('<html>'),
    json({ user: studentUser }),
    new Response(null, { status: 204 }),
  ]) {
    await assert.rejects(
      request('/auth/me', { fetchImpl: async () => response }),
      { code: 'CONTRACT_ERROR' },
    );
  }
  assert.equal(
    await request('/progress', {
      fetchImpl: async () => new Response(null, { status: 204 }),
    }),
    null,
  );
});

test('unavailable features, 404 and successful empty history remain distinct', async () => {
  await assert.rejects(
    request('/courses', { available: false, fetchImpl: () => assert.fail() }),
    { code: 'FEATURE_UNAVAILABLE' },
  );
  await assert.rejects(
    request('/courses', {
      fetchImpl: async () => json({ error: { code: 'NOT_FOUND' } }, 404),
    }),
    { code: 'NOT_FOUND' },
  );
  assert.deepEqual(
    await request('/sessions', {
      fetchImpl: async () => json({ sessions: [] }),
    }),
    { sessions: [] },
  );
});

test('transport rejects external and unsupported paths and invalid session IDs', async () => {
  for (const path of [
    'https://evil.test',
    '//evil.test',
    '/../secret',
    '/sessions/not-a-uuid',
    '/sessions?role=admin',
  ]) {
    await assert.rejects(request(path, { fetchImpl: () => assert.fail() }), {
      code: 'INVALID_REQUEST',
    });
  }
});

test('current synthetic DTOs match runtime contracts; future modes are not silently accepted', () => {
  publicUserSchema.parse(studentUser);
  sessionAssignmentSchema.parse(sessionAssignment);
  sessionResultSchema.parse(sessionResult);
  sessionDetailSchema.parse(sessionResult);
  sessionHistorySchema.parse(sessionHistoryResponse);
  assert.equal(
    sessionAssignmentSchema.safeParse({ ...sessionAssignment, mode: 'lesson' })
      .success,
    false,
  );
  assert.equal(
    sessionResultSchema.safeParse({
      ...sessionResult,
      metrics: { ...sessionResult.metrics, rawAccuracy: null },
    }).success,
    true,
  );
});

test('query keys isolate accounts/resources and reject unsupported filters or absent owners', () => {
  assert.notDeepEqual(queryKeys.progress('one'), queryKeys.progress('two'));
  assert.deepEqual(
    queryKeys.dashboard('one').slice(0, 2),
    queryKeys.owner('one'),
  );
  assert.notDeepEqual(
    queryKeys.session('one', 'first'),
    queryKeys.session('one', 'second'),
  );
  assert.deepEqual(queryKeys.progress('one', {}), queryKeys.progress('one'));
  assert.throws(() => queryKeys.progress('one', { mode: 'lesson' }));
  assert.throws(() => queryKeys.progress(null));
  assert.deepEqual(queryKeys.auth.current, ['auth', 'me']);
  assert.deepEqual(queryKeys.public('catalog'), ['public', 'catalog']);
});

test('TanStack cache removal by owner preserves another account and public data', () => {
  const client = new QueryClient();
  try {
    client.setQueryData(queryKeys.dashboard('first'), { xp: 1 });
    client.setQueryData(queryKeys.dashboard('second'), { xp: 2 });
    client.setQueryData(queryKeys.public('catalog'), []);
    client.removeQueries({ queryKey: queryKeys.owner('first') });
    assert.equal(client.getQueryData(queryKeys.dashboard('first')), undefined);
    assert.deepEqual(client.getQueryData(queryKeys.dashboard('second')), {
      xp: 2,
    });
    assert.deepEqual(client.getQueryData(queryKeys.public('catalog')), []);
  } finally {
    client.clear();
  }
});

test('owner cancellation reaches Fetch and late data cannot populate the cancelled cache', async (context) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  let signal;
  context.mock.method(globalThis, 'fetch', async (_url, options) => {
    signal = options.signal;
    return new Promise((_resolve, reject) =>
      signal.addEventListener('abort', () => reject(signal.reason), {
        once: true,
      }),
    );
  });
  try {
    const pending = client.fetchQuery({
      queryKey: queryKeys.dashboard('first'),
      queryFn: fetchDashboard,
    });
    const rejected = assert.rejects(pending);
    await client.cancelQueries({ queryKey: queryKeys.owner('first') });
    await rejected;
    assert.equal(signal.aborted, true);
    assert.equal(client.getQueryData(queryKeys.dashboard('first')), undefined);
  } finally {
    client.clear();
  }
});
