// Own the isolated Vite server in-process so Windows teardown does not orphan npm children.
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

/** Start one strict test origin and close it after Playwright finishes, including failures. */
export default async function setup() {
  const server = await createServer({
    root: fileURLToPath(new URL('../../', import.meta.url)),
    logLevel: 'error',
    server: {
      host: '127.0.0.1',
      port: 5174,
      strictPort: true,
    },
  });
  await server.listen();
  return async () => {
    await server.close();
  };
}
