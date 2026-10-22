/** Current dashboard/path wire DTOs; these are not future course or Prisma models. */
import { z } from 'zod';

const count = z.number().int().nonnegative();
const metric = z.number().finite().nonnegative().nullable();
const accuracy = z.number().min(0).max(100).nullable();

// NOTE FOR DEVS — BE-06/BE-07: add reviewed reason codes/parameters before
// translating adaptive explanations. Never parse the server's English prose.
export const recommendationSchema = z.object({
  activity: z.enum(['placement', 'practice', 'timed']),
  reason: z.string().min(1),
  weakestKey: z.string().length(1).optional(),
});

export const dashboardResponseSchema = z.object({
  user: z.object({
    name: z.string().nullable(),
    email: z.email(),
    xp: count,
    level: z.number().int().positive(),
  }),
  streak: count,
  dailyGoal: z.object({
    goalMinutes: z.number().finite().positive(),
    minutesToday: z.number().finite().nonnegative(),
    done: z.boolean(),
  }),
  recommendation: recommendationSchema,
  recentSessions: z.array(
    z.object({
      id: z.uuid(),
      mode: z.literal('practice'),
      netWpm: metric,
      grossWpm: metric,
      rawAccuracy: accuracy,
      finalAccuracy: accuracy,
      durationMs: z.number().finite().nonnegative(),
      xpEarned: count,
      completedAt: z.iso.datetime(),
    }),
  ),
});

export const pathResponseSchema = z.object({
  groups: z.array(
    z.object({
      id: z.number().int(),
      name: z.string(),
      keys: z.string(),
      prerequisiteId: z.number().int().nullable(),
      isActive: z.boolean(),
    }),
  ),
  keys: z.array(
    z.object({
      key: z.string().length(1),
      status: z.enum(['locked', 'in_progress', 'mastered']),
      accuracy,
      avgMs: metric,
      attempts: count,
      latencySamples: count,
      sessions: count,
    }),
  ),
  recommendation: recommendationSchema,
});

// NOTE FOR DEVS — FE-07/FE-12: enrollment/resume fields remain draft until
// course owners review the API. Do not extend these real DTOs with sample data.
