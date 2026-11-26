/**
 * Shared progress, key-evidence and reporting DTO contracts.
 * Current GET /progress returns { sessions, keys } without server-side query
 * filters; filter/pagination schemas below are draft contracts for future
 * server-side reporting endpoints and validated client-side filtering.
 */
import { z } from 'zod';

const count = z.number().int().nonnegative();
const metric = z.number().finite().nonnegative().nullable();
const accuracy = z.number().min(0).max(100).nullable();

export const LEARNING_MODES = ['lesson', 'practice', 'review'];
export const ASSESSMENT_MODES = ['placement', 'timed', 'certified'];

export const progressSessionModeSchema = z.enum([
  'placement',
  'lesson',
  'practice',
  'review',
  'timed',
  'certified',
]);

/** Return true when a session mode belongs to learning rather than assessment. */
export function isLearningMode(mode) {
  return LEARNING_MODES.includes(mode);
}

/** Return true when a session mode is an assessment (placement/timed/certified). */
export function isAssessmentMode(mode) {
  return ASSESSMENT_MODES.includes(mode);
}

/** Per-key evidence record; null accuracy/avgMs means unavailable, never zero. */
export const keyStatSchema = z.object({
  key: z.string().length(1),
  status: z.enum(['locked', 'in_progress', 'mastered']),
  accuracy,
  avgMs: metric,
  attempts: count,
  latencySamples: count,
  sessions: count,
});

/** Completed session summary returned by GET /progress. */
export const progressSessionSchema = z.object({
  id: z.uuid(),
  mode: progressSessionModeSchema,
  netWpm: metric,
  grossWpm: metric,
  rawAccuracy: accuracy,
  finalAccuracy: accuracy,
  durationMs: z.number().finite().nonnegative(),
  xpEarned: count,
  completedAt: z.iso.datetime(),
  // Optional future field; not emitted by the current practice-only server.
  difficulty: z.number().int().min(1).max(3).nullable().optional(),
});

/** Current GET /progress response DTO. */
export const progressResponseSchema = z.object({
  sessions: z.array(progressSessionSchema),
  keys: z.array(keyStatSchema),
});

/**
 * Draft filter and pagination contract for future server-side progress queries.
 * Client-side filtering validates against this schema until the API adds query params.
 */
export const progressFiltersSchema = z
  .object({
    mode: z
      .enum([
        'all',
        'learning',
        'assessment',
        'placement',
        'lesson',
        'practice',
        'review',
        'timed',
        'certified',
      ])
      .default('all'),
    difficulty: z.enum(['all', '1', '2', '3']).default('all'),
    timeRange: z.enum(['all', '7d', '30d', '90d']).default('all'),
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().max(100).default(10),
  })
  .strict();
