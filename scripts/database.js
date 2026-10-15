import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import dotenv from 'dotenv';
import { assertLocalDatabase } from './database-target.js';

const require = createRequire(new URL('../server/package.json', import.meta.url));
const root = fileURLToPath(new URL('../', import.meta.url));
const server = fileURLToPath(new URL('../server/', import.meta.url));
dotenv.config({ path: fileURLToPath(new URL('../server/.env', import.meta.url)), quiet: true });
const [operation, ...extra] = process.argv.slice(2);
const commands = { migrate: ['migrate', 'deploy'], create: ['migrate', 'dev'], studio: ['studio'], test: ['migrate', 'deploy'], seed: [] };
if (!Object.hasOwn(commands, operation)) throw new Error('Expected migrate, create, studio, test or seed');
if (process.env.NODE_ENV === 'production') throw new Error('Local database commands cannot run in production');
if (extra.length && !(operation === 'create' && extra.length === 2 && extra[0] === '--name' && /^[a-z0-9_-]+$/i.test(extra[1]))) {
  throw new Error('Only migration:create accepts arguments: --name short-description');
}
const connectionString = assertLocalDatabase(
  operation === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL,
  operation === 'test' ? 'typeflow_test' : 'typeflow_dev',
);
const env = { ...process.env, DATABASE_URL: connectionString };
if (operation === 'test') env.NODE_ENV = 'test';
function run(args, cwd) {
  const result = spawnSync(process.execPath, args, { cwd, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
if (operation === 'seed') run(['prisma/seed.js'], server);
else run([require.resolve('prisma/build/index.js'), ...commands[operation], '--config', 'prisma.config.mjs', ...extra], server);
if (operation === 'test') run(['--test', 'server/tests/integration/database.test.js', 'server/tests/integration/features.test.js'], root);
