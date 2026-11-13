import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { createCertificateService } from './service.js';

export function certificateRoutes(deps) {
  const router = Router();
  const service = createCertificateService(deps);
  const verifyLimit = rateLimit({
    windowMs: 15 * 60000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED' } },
  });

  router.get('/verify/:code', verifyLimit, async (req, res) => {
    res.json(await service.verify(req.params.code));
  });

  return router;
}
// Placeholder only: no implementation or runtime wiring.
