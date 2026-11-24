/** Shared response DTOs for currently implemented progress and reward reads. */
import { z } from 'zod';
import {
  completedSessionSummarySchema,
  countSchema,
  keyStatSchema,
} from './dashboard.js';

const dailyGoalSchema = z.object({
  goalMinutes: z.number().finite().positive(),
  minutesToday: z.number().finite().nonnegative(),
  done: z.boolean(),
});

// Current routes return bounded full snapshots; pagination is not implemented.
export const progressResponseSchema = z.object({
  sessions: z.array(completedSessionSummarySchema).max(100),
  keys: z.array(keyStatSchema),
});

export const gamificationResponseSchema = z.object({
  xp: countSchema,
  level: z.number().int().positive(),
  streak: countSchema,
  dailyGoal: dailyGoalSchema,
});

export const adminPingResponseSchema = z.object({
  message: z.string(),
});
