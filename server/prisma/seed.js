// Seed starter content and a synthetic Admin for local development without replacing users.
import bcrypt from 'bcrypt';
import { loadEnvironment } from '../src/config/env.js';
import { createDatabase } from '../src/db/prisma.js';
import { assertLocalDatabase } from '../../scripts/database-target.js';
import { seedStarter } from '../src/modules/settings/starter.js';

// Public, synthetic development credentials; never provision this account in production.
export const developmentAdmin = Object.freeze({
  email: 'admin@typeflow.local',
  password: 'TypeFlow!',
});

/**
 * Create an active, verified local Admin when its email is unused. Concurrent or
 * repeated seeds preserve existing passwords, roles, verification and activation.
 * A conflicting existing account is reported, never promoted or reset silently.
 */
export async function seedDevelopmentAdmin(database, config) {
  if (config.NODE_ENV !== 'development') {
    throw new Error('Default Admin seeding requires development mode');
  }
  assertLocalDatabase(config.DATABASE_URL, 'typeflow_dev');

  const passwordHash = await bcrypt.hash(developmentAdmin.password, 10);
  // PostgreSQL handles the unique-email conflict without modifying the existing row.
  const result = await database.user.createMany({
    data: [{
      email: developmentAdmin.email,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
      emailVerifiedAt: new Date(),
      name: 'Local Admin',
      timezone: 'Africa/Cairo',
    }],
    skipDuplicates: true,
  });
  return { created: result.count === 1 };
}

/** Seed only the documented local database; test content seeds omit the default Admin. */
async function main() {
  const config = loadEnvironment();
  if (config.NODE_ENV === 'production') {
    throw new Error('Local database seeds cannot run in production');
  }
  assertLocalDatabase(config.DATABASE_URL, config.NODE_ENV === 'test' ? 'typeflow_test' : 'typeflow_dev');

  const database = createDatabase(config.DATABASE_URL);
  try {
    await seedStarter(database);
    console.log('Starter key groups and versioned prototype policy are available.');

    if (config.NODE_ENV === 'development') {
      const { created } = await seedDevelopmentAdmin(database, config);
      console.log(created
        ? `Created verified local Admin: ${developmentAdmin.email}`
        : `Kept existing account unchanged: ${developmentAdmin.email}`);
    }
  } finally {
    await database.$disconnect();
  }
}

if (import.meta.main) {
  await main();
}
