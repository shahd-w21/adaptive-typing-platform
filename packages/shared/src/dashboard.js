/** Current dashboard/path wire DTOs; these are not future course or Prisma models. */
import { z } from 'zod';
import { keyProgressStatusSchema, sessionModeSchema } from './enums.js';

export const countSchema = z.number().int().nonnegative();
export const metricSchema = z.number().finite().nonnegative().nullable();
export const accuracySchema = z.number().min(0).max(100).nullable();

// NOTE FOR DEVS — BE-06/BE-07: add reviewed reason codes/parameters before
// translating adaptive explanations. Never parse the server's English prose.
export const recommendationSchema = z.object({
  activity: z.enum(['placement', 'practice', 'timed']),
  reason: z.string().min(1),
  weakestKey: z.string().length(1).optional(),
  focusKeys: z.array(z.string().length(1)).max(5).optional(),
});

export const keyGroupSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  keys: z.string(),
  prerequisiteId: z.number().int().nullable(),
  isActive: z.boolean(),
});

export const keyStatSchema = z.object({
  key: z.string().length(1),
  status: keyProgressStatusSchema,
  accuracy: accuracySchema,
  avgMs: metricSchema,
  attempts: countSchema,
  latencySamples: countSchema,
  sessions: countSchema,
});

export const completedSessionSummarySchema = z.object({
  id: z.uuid(),
  mode: sessionModeSchema,
  netWpm: metricSchema,
  grossWpm: metricSchema,
  rawAccuracy: accuracySchema,
  finalAccuracy: accuracySchema,
  durationMs: z.number().finite().nonnegative(),
  xpEarned: countSchema,
  completedAt: z.iso.datetime(),
});

export const dashboardResponseSchema = z.object({
  user: z.object({
    name: z.string().nullable(),
    email: z.email(),
    xp: countSchema,
    level: z.number().int().positive(),
  }),
  streak: countSchema,
  dailyGoal: z.object({
    goalMinutes: z.number().finite().positive(),
    minutesToday: z.number().finite().nonnegative(),
    done: z.boolean(),
  }),
  recommendation: recommendationSchema,
  recentSessions: z.array(
    z.object({
      ...completedSessionSummarySchema.shape,
    }),
  ),
});

export const pathResponseSchema = z.object({
  groups: z.array(keyGroupSchema),
  keys: z.array(keyStatSchema),
  recommendation: recommendationSchema,
});

// NOTE FOR DEVS — FE-07/FE-12: enrollment/resume fields remain draft until
// course owners review the API. Do not extend these real DTOs with sample data.
