import { Router } from 'express';
import { authRoutes } from './modules/auth/routes.js';
import { userRoutes } from './modules/users/routes.js';
import { sessionRoutes } from './modules/sessions/routes.js';
import { createAuthMiddleware, requireRole } from './middleware/auth.js';
import { createPathService } from './modules/path/service.js';

export function createRoutes(deps) {
  const router = Router();
  router.use('/auth', authRoutes(deps));
  router.use('/users', userRoutes(deps));
  router.use('/sessions', sessionRoutes(deps));
  const authenticate = createAuthMiddleware(deps);
  const path = createPathService(deps);
  for (const endpoint of ['/path', '/path/keyboard', '/dashboard', '/progress', '/gamification']) {
    router.get(endpoint, authenticate, requireRole('STUDENT'), async (req, res) => {
      const data = await path(req.user);
      if (endpoint === '/progress') return res.json({ sessions: data.sessions, keys: data.keys });
      if (endpoint === '/path' || endpoint === '/path/keyboard') return res.json({ groups: data.groups, keys: data.keys, recommendation: data.recommendation });
      if (endpoint === '/gamification') return res.json({ xp: data.user.xp, level: data.user.level, streak: data.streak, dailyGoal: data.dailyGoal });
      res.json({ user: data.user, streak: data.streak, dailyGoal: data.dailyGoal, recommendation: data.recommendation, recentSessions: data.recentSessions });
    });
  }
  router.get('/admin/ping', authenticate, requireRole('ADMIN'), (_req, res) => res.json({ message: 'Welcome, admin' }));
  return router;
}
