import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { parseEnvironment } from '../../src/config/env.js';
import { assertLocalDatabase } from '../../../scripts/database-target.js';

const clientUrl = 'http://localhost:5173';
test('liveness stays healthy during a database outage; readiness hides the error', async () => {
  const app = createApp({ clientUrl, database: { $queryRaw: async () => { throw new Error('private connection credentials'); } } });
  assert.deepEqual((await request(app).get('/health/live').expect(200)).body, { status: 'ok' });
  assert.deepEqual((await request(app).get('/health/ready').expect(503)).body, { status: 'unavailable' });
});
test('readiness executes the database probe and permits the configured browser origin', async () => {
  let queried = false;
  const app = createApp({ clientUrl, database: { $queryRaw: async () => { queried = true; } } });
  await request(app).get('/health/ready').set('Origin', clientUrl)
    .expect('Access-Control-Allow-Origin', clientUrl).expect('Access-Control-Allow-Credentials', 'true').expect(200);
  assert.equal(queried, true);
});
test('unknown routes and malformed JSON return bounded errors', async () => {
  const app = createApp({ clientUrl, database: {} });
  await request(app).get('/api/v1/not-built').expect(404);
  const result = await request(app).post('/api/v1/not-built').set('Content-Type', 'application/json').send('{bad secret').expect(400);
  assert.deepEqual(result.body, { error: { code: 'INVALID_REQUEST' } });
});
test('invalid configuration names fields without leaking values', () => {
  assert.throws(() => parseEnvironment({ DATABASE_URL: 'secret', CLIENT_URL: 'secret', PORT: 0 }), error =>
    /DATABASE_URL/.test(error.message) && /PORT/.test(error.message) && !/secret/.test(error.message));
});
test('configuration accepts supported URLs and rejects invalid protocols', () => {
  const valid = { DATABASE_URL: 'postgresql://localhost/typeflow_dev', CLIENT_URL: clientUrl, JWT_SECRET: 'test-only-secret-with-at-least-32-characters' };
  assert.equal(parseEnvironment(valid).PORT, 5000);
  assert.equal(parseEnvironment(valid).NODE_ENV, 'development');
  for (const value of ['not-a-url', 'file:///secret', 'https://example.com/database']) {
    assert.throws(() => parseEnvironment({ ...valid, DATABASE_URL: value }), {
      message: 'Invalid environment: DATABASE_URL',
    });
  }
  assert.throws(() => parseEnvironment({ ...valid, CLIENT_URL: 'file:///secret' }), {
    message: 'Invalid environment: CLIENT_URL',
  });
});
test('test database guard refuses development, remote and malformed targets', () => {
  for (const url of ['postgresql://localhost/typeflow_dev', 'postgresql://remote/typeflow_test', 'bad', 'https://localhost/typeflow_test']) {
    assert.throws(() => assertLocalDatabase(url, 'typeflow_test'));
  }
  assert.equal(assertLocalDatabase('postgresql://localhost/typeflow_test', 'typeflow_test'), 'postgresql://localhost/typeflow_test');
});
