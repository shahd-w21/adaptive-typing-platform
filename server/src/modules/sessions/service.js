import { createHash } from 'node:crypto';
import { z } from 'zod';
import { HttpError } from '../../middleware/validate.js';
import { transaction } from '../../db/transaction.js';
import { ensureKeyProgress, updateKeyProgress } from '../stats/service.js';
import { generatePracticeText, keyWeight } from '../generation/fallbackGenerator.js';
import { replay } from '../scoring/replay.js';
import { rewards } from '../gamification/rules.js';

const policySchema = z.object({
  accuracyGate: z.number().min(0).max(100), alpha: z.number().min(0).max(1),
  masteryAccuracy: z.number().min(0).max(100), masteryAttempts: z.number().int().positive(),
  masteryLatencySamples: z.number().int().positive(), masterySessions: z.number().int().positive(),
  latencyCutoffMs: z.number().positive(), maxKeystrokes: z.number().int().positive(),
  maxWpm: z.number().positive(), clockToleranceMs: z.number().nonnegative(),
  minimumRewardMs: z.number().nonnegative(), xpPerLevel: z.number().int().positive(),
  xpFormula: z.literal('floor(finalCorrect * rawAccuracy / 100)'),
  logRetentionDays: z.number().int().positive(), sessionExpiryMs: z.number().positive(),
});

export function createSessionService({ database, now = () => new Date(), random = Math.random }) {
  return {
    async start(user) {
      const settings = await database.settingVersion.findUnique({ where: { id: 'teammate-migration-v1' } });
      const parsed = policySchema.safeParse(settings?.values);
      if (!parsed.success) throw new HttpError(503, 'CONTENT_NOT_READY', 'Run the development seed or review the practice policy');
      const rules = { ...parsed.data, targetWpm: user.targetWpm, timezone: user.timezone };
      const keys = await transaction(database, async tx => {
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${user.id}::uuid FOR UPDATE`;
        await ensureKeyProgress(tx, user.id);
        return tx.keyStat.findMany({ where: { userId: user.id, status: { in: ['in_progress', 'mastered'] } }, orderBy: { key: 'asc' } });
      });
      if (!keys.length) throw new HttpError(503, 'CONTENT_NOT_READY', 'No unlocked curriculum is available');
      const text = generatePracticeText(keys.map(row => ({ key: row.key, weight: keyWeight(row, rules.targetWpm) })), random);
      const startedAt = now();
      const session = await database.typingSession.create({ data: { userId: user.id, text, rules, settingsId: settings.id, startedAt,
        expiresAt: new Date(startedAt.getTime() + rules.sessionExpiryMs) } });
      return { sessionId: session.id, mode: session.mode, text, source: session.source, issuedAt: session.startedAt, expiresAt: session.expiresAt,
        rules: { pauseAllowed: true, eventVersion: 1, settingsVersion: settings.id, targetWpm: rules.targetWpm } };
    },
    async submit(userId, sessionId, input) {
      const canonical = { events: input.events.map(event => ({ seq: event.seq, type: event.type, t: event.t,
        ...(event.type === 'insert' ? { char: event.char } : {}) })), finishTimeMs: input.finishTimeMs };
      const payloadHash = createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
      return transaction(database, async tx => {
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId}::uuid FOR UPDATE`;
        const session = await tx.typingSession.findFirst({ where: { id: sessionId, userId } });
        if (!session) throw new HttpError(404, 'NOT_FOUND', 'Session not found');
        if (session.status === 'completed') {
          if (session.payloadHash !== payloadHash) throw new HttpError(409, 'SESSION_CONFLICT', 'Session already has a different submission');
          return session.result;
        }
        const instant = now();
        if (session.status !== 'created' || session.expiresAt <= instant) throw new HttpError(409, 'SESSION_UNAVAILABLE', 'Session is abandoned or expired');
        const rules = session.rules;
        if (input.events.length > rules.maxKeystrokes || input.finishTimeMs > instant.getTime() - session.startedAt.getTime() + rules.clockToleranceMs) {
          throw new HttpError(422, 'INVALID_SUBMISSION', 'Duration or event count does not match the assignment');
        }
        let score;
        try { score = replay(session.text, input.events, input.finishTimeMs, rules); }
        catch (error) { throw new HttpError(422, 'INVALID_SUBMISSION', error.message); }
        if (score.metrics.activeDurationMs < rules.minimumRewardMs || score.inserts < 5
          || score.metrics.netWpm > rules.maxWpm || score.metrics.grossWpm > rules.maxWpm) {
          throw new HttpError(422, 'INVALID_SUBMISSION', 'Session is too short or exceeds the captured speed policy');
        }
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user?.isActive) throw new HttpError(401, 'UNAUTHENTICATED', 'Account unavailable');
        const passed = score.metrics.rawAccuracy >= rules.accuracyGate;
        const reward = rewards(score, { ...user, timezone: rules.timezone }, rules, instant);
        const keyChanges = await updateKeyProgress(tx, userId, score.keyStats, { ...rules, passed }, instant);
        await tx.user.update({ where: { id: userId }, data: { xp: reward.xp, level: reward.level, streak: reward.streak,
          ...(reward.xpEarned ? { lastPracticeDate: reward.today } : {}) } });
        if (reward.xpEarned) await tx.dailyActivity.upsert({ where: { userId_localDate: { userId, localDate: reward.today } },
          create: { userId, localDate: reward.today, timezone: rules.timezone, durationMs: score.metrics.activeDurationMs },
          update: { durationMs: { increment: score.metrics.activeDurationMs } } });
        const result = {
          sessionId, status: 'completed', metrics: score.metrics, passed,
          rewards: reward.xpEarned ? [{ id: `xp:${sessionId}`, type: 'xp', amount: reward.xpEarned }] : [],
          xpEarned: reward.xpEarned, xp: reward.xp, level: reward.level, leveledUp: reward.level > user.level, streak: reward.streak,
          masteredKeys: keyChanges.mastered, unlockedKeys: keyChanges.unlocked,
          problemKeys: Object.entries(score.keyStats).filter(([, stats]) => stats.errors).map(([key, stats]) => ({ key, errors: stats.errors, attempts: stats.attempts,
            avgMs: stats.timed ? stats.totalMs / stats.timed : null })).sort((a, b) => b.errors - a.errors).slice(0, 5),
          certificate: null,
        };
        await tx.typingSession.update({ where: { id: sessionId }, data: { status: 'completed', completedAt: instant, durationMs: score.metrics.activeDurationMs,
          grossWpm: score.metrics.grossWpm, netWpm: score.metrics.netWpm, rawAccuracy: score.metrics.rawAccuracy, finalAccuracy: score.metrics.finalAccuracy,
          xpEarned: reward.xpEarned, payloadHash, result,
          log: { create: { events: input.events, expiresAt: new Date(instant.getTime() + rules.logRetentionDays * 86400000) } } } });
        return result;
      });
    },
    async abandon(userId, sessionId) {
      const changed = await database.typingSession.updateMany({ where: { id: sessionId, userId, status: 'created' }, data: { status: 'abandoned' } });
      if (!changed.count) throw new HttpError(409, 'SESSION_UNAVAILABLE', 'No active owned session');
      return { status: 'abandoned' };
    },
    async get(userId, id) {
      const session = await database.typingSession.findFirst({ where: { id, userId } });
      if (!session) throw new HttpError(404, 'NOT_FOUND', 'Session not found');
      return session.result ?? { sessionId: session.id, status: session.status, mode: session.mode, text: session.text, expiresAt: session.expiresAt };
    },
  };
}
