// Verify that public development credentials cannot be seeded into other environments.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  developmentAdmin,
  seedDevelopmentAdmin,
} from '../../prisma/seed.js';
import { registerSchema } from '@typeflow/shared';

test('default Admin seed refuses non-development and non-local development targets before database access', async () => {
  // Any accidental database access fails this check, including reads before the guard.
  const database = new Proxy({}, {
    get() {
      assert.fail('A rejected seed must not access the database');
    },
  });
  const localUrl = 'postgresql://example:example@localhost:5432/typeflow_dev';

  for (const mode of ['production', 'test', undefined]) {
    await assert.rejects(seedDevelopmentAdmin(database, {
      NODE_ENV: mode,
      DATABASE_URL: localUrl,
    }), /requires development mode/);
  }

  for (const databaseUrl of [
    'postgresql://example:example@remote.example/typeflow_dev',
    'postgresql://example:example@localhost/typeflow_test',
    'postgresql://example:example@localhost/another_database',
  ]) {
    await assert.rejects(seedDevelopmentAdmin(database, {
      NODE_ENV: 'development',
      DATABASE_URL: databaseUrl,
    }), /requires a loopback PostgreSQL database named typeflow_dev/);
  }

  assert.equal(registerSchema.safeParse(developmentAdmin).success, true);
});
