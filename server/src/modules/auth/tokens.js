import { randomBytes, createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const generateToken = () => randomBytes(32).toString('hex');
export const hashToken = token => createHash('sha256').update(token).digest('hex');
export const csrfToken = (sessionId, secret) => createHmac('sha256', secret).update(`csrf:${sessionId}`).digest('hex');
export function matchesToken(received, expected) {
  if (typeof received !== 'string' || !/^[a-f0-9]{64}$/.test(received)) return false;
  return timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}
export const cookieOptions = config => ({ httpOnly: true, sameSite: 'lax', secure: config.NODE_ENV === 'production', path: '/' });
