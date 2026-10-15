import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { healthResponseSchema } from '@typeflow/shared';
import { createRoutes } from './routes.js';
import { createMailer } from './integrations/mailer/index.js';
import { HttpError } from './middleware/validate.js';

export function createApp({ database, clientUrl, config = {}, sendMail, now, random }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: clientUrl, credentials: true }));
  app.use(express.json({ limit: '512kb' }));
  app.use(cookieParser());
  app.use((request, _response, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && request.get('Origin') && request.get('Origin') !== clientUrl) {
      return next(new HttpError(403, 'ORIGIN_FORBIDDEN', 'Request origin is not allowed'));
    }
    next();
  });
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
  app.use('/api/v1', (_request, response, next) => { response.set('Cache-Control', 'no-store'); next(); }, createRoutes({ database, config: { ...config, CLIENT_URL: clientUrl },
    sendMail: sendMail ?? createMailer(config), now, random }));
  app.use((_request, response) => response.status(404).json({ error: { code: 'NOT_FOUND' } }));
  app.use((error, _request, response, _next) => {
    if (error instanceof HttpError) return response.status(error.status).json({ error: { code: error.code, message: error.message } });
    const status = error.type === 'entity.too.large' ? 413 : error.type === 'entity.parse.failed' ? 400 : 500;
    response.status(status).json({ error: { code: status === 500 ? 'INTERNAL_ERROR' : 'INVALID_REQUEST' } });
  });
  return app;
}
