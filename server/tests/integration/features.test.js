import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { createDatabase } from '../../src/db/prisma.js';
import { assertLocalDatabase } from '../../../scripts/database-target.js';
import { seedStarter } from '../../src/modules/settings/starter.js';
import { ensureKeyProgress, updateKeyProgress } from '../../src/modules/stats/service.js';
import { purgeKeystrokeLogs } from '../../src/jobs/purgeKeystrokeLogs.js';
import { createSessionService } from '../../src/modules/sessions/service.js';
import { once } from 'node:events';
import { request as frontendRequest } from '../../../client/src/api/client.js';
import { dashboardResponseSchema, pathResponseSchema } from '@typeflow/shared';
import { createSessionController } from '../../../client/src/features/typing/sessionController.js';

const config = { JWT_SECRET: 'test-only-migration-signing-secret-longer-than-32', NODE_ENV: 'test', CLIENT_URL: 'http://localhost:5173' };
const password = 'StrongPass123';
const stamp = randomUUID();
let count = 0;
async function fixture(run) {
  const database = createDatabase(assertLocalDatabase(process.env.DATABASE_URL, 'typeflow_test'));
  const prefix = `migration-${stamp}-${count++}`;
  const emails = [];
  let instant = new Date();
  const inbox = [];
  const app = createApp({ database, clientUrl: config.CLIENT_URL, config, now: () => instant,
    random: () => 0.1, sendMail: async mail => inbox.push(mail) });
  const agent = request.agent(app);
  async function user(role = 'STUDENT') {
    const email = `${prefix}-${emails.length}@example.test`; emails.push(email);
    return database.user.create({ data: { email, passwordHash: await bcrypt.hash(password, 10), emailVerifiedAt: new Date(), role } });
  }
  async function login(person, client = agent) {
    const response = await client.post('/api/v1/auth/login').send({ email: person.email, password }).expect(200);
    assert.equal(response.body.token, undefined);
    assert.equal(response.body.user.passwordHash, undefined);
    return response.body.csrfToken;
  }
  try {
    await seedStarter(database);
    await run({ database, app, agent, inbox, user, login, emails, prefix, advance: ms => { instant = new Date(instant.getTime() + ms); } });
  } finally {
    await database.user.deleteMany({ where: { email: { in: emails } } });
    await database.$disconnect();
  }
}
const emailToken = mail => new URL(mail.text.match(/https?:\/\/\S+/)[0]).searchParams.get('token');

// Exercise the actual controller/transport against test PostgreSQL. Simulate a
// dropped response only AFTER the real server commits, never replace scoring.
test('FE-06/FE-10 real dashboard refresh and lost-response recovery preserve one result', async () =>
  fixture(async ({ app, user, advance }) => {
    const person = await user();
    const server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    let cookie = '';
    const fetchImpl = async (url, options) => {
      const headers = new Headers(options.headers);
      headers.set('Origin', config.CLIENT_URL);
      if (cookie) {
        headers.set('Cookie', cookie);
      }
      const response = await fetch(`${base}${new URL(url).pathname}`, { ...options, headers });
      const received = response.headers.getSetCookie()[0];
      if (received) {
        cookie = received.split(';')[0];
      }
      return response;
    };
    const call = (path, options) => frontendRequest(path, { ...options, fetchImpl });
    try {
      const session = await call('/auth/login', { method: 'POST', body: { email: person.email, password } });
      const readDashboard = () => call('/dashboard', { responseSchema: dashboardResponseSchema });
      assert.equal((await readDashboard()).recentSessions.length, 0);
      await call('/path', { responseSchema: pathResponseSchema });
      let submits = 0;
      const controller = createSessionController({
        ownerId: person.id,
        csrfToken: session.csrfToken,
        api: {
          startPracticeSession: csrfToken => call('/sessions', { method: 'POST', csrfToken, body: { mode: 'practice' } }),
          fetchSession: id => call(`/sessions/${id}`),
          submitSession: async (id, body, csrfToken) => {
            submits += 1;
            await call(`/sessions/${id}/submit`, { method: 'POST', csrfToken, body });
            throw Object.assign(new Error('Simulated dropped response'), { retryable: true });
          },
        },
      });
      await controller.startPractice();
      const assignment = controller.getSnapshot().assignment;
      const events = [...assignment.text].map((char, seq) => ({ seq, type: 'insert', char, t: seq * 600 }));
      const finishTimeMs = events.at(-1).t;
      advance(finishTimeMs + 1000);
      await controller.submit({ events, finishTimeMs });
      assert.equal(controller.getSnapshot().status, 'retry');
      await controller.retry();
      assert.equal(controller.getSnapshot().status, 'completed');
      assert.equal(submits, 1);
      const dashboard = await readDashboard();
      assert.equal(dashboard.recentSessions.length, 1);
      assert.equal(dashboard.recentSessions[0].id, assignment.sessionId);
      assert.equal(dashboard.user.xp, controller.getSnapshot().result.xp);
      assert.equal(dashboard.streak, controller.getSnapshot().result.streak);
    } finally {
      await new Promise(resolve => server.close(resolve));
    }
  }));

// FE-02 acceptance exercises the browser transport against real API handlers
// and the dedicated test database. The fixture removes its accounts afterward;
// browser-specific CORS/rendering behavior still needs a separate browser check.
test('FE-02 real HTTP transport validates login/profile/session DTOs and server CSRF rejection', async () =>
  fixture(async ({ app, user, advance }) => {
    const person = await user();
    const server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    // Node has no browser cookie jar. Retain only the real cookie set by login;
    // this adapter neither injects identity nor bypasses server authentication.
    let cookie = '';
    const fetchImpl = async (url, options) => {
      const headers = new Headers(options.headers);
      headers.set('Origin', config.CLIENT_URL);
      if (cookie) headers.set('Cookie', cookie);
      const response = await fetch(`${base}${new URL(url).pathname}`, {
        ...options,
        headers,
      });
      const received = response.headers.getSetCookie()[0];
      if (received) cookie = received.split(';')[0];
      return response;
    };
    const call = (path, options) =>
      frontendRequest(path, { ...options, fetchImpl });
    try {
      const session = await call('/auth/login', {
        method: 'POST',
        body: { email: person.email, password, role: 'admin' },
      });
      assert.equal(session.user.id, person.id);
      assert.equal(session.user.role, 'student');
      const restored = await call('/auth/me');
      assert.equal(restored.csrfToken, session.csrfToken);
      const patch = { preferences: { uiLocale: 'ar' } };
      const changed = await call('/users/me', {
        method: 'PATCH',
        csrfToken: restored.csrfToken,
        body: patch,
      });
      assert.equal(changed.user.preferences.uiLocale, 'ar');
      // Deliberately bypass the local guard to demonstrate the SERVER rejects it.
      const rejected = await fetchImpl(`${base}/api/v1/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      assert.equal(rejected.status, 403);
      assert.equal((await rejected.json()).error.code, 'CSRF_FAILED');
      const invalid = await fetchImpl(`${base}/api/v1/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': restored.csrfToken,
        },
        body: JSON.stringify({ role: 'admin' }),
      });
      assert.equal(invalid.status, 400);
      await call('/users/me', {
        method: 'PATCH',
        csrfToken: restored.csrfToken,
        body: { preferences: { uiLocale: 'en' } },
      });
      const assignment = await call('/sessions', {
        method: 'POST',
        csrfToken: session.csrfToken,
        body: {},
      });
      await call(`/sessions/${assignment.sessionId}`);
      advance(60000);
      const submission = {
        events: [...assignment.text].map((char, seq) => ({
          seq,
          type: 'insert',
          t: seq * 200,
          char,
        })),
        finishTimeMs: (assignment.text.length - 1) * 200,
      };
      const result = await call(`/sessions/${assignment.sessionId}/submit`, {
        method: 'POST',
        csrfToken: session.csrfToken,
        body: submission,
      });
      assert.equal(result.status, 'completed');
      assert.deepEqual(await call(`/sessions/${assignment.sessionId}`), result);
      assert.equal((await call('/sessions')).sessions.length, 1);
      const abandoned = await call('/sessions', {
        method: 'POST',
        csrfToken: session.csrfToken,
        body: {},
      });
      await call(`/sessions/${abandoned.sessionId}/abandon`, {
        method: 'POST',
        csrfToken: session.csrfToken,
      });
      await call(`/sessions/${abandoned.sessionId}`);
      await call('/auth/logout', {
        method: 'POST',
        csrfToken: session.csrfToken,
      });
      await assert.rejects(call('/auth/me'), {
        status: 401,
        code: 'UNAUTHENTICATED',
      });
    } finally {
      await new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  }));

test('registration, single-use verification, CSRF, logout and reset revocation', async () => fixture(async ({ agent, inbox, database, emails, prefix }) => {
  const email = `${prefix}@example.test`; emails.push(email);
  await agent.post('/api/v1/auth/register').send({ email, password, role: 'ADMIN' }).expect(201);
  assert.equal((await database.user.findUnique({ where: { email } })).role, 'STUDENT');
  await agent.post('/api/v1/auth/login').send({ email, password }).expect(403);
  const token = emailToken(inbox.at(-1));
  await agent.post('/api/v1/auth/verify-email').send({ token }).expect(200);
  await agent.post('/api/v1/auth/verify-email').send({ token }).expect(400);
  const signedIn = await agent.post('/api/v1/auth/login').send({ email, password }).expect(200);
  const cookie = signedIn.headers['set-cookie'][0].split(';')[0];
  await agent.post('/api/v1/auth/logout').send({}).expect(403);
  await agent.post('/api/v1/auth/logout').set('X-CSRF-Token', signedIn.body.csrfToken).send({}).expect(200);
  await agent.get('/api/v1/auth/me').set('Cookie', cookie).expect(401);
  const relogin = await agent.post('/api/v1/auth/login').send({ email, password }).expect(200);
  const resetCookie = relogin.headers['set-cookie'][0].split(';')[0];
  await agent.post('/api/v1/auth/forgot-password').send({ email }).expect(200);
  await agent.post('/api/v1/auth/reset-password').send({ token: emailToken(inbox.at(-1)), password: 'ChangedPass123' }).expect(200);
  await agent.get('/api/v1/auth/me').set('Cookie', resetCookie).expect(401);
}));

test('profile, permissions, password change and account deletion', async () => fixture(async ({ agent, user, login, database, app }) => {
  const person = await user();
  let csrf = await login(person);
  await agent.patch('/api/v1/users/me').set('Origin', 'https://other.example').set('X-CSRF-Token', csrf).send({ name: 'No' }).expect(403);
  await agent.patch('/api/v1/users/me').set('X-CSRF-Token', csrf).send({ name: 'Learner', timezone: 'Africa/Cairo', preferences: { themePreference: 'dark' } }).expect(200);
  const updated = await agent.patch('/api/v1/users/me').set('X-CSRF-Token', csrf).send({ preferences: { uiLocale: 'ar' } }).expect(200);
  assert.deepEqual(updated.body.user.preferences, { themePreference: 'dark', uiLocale: 'ar' });
  await agent.get('/api/v1/admin/ping').expect(403);
  await agent.post('/api/v1/users/me/password').set('X-CSRF-Token', csrf).send({ currentPassword: password, newPassword: 'ChangedPass123', confirmPassword: 'ChangedPass123' }).expect(200);
  await agent.get('/api/v1/auth/me').expect(401);
  const fresh = await agent.post('/api/v1/auth/login').send({ email: person.email, password: 'ChangedPass123' }).expect(200);
  csrf = fresh.body.csrfToken;
  await agent.delete('/api/v1/users/me').set('X-CSRF-Token', csrf).send({ password: 'ChangedPass123' }).expect(200);
  assert.equal(await database.user.findUnique({ where: { id: person.id } }), null);
  const admin = await user('ADMIN');
  const adminClient = request.agent(app);
  const adminCsrf = await login(admin, adminClient);
  await adminClient.get('/api/v1/admin/ping').expect(200);
  const otherAdmins = await database.user.count({ where: { role: 'ADMIN', isActive: true, id: { not: admin.id } } });
  if (otherAdmins === 0) await adminClient.delete('/api/v1/users/me').set('X-CSRF-Token', adminCsrf).send({ password }).expect(400);
  await database.user.update({ where: { id: admin.id }, data: { isActive: false } });
  await adminClient.get('/api/v1/auth/me').expect(401);
}));

test('owned practice, atomic retries/concurrency, dashboard and progress', async () => fixture(async ({ agent, user, login, database, app, advance }) => {
  const person = await user();
  const csrf = await login(person);
  const path = await agent.get('/api/v1/path').expect(200);
  assert.equal(path.body.groups.length, 4);
  const assignments = [];
  for (let index = 0; index < 2; index++) assignments.push((await agent.post('/api/v1/sessions').set('X-CSRF-Token', csrf).send({ mode: 'practice' }).expect(201)).body);
  const payload = assignment => ({ events: [...assignment.text].map((char, seq) => ({ seq, type: 'insert', char, t: seq * 200 })), finishTimeMs: (assignment.text.length - 1) * 200 });
  const stranger = await user();
  const strangerAgent = request.agent(app);
  const strangerCsrf = await login(stranger, strangerAgent);
  await strangerAgent.post(`/api/v1/sessions/${assignments[0].sessionId}/submit`).set('X-CSRF-Token', strangerCsrf).send(payload(assignments[0])).expect(404);
  advance(60000);
  const service = createSessionService({ database, now: () => new Date(Date.now() + 60000) });
  const results = await Promise.all(assignments.map(async assignment => ({ body: await service.submit(person.id, assignment.sessionId, payload(assignment)) })));
  const replay = await agent.post(`/api/v1/sessions/${assignments[0].sessionId}/submit`).set('X-CSRF-Token', csrf).send(payload(assignments[0])).expect(200);
  assert.deepEqual(replay.body, results[0].body);
  const conflict = payload(assignments[0]); conflict.events[1].char = 'x';
  await agent.post(`/api/v1/sessions/${assignments[0].sessionId}/submit`).set('X-CSRF-Token', csrf).send(conflict).expect(409);
  const saved = await database.user.findUnique({ where: { id: person.id } });
  assert.equal(saved.xp, results.reduce((sum, result) => sum + result.body.xpEarned, 0));
  assert.equal(saved.streak, 1);
  assert.equal(await database.keystrokeLog.count({ where: { session: { userId: person.id } } }), 2);
  await database.keystrokeLog.updateMany({ where: { sessionId: assignments[0].sessionId }, data: { expiresAt: new Date(0) } });
  await purgeKeystrokeLogs(database);
  const afterPurge = await agent.post(`/api/v1/sessions/${assignments[0].sessionId}/submit`).set('X-CSRF-Token', csrf).send(payload(assignments[0])).expect(200);
  assert.deepEqual(afterPurge.body, results[0].body);
  const dashboard = await agent.get('/api/v1/dashboard').expect(200);
  assert.equal(dashboard.body.recentSessions.length, 2);
  await agent.get('/api/v1/progress').expect(200);
  const abandoned = (await agent.post('/api/v1/sessions').set('X-CSRF-Token', csrf).send({}).expect(201)).body;
  await agent.post(`/api/v1/sessions/${abandoned.sessionId}/abandon`).set('X-CSRF-Token', csrf).send({}).expect(200);
  await agent.post(`/api/v1/sessions/${abandoned.sessionId}/submit`).set('X-CSRF-Token', csrf).send(payload(abandoned)).expect(409);
  await agent.delete('/api/v1/users/me').set('X-CSRF-Token', csrf).send({ password }).expect(200);
  assert.equal(await database.typingSession.count({ where: { userId: person.id } }), 0);
}));

test('mastery needs separate evidence across sessions and unlocks prerequisite groups', async () => fixture(async ({ database, user }) => {
  const person = await user();
  const settings = (await database.settingVersion.findUnique({ where: { id: 'teammate-migration-v1' } })).values;
  const rules = { ...settings, targetWpm: 40, passed: true };
  const stats = Object.fromEntries([...'asdfjkl;'].map(key => [key, { attempts: 40, errors: 0, totalMs: 4000, timed: 40 }]));
  await database.$transaction(async tx => {
    await ensureKeyProgress(tx, person.id);
    const first = await updateKeyProgress(tx, person.id, stats, rules, new Date());
    assert.deepEqual(first.mastered, []);
    assert.deepEqual(first.unlocked, []);
  });
  await database.$transaction(async tx => {
    const second = await updateKeyProgress(tx, person.id, stats, rules, new Date());
    assert.equal(second.mastered.length, 8);
    assert.deepEqual(second.unlocked.sort(), ['g', 'h']);
    const top = await tx.keyStat.findUnique({ where: { userId_key: { userId: person.id, key: 'q' } } });
    assert.equal(top.status, 'locked');
  });
}));
