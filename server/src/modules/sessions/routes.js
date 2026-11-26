import { Router } from 'express';
import { idSchema, startSessionSchema, submissionSchema } from '@typeflow/shared';
import { parse } from '../../middleware/validate.js';
import { createAuthMiddleware, requireRole, csrf } from '../../middleware/auth.js';
import { createSessionService } from './service.js';

export function sessionRoutes(deps) {
  const router = Router();
  const service = createSessionService(deps);
  router.use(createAuthMiddleware(deps), requireRole('STUDENT'));
  router.get('/', async (req, res) => {
    const sessions = await deps.database.typingSession.findMany({ where: { userId: req.user.id }, orderBy: { startedAt: 'desc' }, take: 100,
      select: { id: true, mode: true, status: true, netWpm: true, rawAccuracy: true, completedAt: true } });
    res.json({ sessions });
  });
  router.get('/:id', async (req, res) => res.json(await service.get(req.user.id, parse(idSchema, req.params.id))));
  router.use(csrf(deps.config));
  router.post(['/', '/start'], async (req, res) => {
    parse(startSessionSchema, req.body ?? {});
    res.status(201).json(await service.start(req.user));
  });
  router.post('/:id/submit', async (req, res) => res.json(await service.submit(req.user.id, parse(idSchema, req.params.id), parse(submissionSchema, req.body))));
  router.post('/:id/abandon', async (req, res) => res.json(await service.abandon(req.user.id, parse(idSchema, req.params.id))));
  return router;
}
