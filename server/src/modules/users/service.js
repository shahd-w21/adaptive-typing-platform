import bcrypt from 'bcrypt';
import { HttpError } from '../../middleware/validate.js';
import { transaction } from '../../db/transaction.js';
import { publicUser } from './dto.js';

export function createUserService({ database, now = () => new Date() }) {
  return {
    async update(userId, { preferences, ...fields }) {
      return publicUser(await database.user.update({ where: { id: userId }, data: { ...fields, ...preferences } }));
    },
    async changePassword(user, input) {
      if (!await bcrypt.compare(input.currentPassword, user.passwordHash)) throw new HttpError(400, 'INVALID_PASSWORD', 'Current password is incorrect');
      const passwordHash = await bcrypt.hash(input.newPassword, 10);
      await transaction(database, async tx => {
        const changed = await tx.user.updateMany({ where: { id: user.id, passwordHash: user.passwordHash }, data: { passwordHash } });
        if (changed.count !== 1) throw new HttpError(409, 'ACCOUNT_CHANGED', 'Please sign in again');
        await tx.authSession.updateMany({ where: { userId: user.id }, data: { revokedAt: now() } });
        await tx.emailToken.deleteMany({ where: { userId: user.id, purpose: 'reset' } });
      });
      return { message: 'Password updated. Please sign in again.' };
    },
    async remove(user, { password }) {
      if (!await bcrypt.compare(password, user.passwordHash)) throw new HttpError(400, 'INVALID_PASSWORD', 'Password is incorrect');
      await transaction(database, async tx => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(721605)`;
        const current = await tx.user.findUnique({ where: { id: user.id } });
        if (!current || current.passwordHash !== user.passwordHash) throw new HttpError(409, 'ACCOUNT_CHANGED', 'Please sign in again');
        if (current.role === 'ADMIN' && await tx.user.count({ where: { role: 'ADMIN', isActive: true, id: { not: user.id } } }) === 0) {
          throw new HttpError(400, 'LAST_ADMIN', 'Create another active admin before deleting this account');
        }
        await tx.user.delete({ where: { id: user.id } });
      });
      return { message: 'Account and personal data deleted' };
    },
  };
}
