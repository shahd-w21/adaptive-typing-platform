import { Router } from 'express';
import { authLimiter } from '../../middleware/rateLimit.js';
import { registerSchema, loginSchema, emailSchema, tokenSchema, resetPasswordSchema } from '@typeflow/shared';
import { parse } from '../../middleware/validate.js';
import { csrf, createAuthMiddleware } from '../../middleware/auth.js';
import { createAuthService } from './service.js';
import { cookieOptions, csrfToken } from './tokens.js';
import { publicUser } from '../users/dto.js';

export function authRoutes(deps) {
  const router = Router();
  const service = createAuthService(deps);
  const authenticate = createAuthMiddleware(deps);
  const limit = authLimiter();
  router.post(['/register', '/signup'], limit, async (req, res) => res.status(201).json(await service.register(parse(registerSchema, req.body))));
  router.post('/verify-email', limit, async (req, res) => res.json(await service.verify(parse(tokenSchema, req.body))));
  router.post('/resend-verification', limit, async (req, res) => res.json(await service.resend(parse(emailSchema, req.body))));
  router.post('/login', limit, async (req, res) => {
    const { token, ...body } = await service.login(parse(loginSchema, req.body));
    res.cookie('token', token, { ...cookieOptions(deps.config), maxAge: 7 * 86400000 }).json(body);
  });
  router.get('/me', authenticate, (req, res) => res.json({ user: publicUser(req.user), csrfToken: csrfToken(req.authSessionId, deps.config.JWT_SECRET) }));
  router.post('/logout', authenticate, csrf(deps.config), async (req, res) => {
    const result = await service.logout(req.authSessionId);
    res.clearCookie('token', cookieOptions(deps.config)).json(result);
  });
  router.post('/forgot-password', limit, async (req, res) => res.json(await service.forgot(parse(emailSchema, req.body))));
  router.post('/reset-password', limit, async (req, res) => res.json(await service.reset(parse(resetPasswordSchema, req.body))));
  return router;
}
