import { loadEnvironment } from './config/env.js';
import { createDatabase } from './db/prisma.js';
import { createApp } from './app.js';
import { startLogRetention } from './jobs/purgeKeystrokeLogs.js';

const env = loadEnvironment();
const database = createDatabase(env.DATABASE_URL);
const stopRetention = startLogRetention(database);
const server = createApp({ database, clientUrl: env.CLIENT_URL, config: env }).listen(env.PORT, '127.0.0.1', () => {
  console.log(`TypeFlow API listening at http://localhost:${env.PORT}`);
});
server.on('error', async error => {
  stopRetention();
  console.error(`Server failed to listen: ${error.code ?? 'UNKNOWN'}`);
  await database.$disconnect();
  process.exitCode = 1;
});
let closing = false;
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (closing) return;
    closing = true;
    stopRetention();
    const timeout = setTimeout(() => process.exit(1), 10000);
    timeout.unref();
    server.close(async () => {
      await database.$disconnect();
      clearTimeout(timeout);
    });
  });
}
