// Public entry point for @typeflow/shared. Export implemented contracts and
// formulas only; comment-only future modules must not become runtime imports.
import { z } from 'zod';

// Used by liveness/readiness probes without exposing dependency error details.
export const healthResponseSchema = z.object({
  status: z.enum(['ok', 'ready', 'unavailable']),
});
// Actions such as logout/abandon accept an empty object, not arbitrary UI data.
export const emptyRequestSchema = z.object({}).strict();
export * from './auth.js';
export * from './session.js';
export * from './enums.js';
export * from './user.js';
export * from './keystroke.js';
export * from './modeRules.js';
export * from './settings.js';
export * from './path.js';
export * from './metrics.js';
export * from './courses.js';
export * from './enrollments.js';
export * from './dashboard.js';
export * from './stats.js';
export * from './certificates.js';
