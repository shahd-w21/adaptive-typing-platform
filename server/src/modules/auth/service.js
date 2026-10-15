import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { HttpError } from '../../middleware/validate.js';
import { transaction } from '../../db/transaction.js';
import { generateToken, hashToken, csrfToken } from './tokens.js';
import { publicUser } from '../users/dto.js';

const DAY = 86400000;
const invalidLink = () => new HttpError(400, 'INVALID_TOKEN', 'Invalid or expired link');
const invalidCredentials = () => new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');

export function createAuthService({ database, config, sendMail, now = () => new Date() }) {
  async function emailLink(user, purpose) {
    const token = generateToken();
    const reset = purpose === 'reset';
    await transaction(database, async tx => {
      await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${user.id}::uuid FOR UPDATE`;
      await tx.emailToken.deleteMany({ where: { userId: user.id, purpose } });
      await tx.emailToken.create({ data: { userId: user.id, purpose, hash: hashToken(token), expiresAt: new Date(now().getTime() + (reset ? 3600000 : DAY)) } });
    });
    const url = new URL(reset ? '/reset-password' : '/verify-email', config.CLIENT_URL);
    url.searchParams.set('token', token);
    try {
      await sendMail({ to: user.email, subject: reset ? 'Reset your TypeFlow password' : 'Verify your TypeFlow email', text: `${reset ? 'Reset your password (valid for 1 hour)' : 'Verify your email (valid for 24 hours)'}:\n${url}` });
    } catch { throw new HttpError(503, 'EMAIL_UNAVAILABLE', 'Email delivery is temporarily unavailable; retry the email request'); }
  }
  async function consumeToken(token, purpose, apply) {
    return transaction(database, async tx => {
      const found = await tx.emailToken.findUnique({ where: { hash: hashToken(token) } });
      if (!found || found.purpose !== purpose || found.expiresAt <= now()) throw invalidLink();
      const used = await tx.emailToken.deleteMany({ where: { hash: found.hash, expiresAt: { gt: now() } } });
      if (used.count !== 1) throw invalidLink();
      return apply(tx, found.userId);
    });
  }
  return {
    async register({ email, password }) {
      const passwordHash = await bcrypt.hash(password, 10);
      let user;
      try { user = await database.user.create({ data: { email, passwordHash, role: 'STUDENT' } }); }
      catch (error) { if (error.code === 'P2002') throw new HttpError(409, 'EMAIL_REGISTERED', 'Email already registered'); throw error; }
      await emailLink(user, 'verify');
      return { message: 'Check your email to verify your account' };
    },
    async verify({ token }) {
      await consumeToken(token, 'verify', (tx, userId) => tx.user.update({ where: { id: userId }, data: { emailVerifiedAt: now() } }));
      return { message: 'Email verified. You can now log in.' };
    },
    async resend({ email }) {
      const user = await database.user.findUnique({ where: { email } });
      if (user?.isActive && !user.emailVerifiedAt) await emailLink(user, 'verify');
      return { message: 'If the account exists, a new email was sent' };
    },
    async login({ email, password }) {
      const found = await database.user.findUnique({ where: { email } });
      if (!found || !await bcrypt.compare(password, found.passwordHash)) throw invalidCredentials();
      return transaction(database, async tx => {
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${found.id}::uuid FOR UPDATE`;
        const user = await tx.user.findUnique({ where: { id: found.id } });
        if (!user || user.passwordHash !== found.passwordHash) throw invalidCredentials();
        if (!user.isActive) throw new HttpError(403, 'ACCOUNT_INACTIVE', 'This account is deactivated');
        if (!user.emailVerifiedAt) throw new HttpError(403, 'EMAIL_NOT_VERIFIED', 'Please verify your email first');
        const expiresAt = new Date(now().getTime() + 7 * DAY);
        const session = await tx.authSession.create({ data: { userId: user.id, expiresAt } });
        const token = jwt.sign({ sub: user.id }, config.JWT_SECRET, { jwtid: session.id, expiresIn: '7d', algorithm: 'HS256', issuer: 'typeflow', audience: 'typeflow-client' });
        return { token, user: publicUser(user), csrfToken: csrfToken(session.id, config.JWT_SECRET) };
      });
    },
    async logout(sessionId) {
      await database.authSession.updateMany({ where: { id: sessionId }, data: { revokedAt: now() } });
      return { message: 'Logged out' };
    },
    async forgot({ email }) {
      const user = await database.user.findUnique({ where: { email } });
      if (user?.isActive) await emailLink(user, 'reset');
      return { message: 'If the account exists, a reset email was sent' };
    },
    async reset({ token, password }) {
      const passwordHash = await bcrypt.hash(password, 10);
      await consumeToken(token, 'reset', async (tx, userId) => {
        await tx.user.update({ where: { id: userId }, data: { passwordHash } });
        await tx.authSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: now() } });
      });
      return { message: 'Password updated. You can now log in.' };
    },
  };
}
