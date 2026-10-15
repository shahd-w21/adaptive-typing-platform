import express from 'express';
import cors from 'cors';
import { healthResponseSchema } from '@typeflow/shared';

export function createApp({ database, clientUrl }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: clientUrl, credentials: true }));
  app.use(express.json({ limit: '64kb' }));
  app.get('/health/live', (_request, response) => {
    response.json(healthResponseSchema.parse({ status: 'ok' }));
  });
  app.get('/health/ready', async (_request, response) => {
    try {
      await database.$queryRaw`SELECT 1`;
      response.json(healthResponseSchema.parse({ status: 'ready' }));
    } catch {
      response.status(503).json(healthResponseSchema.parse({ status: 'unavailable' }));
    }
  });
  // Feature routes will mount beneath /api/v1 as their contracts are implemented.
  app.use((_request, response) => response.status(404).json({ error: { code: 'NOT_FOUND' } }));
  app.use((error, _request, response, _next) => {
    const status = error.type === 'entity.too.large' ? 413 : error.type === 'entity.parse.failed' ? 400 : 500;
    response.status(status).json({ error: { code: status === 500 ? 'INTERNAL_ERROR' : 'INVALID_REQUEST' } });
  });
  return app;
}
