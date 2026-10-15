import { ensureKeyProgress } from '../stats/service.js';
import { transaction } from '../../db/transaction.js';
import { recommendNext } from './recommend.js';
import { localDate, previousDate } from '../gamification/rules.js';

export function createPathService({ database, now = () => new Date() }) {
  return async user => transaction(database, async tx => {
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${user.id}::uuid FOR UPDATE`;
    const groups = await ensureKeyProgress(tx, user.id);
    const current = await tx.user.findUnique({ where: { id: user.id } });
    const keys = await tx.keyStat.findMany({ where: { userId: user.id }, orderBy: { key: 'asc' },
      select: { key: true, status: true, accuracy: true, avgMs: true, attempts: true, latencySamples: true, sessions: true } });
    const sessions = await tx.typingSession.findMany({ where: { userId: user.id, status: 'completed' }, orderBy: { completedAt: 'desc' }, take: 100,
      select: { id: true, mode: true, netWpm: true, grossWpm: true, rawAccuracy: true, finalAccuracy: true, durationMs: true, xpEarned: true, completedAt: true } });
    const completedSessions = await tx.typingSession.count({ where: { userId: user.id, status: 'completed' } });
    const today = localDate(now(), current.timezone);
    const activity = await tx.dailyActivity.findUnique({ where: { userId_localDate: { userId: user.id, localDate: today } } });
    const minutesToday = (activity?.durationMs ?? 0) / 60000;
    const streak = [today, previousDate(today)].includes(current.lastPracticeDate) ? current.streak : 0;
    return {
      user: { name: current.name, email: current.email, xp: current.xp, level: current.level },
      groups, keys, sessions, recentSessions: sessions.slice(0, 5), streak,
      dailyGoal: { goalMinutes: current.dailyGoalMinutes, minutesToday, done: minutesToday >= current.dailyGoalMinutes },
      recommendation: recommendNext({ placementDone: current.placementDone, completedSessions, keys }),
    };
  });
}
