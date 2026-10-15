import { Router } from 'express';
import { profileSchema, changePasswordSchema, deleteAccountSchema } from '@typeflow/shared';
import { createAuthMiddleware, csrf } from '../../middleware/auth.js';
import { parse } from '../../middleware/validate.js';
import { createUserService } from './service.js';
import { publicUser } from './dto.js';
import { cookieOptions } from '../auth/tokens.js';
import { authLimiter } from '../../middleware/rateLimit.js';

export function userRoutes(deps) {
  const { config } = deps;
  const service = createUserService(deps);
  const router = Router();
  router.use(createAuthMiddleware(deps));
  router.get('/me', (req, res) => res.json({ user: publicUser(req.user) }));
  router.use(csrf(config));
  router.patch('/me', async (req, res) => {
    res.json({ user: await service.update(req.user.id, parse(profileSchema, req.body)) });
  });
  const limit = authLimiter();
  router.post('/me/password', limit, async (req, res) => {
    const result = await service.changePassword(req.user, parse(changePasswordSchema, req.body));
    res.clearCookie('token', cookieOptions(config)).json(result);
  });
  router.delete('/me', limit, async (req, res) => {
    const result = await service.remove(req.user, parse(deleteAccountSchema, req.body));
    res.clearCookie('token', cookieOptions(config)).json(result);
  });
  return router;
}
