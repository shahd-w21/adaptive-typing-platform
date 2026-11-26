// Draft analytics DTO schemas for the admin analytics panel (FE-21 / BE-22).
// These schemas validate the shape of GET /admin/analytics responses.
// Real aggregates are blocked on BE-22; use the fixture contract until then.
// Rules:
//   - null means unavailable (zero denominator or missing data) — never fabricate 0 % or 0 wpm.
//   - Every rate field has a corresponding count so the denominator is always explicit.
//   - Learning and assessment modes must never be merged into a single unlabeled trend.
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Window / filter schemas
// ---------------------------------------------------------------------------

/** Allowed reporting windows. Each maps to a fixed calendar range on the server. */
export const analyticsWindowSchema = z.enum(['7d', '30d', '90d']);

/**
 * Draft filter schema for GET /admin/analytics query parameters.
 * Pagination is kept separate so each rate-breakdown page shares one window key.
 */
export const analyticsFiltersSchema = z.object({
  window: analyticsWindowSchema.default('7d'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// ---------------------------------------------------------------------------
// Sub-schemas — each carries its own denominator
// ---------------------------------------------------------------------------

/**
 * Active-user count inside the reporting window.
 * windowDays is repeated in the payload so callers never have to infer it from
 * the window string; the server is the source of truth for the boundary.
 */
export const activeUsersSchema = z.object({
  count: z.number().int().min(0),
  windowDays: z.number().int().min(1),
});

/**
 * Session totals broken down by mode.
 * completionRate is null when total === 0 (zero denominator).
 * byMode keys are present only when at least one session of that mode exists.
 */
export const sessionStatsSchema = z.object({
  total: z.number().int().min(0),
  byMode: z.record(z.string(), z.number().int().min(0)),
  completionRate: z.number().min(0).max(1).nullable(),
});

/**
 * Speed/accuracy aggregate for one mode category.
 * null fields indicate no sessions with valid data for that metric.
 * sessionCount is the denominator — always present so the UI can label it.
 * mode must be present so this breakdown is never displayed unlabeled.
 */
export const modeSpeedAccuracySchema = z.object({
  mode: z.string().min(1),
  sessionCount: z.number().int().min(0),
  avgNetWpm: z.number().min(0).nullable(),
  avgGrossWpm: z.number().min(0).nullable(),
  avgRawAccuracy: z.number().min(0).max(100).nullable(),
  avgFinalAccuracy: z.number().min(0).max(100).nullable(),
});

/**
 * One problem key entry.
 * errorRate is null when attemptCount === 0 (zero denominator).
 */
export const problemKeySchema = z.object({
  key: z.string().min(1),
  errorCount: z.number().int().min(0),
  attemptCount: z.number().int().min(0),
  errorRate: z.number().min(0).max(1).nullable(),
});

/**
 * Text-generation assignment outcome stats.
 * aiPassRate and fallbackRate are null when totalAssignments === 0.
 * Both counts are always returned so the denominator is auditable.
 * Note: the platform currently uses fallback-only source, so aiPassCount
 * will be 0 until AI generation is introduced.
 */
export const generationStatsSchema = z.object({
  totalAssignments: z.number().int().min(0),
  aiPassCount: z.number().int().min(0),
  fallbackCount: z.number().int().min(0),
  aiPassRate: z.number().min(0).max(1).nullable(),
  fallbackRate: z.number().min(0).max(1).nullable(),
});

// ---------------------------------------------------------------------------
// Top-level response schema
// ---------------------------------------------------------------------------

/**
 * Full response shape for GET /admin/analytics.
 * speedByMode is an array — one entry per mode that had sessions in the window.
 * problemKeys is ordered by errorRate descending (server-side).
 */
export const analyticsResponseSchema = z.object({
  window: analyticsWindowSchema,
  windowStart: z.string().datetime(),
  windowEnd: z.string().datetime(),
  activeUsers: activeUsersSchema,
  sessions: sessionStatsSchema,
  speedByMode: z.array(modeSpeedAccuracySchema),
  problemKeys: z.array(problemKeySchema),
  generation: generationStatsSchema,
  // Pagination metadata for large problem-key lists
  pagination: z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
  }),
});
