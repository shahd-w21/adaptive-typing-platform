// Owns assignment capture and the atomic result lifecycle for every SRS mode.
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { HttpError } from '../../middleware/validate.js';
import { transaction } from '../../db/transaction.js';
import { ensureKeyProgress, updateKeyProgress } from '../stats/service.js';
import { updateKeyEvidence } from '../adaptive/mastery.js';
import { generatePracticeText, keyWeight, selectPracticeFocus } from '../generation/fallbackGenerator.js';
import { scoreSession, SCORING_VERSION } from '../scoring/scoreSession.js';
import { rewards } from '../gamification/rules.js';
import { modePolicyFor, SESSION_MODE_POLICY_VERSION } from '@typeflow/shared';

const DAY_MS = 24 * 60 * 60 * 1000;
const CERTIFIED_DURATION_MS = 3 * 60 * 1000;
const CERTIFIED_MIN_NET_WPM = 30;
const CERTIFIED_MIN_RAW_ACCURACY = 95;
const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30];
const TIMED_TEXT_MARGIN = 1.15;
const MAX_SESSION_KEYSTROKES = 10_000;

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

/** Creates the shared session lifecycle with injectable time and text randomness. */
export function createSessionService({ database, now = () => new Date(), random = Math.random }) {
  return {
    /**
     * Builds an assignment from current owned state and captures mode rules.
     * @param {{id: string}} user Authenticated student whose assignment is created.
     * @param {{mode: string, durationSeconds?: number}} input Validated start request.
     * @returns {Promise<object>} Server-issued assignment DTO.
     * @throws {HttpError} When policy, content, placement or review state blocks start.
     */
    async start(user, input = { mode: 'practice' }) {
      const settings = await database.settingVersion.findUnique({ where: { id: 'teammate-migration-v1' } });
      const parsed = policySchema.safeParse(settings?.values);
      if (!parsed.success) throw new HttpError(503, 'CONTENT_NOT_READY', 'Run the development seed or review the practice policy');
      const startState = await transaction(database, async tx => {
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${user.id}::uuid FOR UPDATE`;
        const currentUser = await tx.user.findUnique({ where: { id: user.id } });
        if (!currentUser?.isActive) throw new HttpError(401, 'UNAUTHENTICATED', 'Account unavailable');
        await ensureKeyProgress(tx, user.id);
        const allKeys = await tx.keyStat.findMany({
          where: { userId: user.id, status: { in: ['in_progress', 'mastered'] } },
          orderBy: { key: 'asc' },
        });
        const groups = await tx.keyGroup.findMany({
          where: { isActive: true },
          orderBy: { id: 'asc' },
        });
        const dueReviews = await tx.keyStat.findMany({
          where: {
            userId: user.id,
            status: 'mastered',
            nextReviewAt: { lte: now() },
          },
          orderBy: [{ nextReviewAt: 'asc' }, { key: 'asc' }],
        });
        return {
          allKeys,
          groups,
          dueReviews,
          placementDone: currentUser.placementDone,
          targetWpm: currentUser.targetWpm,
          timezone: currentUser.timezone,
        };
      });
      let selectedKeys = startState.allKeys;
      let modeFields = {};
      let text;
      let durationMs;
      if (input.mode === 'placement') {
        if (startState.placementDone) {
          throw new HttpError(409, 'PLACEMENT_UNAVAILABLE', 'Placement has already been completed');
        }
        selectedKeys = [...'abcdefghijklmnopqrstuvwxyz'].map(key => ({ key, accuracy: null, avgMs: null, status: 'in_progress' }));
      } else if (input.mode === 'lesson') {
        const group = startState.groups.find(candidate => [...candidate.keys].some(key =>
          startState.allKeys.some(row => row.key === key && row.status === 'in_progress')));
        if (!group) throw new HttpError(503, 'CONTENT_NOT_READY', 'No lesson group is available');
        selectedKeys = startState.allKeys.filter(row => group.keys.includes(row.key) && row.status === 'in_progress');
        modeFields = { lessonGroupId: group.id };
      } else if (input.mode === 'review') {
        if (!startState.dueReviews.length) {
          throw new HttpError(409, 'NO_REVIEWS_DUE', 'There are no mastered keys due for review');
        }
        selectedKeys = startState.dueReviews;
        modeFields = { reviewKeys: selectedKeys.map(row => row.key) };
      } else if (input.mode === 'timed') {
        durationMs = input.durationSeconds * 1000;
      } else if (input.mode === 'certified') {
        durationMs = CERTIFIED_DURATION_MS;
        modeFields = {
          certifiedMinNetWpm: CERTIFIED_MIN_NET_WPM,
          certifiedMinRawAccuracy: CERTIFIED_MIN_RAW_ACCURACY,
        };
      }
      if (input.mode !== 'placement' && !selectedKeys.length) {
        throw new HttpError(503, 'CONTENT_NOT_READY', 'No unlocked curriculum is available');
      }
      if (input.mode === 'practice' || input.mode === 'lesson') {
        modeFields.focusKeys = selectPracticeFocus(
          selectedKeys,
          startState.targetWpm,
          input.mode === 'practice' ? startState.dueReviews : [],
        );
      }
      if (input.mode === 'review') {
        // Repeated same-key runs guarantee enough observations for the review
        // gate while retaining eligible within-key latency samples.
        text = selectedKeys.map(row => row.key.repeat(6)).join(' ');
      } else if (input.mode === 'placement') {
        text = 'abcdefghijklmnopqrstuvwxyz'.repeat(10);
      } else {
        const requiredChars = durationMs
          ? Math.ceil((durationMs / 60_000) * parsed.data.maxWpm * 5 * TIMED_TEXT_MARGIN)
          : undefined;
        const wordCount = requiredChars
          ? Math.ceil((requiredChars + 1) / 4)
          : undefined;
        text = generatePracticeText(
          selectedKeys.map(row => ({
            key: row.key,
            weight: keyWeight(row, startState.targetWpm),
          })),
          random,
          wordCount,
          { focusKeys: modeFields.focusKeys ?? [] },
        );
      }
      const rules = {
        ...parsed.data,
        scoringVersion: SCORING_VERSION,
        targetWpm: startState.targetWpm,
        timezone: startState.timezone,
        modePolicyVersion: SESSION_MODE_POLICY_VERSION,
        maxKeystrokes: durationMs ? MAX_SESSION_KEYSTROKES : parsed.data.maxKeystrokes,
        ...(durationMs ? { durationMs } : {}),
        ...modeFields,
      };
      const startedAt = now();
      const session = await database.typingSession.create({ data: { userId: user.id, mode: input.mode, text, rules, settingsId: settings.id, startedAt,
        expiresAt: new Date(startedAt.getTime() + rules.sessionExpiryMs) } });
      return { sessionId: session.id, mode: session.mode, text, source: session.source, issuedAt: session.startedAt, expiresAt: session.expiresAt,
        rules: {
          modePolicyVersion: SESSION_MODE_POLICY_VERSION,
          pauseAllowed: modePolicyFor(input.mode).pauseAllowed,
          eventVersion: 1,
          scoringVersion: SCORING_VERSION,
          settingsVersion: settings.id,
          targetWpm: rules.targetWpm,
          timezone: rules.timezone,
          maxKeystrokes: rules.maxKeystrokes,
          ...(rules.durationMs ? { durationMs: rules.durationMs } : {}),
          ...modeFields,
        } };
    },
    /**
     * Replays and saves one owned session result with mode-scoped learning/rewards.
     * @param {string} userId Owner UUID.
     * @param {string} sessionId Session UUID.
     * @param {{events: object[], finishTimeMs: number}} input Canonical client event log.
     * @returns {Promise<object>} Saved official result; identical retries return this value.
     * @throws {HttpError} For ownership, expiry, conflict or replay validation failures.
     */
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
        let modePolicy;
        try {
          modePolicy = modePolicyFor(session.mode);
          score = scoreSession({
            text: session.text,
            events: input.events,
            finishTimeMs: input.finishTimeMs,
            rules: {
              ...rules,
              mode: session.mode,
              pauseAllowed: modePolicy.pauseAllowed,
            },
          });
        }
        catch (error) { throw new HttpError(422, 'INVALID_SUBMISSION', error.message); }
        if (score.metrics.activeDurationMs < rules.minimumRewardMs || score.inserts < 5
          || score.metrics.netWpm > rules.maxWpm || score.metrics.grossWpm > rules.maxWpm) {
          throw new HttpError(422, 'INVALID_SUBMISSION', 'Session is too short or exceeds the captured speed policy');
        }
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user?.isActive) throw new HttpError(401, 'UNAUTHENTICATED', 'Account unavailable');
        const reviewAssessment = session.mode === 'review'
          ? assessReview(score.keyStats, rules.reviewKeys ?? [], rules.targetWpm)
          : null;
        const passed = session.mode === 'certified'
          ? score.metrics.netWpm >= rules.certifiedMinNetWpm
            && score.metrics.rawAccuracy >= rules.certifiedMinRawAccuracy
          : session.mode === 'review'
            ? reviewAssessment?.passed ?? false
            : score.metrics.rawAccuracy >= rules.accuracyGate;
        const reward = modePolicy.earnsRewards
          ? rewards(score, { ...user, timezone: rules.timezone }, rules, instant)
          : { xpEarned: 0, xp: user.xp, level: user.level, streak: user.streak };
        const keyChanges = modePolicy.updatesLearning
          ? await updateKeyProgress(tx, userId, score.keyStats, { ...rules, passed }, instant)
          : session.mode === 'placement'
            ? await applyPlacementEvidence(tx, userId, score.keyStats, rules, instant)
            : { mastered: [], unlocked: [] };
        if (session.mode === 'review') {
          await saveReviewSchedule(tx, userId, reviewAssessment, instant);
        }
        if (session.mode === 'placement') {
          await tx.user.update({ where: { id: userId }, data: { placementDone: true } });
        }
        if (modePolicy.earnsRewards) {
          await tx.user.update({ where: { id: userId }, data: { xp: reward.xp, level: reward.level, streak: reward.streak,
            ...(reward.xpEarned ? { lastPracticeDate: reward.today } : {}) } });
        }
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
    /**
     * Abandons a live session only after rechecking ownership and deadline under
     * the same per-user lock used by submission, so only one terminal path wins.
     */
    async abandon(userId, sessionId) {
      return transaction(database, async tx => {
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId}::uuid FOR UPDATE`;
        const session = await tx.typingSession.findFirst({
          where: { id: sessionId, userId },
        });
        const instant = now();

        if (
          !session ||
          session.status !== 'created' ||
          session.expiresAt <= instant
        ) {
          throw new HttpError(409, 'SESSION_UNAVAILABLE', 'No active owned session');
        }

        const changed = await tx.typingSession.updateMany({
          where: { id: sessionId, userId, status: 'created' },
          data: { status: 'abandoned' },
        });

        if (!changed.count) {
          throw new HttpError(409, 'SESSION_UNAVAILABLE', 'No active owned session');
        }

        return { status: 'abandoned' };
      });
    },
    /** Return a bounded newest-first history containing only the owner's sessions. */
    async history(userId) {
      return database.typingSession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 100,
        select: {
          id: true,
          mode: true,
          status: true,
          netWpm: true,
          rawAccuracy: true,
          completedAt: true,
        },
      });
    },
    async get(userId, id) {
      const session = await database.typingSession.findFirst({ where: { id, userId } });
      if (!session) throw new HttpError(404, 'NOT_FOUND', 'Session not found');
      return session.result ?? { sessionId: session.id, status: session.status, mode: session.mode, text: session.text, expiresAt: session.expiresAt };
    },
  };
}

/** Applies the SRS review coverage and pass thresholds to captured keys. */
function assessReview(keyStats, reviewKeys, targetWpm) {
  const latencyLimitMs = (60_000 / (5 * targetWpm)) * 1.2;
  const results = reviewKeys.map(key => {
    const sample = keyStats[key] ?? { attempts: 0, errors: 0, totalMs: 0, timed: 0 };
    const assessable = sample.attempts >= 5 && sample.timed >= 3;
    const rawAccuracy = sample.attempts
      ? ((sample.attempts - sample.errors) / sample.attempts) * 100
      : 0;
    const meanLatencyMs = sample.timed ? sample.totalMs / sample.timed : null;
    return {
      key,
      assessable,
      passed: assessable && rawAccuracy >= 97 && meanLatencyMs <= latencyLimitMs,
    };
  });
  return {
    results,
    passed: results.length > 0 && results.every(result => result.passed),
  };
}

/** Saves placement evidence without mastering keys and skips only qualified groups. */
async function applyPlacementEvidence(tx, userId, keyStats, rules, instant) {
  const groups = await tx.keyGroup.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' },
  });
  for (const [key, sample] of Object.entries(keyStats)) {
    const row = await tx.keyStat.findUnique({ where: { userId_key: { userId, key } } });
    if (!row) continue;
    const evidence = updateKeyEvidence(row, sample, { ...rules, passed: false });
    await tx.keyStat.update({
      where: { userId_key: { userId, key } },
      data: { ...evidence, updatedAt: instant },
    });
  }

  const currentStats = await tx.keyStat.findMany({ where: { userId } });
  const statusByKey = new Map(currentStats.map(row => [row.key, row.status]));
  const timingLimitMs = (60_000 / (5 * rules.targetWpm)) * 1.2;
  const unlocked = [];
  for (const group of groups) {
    if (group.prerequisiteId === null) continue;
    const prerequisite = groups.find(candidate => candidate.id === group.prerequisiteId);
    if (!prerequisite || !prerequisite.keys.split('').every(key => statusByKey.get(key) !== 'locked')) continue;
    const prerequisiteLetters = prerequisite.keys.split('').filter(key => /^[a-z]$/i.test(key));
    const demonstrated = prerequisiteLetters.length > 0 && prerequisiteLetters.every(key => {
      const sample = keyStats[key];
      return sample
        && sample.attempts >= 3
        && sample.errors === 0
        && sample.timed >= 2
        && sample.totalMs / sample.timed <= timingLimitMs;
    });
    if (!demonstrated) continue;
    for (const key of group.keys) {
      const result = await tx.keyStat.updateMany({
        where: { userId, key, status: 'locked' },
        data: { status: 'in_progress' },
      });
      if (result.count) {
        unlocked.push(key);
        statusByKey.set(key, 'in_progress');
      }
    }
  }
  return { mastered: [], unlocked };
}

/** Advances passed reviews or resets failed mastered keys without relocking groups. */
async function saveReviewSchedule(tx, userId, assessment, instant) {
  for (const result of assessment.results) {
    if (!result.assessable) continue;
    if (!result.passed) {
      await tx.keyStat.update({
        where: { userId_key: { userId, key: result.key } },
        data: { status: 'in_progress', reviewStage: 0, lastReviewAt: instant, nextReviewAt: null },
      });
      continue;
    }
    const current = await tx.keyStat.findUnique({
      where: { userId_key: { userId, key: result.key } },
      select: { reviewStage: true },
    });
    const stage = Math.min(current.reviewStage + 1, REVIEW_INTERVAL_DAYS.length - 1);
    const intervalDays = REVIEW_INTERVAL_DAYS[stage];
    await tx.keyStat.update({
      where: { userId_key: { userId, key: result.key } },
      data: {
        reviewStage: stage,
        lastReviewAt: instant,
        nextReviewAt: new Date(instant.getTime() + intervalDays * DAY_MS),
      },
    });
  }
}
