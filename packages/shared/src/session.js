/**
 * Shared typing-session request and response contracts for the current API.
 * The browser records events; the server replays them to produce official
 * results. Future lesson/placement/test modes require reviewed schema changes.
 */
import { z } from 'zod';
import { sessionModeSchema, sessionSourceSchema, sessionStatusSchema } from './enums.js';
import { sessionRulesSchema } from './modeRules.js';

export { eventSchema, submissionSchema } from './keystroke.js';
export { sessionModeSchema, sessionSourceSchema } from './enums.js';

// Practice is the only implemented machine mode. Display labels stay in the UI.
export const startSessionSchema = z
  .object({ mode: z.literal('practice').default('practice') })
  .strict();
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
  .strict();
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
