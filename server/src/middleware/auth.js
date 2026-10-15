import jwt from 'jsonwebtoken';
import { idSchema } from '@typeflow/shared';
import { HttpError } from './validate.js';
import { cookieOptions, csrfToken, matchesToken } from '../modules/auth/tokens.js';

export function createAuthMiddleware({ database, config, now = () => new Date() }) {
  return async (request, response, next) => {
    try {
      let payload;
      try { payload = jwt.verify(request.cookies?.token ?? '', config.JWT_SECRET, { algorithms: ['HS256'], issuer: 'typeflow', audience: 'typeflow-client' }); }
      catch { throw new HttpError(401, 'UNAUTHENTICATED', 'Invalid or expired session'); }
      if (!idSchema.safeParse(payload.jti).success || !idSchema.safeParse(payload.sub).success) throw new HttpError(401, 'UNAUTHENTICATED', 'Invalid session');
      const session = await database.authSession.findUnique({ where: { id: payload.jti }, include: { user: true } });
      if (!session || session.userId !== payload.sub || session.revokedAt || session.expiresAt <= now() || !session.user.isActive || !session.user.emailVerifiedAt) {
        response.clearCookie('token', cookieOptions(config));
        throw new HttpError(401, 'UNAUTHENTICATED', 'Not logged in');
      }
      request.user = session.user;
      request.authSessionId = session.id;
      next();
    } catch (error) { next(error); }
  };
}
export const requireRole = role => (request, _response, next) => request.user.role === role ? next() : next(new HttpError(403, 'FORBIDDEN', 'Insufficient role'));
export function csrf(config) {
  return (request, _response, next) => {
    if (!matchesToken(request.get('X-CSRF-Token'), csrfToken(request.authSessionId, config.JWT_SECRET))) return next(new HttpError(403, 'CSRF_FAILED', 'Invalid CSRF token'));
    next();
  };
}
