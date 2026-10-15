import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createDatabase } from '../../src/db/prisma.js';
import { createApp } from '../../src/app.js';
import { assertLocalDatabase } from '../../../scripts/database-target.js';

test('dedicated test database has migrations and the API can query it', async () => {
  const url = assertLocalDatabase(process.env.DATABASE_URL, 'typeflow_test');
  const database = createDatabase(url);
  try {
    const [identity] = await database.$queryRaw`SELECT current_database() AS name`;
    assert.equal(identity.name, 'typeflow_test');
    assert.equal(typeof await database.user.count(), 'number');
    const app = createApp({ database, clientUrl: 'http://localhost:5173' });
    await request(app).get('/health/ready').expect(200, { status: 'ready' });
  } finally {
    await database.$disconnect();
  }
});
