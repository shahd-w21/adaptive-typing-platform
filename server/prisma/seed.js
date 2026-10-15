import { loadEnvironment } from '../src/config/env.js';
import { createDatabase } from '../src/db/prisma.js';
import { assertLocalDatabase } from '../../scripts/database-target.js';
import { seedStarter } from '../src/modules/settings/starter.js';

const config = loadEnvironment();
assertLocalDatabase(config.DATABASE_URL, process.env.NODE_ENV === 'test' ? 'typeflow_test' : 'typeflow_dev');
const database = createDatabase(config.DATABASE_URL);
try {
  await seedStarter(database);
  console.log('Migrated starter key groups and versioned prototype policy are available; no accounts were created or replaced.');
} finally { await database.$disconnect(); }
