import { rateLimit } from 'express-rate-limit';

export function authLimiter() {
  return rateLimit({ windowMs: 15 * 60000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' } } });
}
