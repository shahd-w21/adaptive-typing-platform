/**
 * Shared typing-session request and response contracts for the current API.
 * The browser records events; the server replays them to produce official
 * results. Server-issued assignments capture the selected mode policy and
 * the fields needed to replay its deadline and learning rules.
 */
import { z } from 'zod';
import { sessionModeSchema, sessionSourceSchema, sessionStatusSchema } from './enums.js';
import { modePolicyFor, sessionRulesSchema } from './modeRules.js';

export { eventSchema, submissionSchema } from './keystroke.js';
export { sessionModeSchema, sessionSourceSchema } from './enums.js';

// Empty start bodies preserve the existing practice-client contract.
export const startSessionSchema = z
  .discriminatedUnion('mode', [
    z.object({ mode: z.literal('practice') }).strict(),
    z.object({ mode: z.literal('placement') }).strict(),
    z.object({ mode: z.literal('lesson') }).strict(),
    z.object({ mode: z.literal('review') }).strict(),
    z.object({ mode: z.literal('timed'), durationSeconds: z.union([z.literal(60), z.literal(180), z.literal(300)]) }).strict(),
    z.object({ mode: z.literal('certified') }).strict(),
  ]).or(z.object({}).strict().transform(() => ({ mode: 'practice' })));
export const idSchema = z.uuid();

const dateTime = z.iso.datetime();

// A server-issued assignment fixes the text, expiry and captured rule versions.
// source/rules names intentionally match current responses, not draft examples.
export const sessionAssignmentSchema = z
  .object({
    sessionId: idSchema,
    mode: sessionModeSchema,
    text: z.string(),
    source: sessionSourceSchema,
    issuedAt: dateTime,
    expiresAt: dateTime,
    rules: sessionRulesSchema,
  })
  .strict()
  .superRefine((assignment, context) => {
    const { mode, rules } = assignment;
    if (rules.pauseAllowed !== modePolicyFor(mode).pauseAllowed) {
      context.addIssue({ code: 'custom', path: ['rules', 'pauseAllowed'], message: 'Pause policy must match the mode' });
    }
    if (mode === 'lesson' && rules.lessonGroupId === undefined) {
      context.addIssue({ code: 'custom', path: ['rules', 'lessonGroupId'], message: 'Lesson assignments require a group' });
    }
    if (mode === 'review' && (!rules.reviewKeys || rules.reviewKeys.length === 0)) {
      context.addIssue({ code: 'custom', path: ['rules', 'reviewKeys'], message: 'Review assignments require captured keys' });
    }
    if (rules.focusKeys?.some(key => [...assignment.text].filter(char => char === key).length < 3)) {
      context.addIssue({ code: 'custom', path: ['rules', 'focusKeys'], message: 'Each focus key requires at least three occurrences in assigned text' });
    }
    if (mode === 'timed' && ![60_000, 180_000, 300_000].includes(rules.durationMs)) {
      context.addIssue({ code: 'custom', path: ['rules', 'durationMs'], message: 'Timed assignments require an allowed duration' });
    }
    if (mode === 'certified' && (
      rules.durationMs !== 180_000
      || rules.certifiedMinNetWpm !== 30
      || rules.certifiedMinRawAccuracy !== 95
    )) {
      context.addIssue({ code: 'custom', path: ['rules'], message: 'Certified assignments require captured BE-04 thresholds' });
    }
  });
// Values come from server replay. null means unavailable evidence, not zero;
// accuracy uses percentages and activeDurationMs excludes permitted pauses.
export const officialMetricsSchema = z
  .object({
    grossWpm: z.number().finite().nonnegative().nullable(),
    netWpm: z.number().finite().nonnegative().nullable(),
    rawAccuracy: z.number().min(0).max(100).nullable(),
    finalAccuracy: z.number().min(0).max(100).nullable(),
    activeDurationMs: z.number().finite().nonnegative(),
  })
  .strict();
// Completed result saved atomically with statistics/rewards on the server.
// Identical accepted submission retries return the saved result, including XP
// event IDs. Certificate issuance is not implemented, so certificate is null.
export const sessionResultSchema = z
  .object({
    sessionId: idSchema,
    status: z.literal('completed'),
    metrics: officialMetricsSchema,
    passed: z.boolean(),
    rewards: z.array(
      z
        .object({
          id: z.string(),
          type: z.literal('xp'),
          amount: z.number().int().nonnegative(),
        })
        .strict(),
    ),
    xpEarned: z.number().int().nonnegative(),
    xp: z.number().int().nonnegative(),
    level: z.number().int().positive(),
    leveledUp: z.boolean(),
    streak: z.number().int().nonnegative(),
    masteredKeys: z.array(z.string()),
    unlockedKeys: z.array(z.string()),
    problemKeys: z.array(
      z
        .object({
          key: z.string(),
          errors: z.number().int().nonnegative(),
          attempts: z.number().int().nonnegative(),
          avgMs: z.number().nonnegative().nullable(),
        })
        .strict(),
    ),
    certificate: z.null(),
  })
  .strict();
// GET /sessions returns summary rows, including unfinished sessions whose
// metrics/completedAt may be null. This is not the full result/detail shape.
export const sessionHistorySchema = z
  .object({
    sessions: z.array(
      z
        .object({
          id: idSchema,
          mode: sessionModeSchema,
          status: sessionStatusSchema,
          netWpm: z.number().nonnegative().nullable(),
          rawAccuracy: z.number().min(0).max(100).nullable(),
          completedAt: dateTime.nullable(),
        })
        .strict(),
    ),
  })
  .strict();
// GET /sessions/:id returns either the saved completed result or the assignment
// information needed to describe a created/abandoned session.
export const sessionDetailSchema = z.union([
  sessionResultSchema,
  z
    .object({
      sessionId: idSchema,
      status: z.enum(['created', 'abandoned']),
      mode: sessionModeSchema,
      text: z.string(),
      expiresAt: dateTime,
    })
    .strict(),
]);
// Abandonment acknowledges a state change; it does not award learning rewards.
export const sessionAbandonmentSchema = z
  .object({
    status: z.literal('abandoned'),
  })
  .strict();
