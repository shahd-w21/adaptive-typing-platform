/**
 * Shared typing-session request and response contracts for the current API.
 * The browser records events; the server replays them to produce official
 * results. Future lesson/placement/test modes require reviewed schema changes.
 */
import { z } from 'zod';

// type selects the event shape. Only insert carries char; t is elapsed
// milliseconds from the first insert and seq preserves capture order.
// Schema validation checks shape; server replay checks the event sequence.
export const eventSchema = z.discriminatedUnion('type', [
  z
    .object({
      seq: z.number().int().nonnegative(),
      type: z.literal('insert'),
      t: z.number().finite().nonnegative(),
      char: z
        .string()
        .length(1)
        .regex(/^[ -~]$/),
    })
    .strict(),
  ...['backspace', 'pause', 'resume'].map((type) =>
    z
      .object({
        seq: z.number().int().nonnegative(),
        type: z.literal(type),
        t: z.number().finite().nonnegative(),
      })
      .strict(),
  ),
]);
// No scores/correctness flags are accepted from the client. finishTimeMs uses
// the same elapsed clock as events; the server enforces mode-specific timing.
export const submissionSchema = z
  .object({
    events: z.array(eventSchema).min(1).max(5000),
    finishTimeMs: z.number().finite().nonnegative(),
  })
  .strict();
// Practice is the only implemented machine mode. Display labels stay in the UI.
export const sessionModeSchema = z.literal('practice');
export const sessionSourceSchema = z.literal('fallback');
export const startSessionSchema = z
  .object({ mode: z.literal('practice').default('practice') })
  .strict();
export const idSchema = z.uuid();

const dateTime = z.iso.datetime();
const status = z.enum(['created', 'completed', 'abandoned']);

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
    rules: z
      .object({
        pauseAllowed: z.literal(true),
        eventVersion: z.literal(1),
        settingsVersion: z.string(),
        targetWpm: z.number(),
      })
      .strict(),
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
          status,
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
