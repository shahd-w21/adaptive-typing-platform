import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

export function checkPort(port, label) {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', error => reject(new Error(
      `${label} port ${port} is unavailable (${error.code}). Stop the existing development terminal with Ctrl+C, or identify its owner before restarting. No process was stopped.`,
    )));
    probe.listen(port, '127.0.0.1', () => probe.close(resolve));
  });
}

if (import.meta.main) {
  dotenv.config({ path: fileURLToPath(new URL('../server/.env', import.meta.url)), quiet: true });
  const port = Number(process.env.PORT ?? 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535 || port === 5173) {
    console.error('Server PORT must be between 1 and 65535 and different from client port 5173.');
    process.exitCode = 1;
  } else {
    const checks = await Promise.allSettled([checkPort(5173, 'Client'), checkPort(port, 'Server')]);
    for (const check of checks) {
      if (check.status === 'rejected') {
        console.error(check.reason.message);
        process.exitCode = 1;
      }
    }
  }
}
