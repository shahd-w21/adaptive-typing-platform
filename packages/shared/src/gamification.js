/**
 * Shared gamification/reward DTO schemas for the current /gamification endpoint
 * and official reward events returned by session completion.
 * Reward formulas and badge policies remain server/versioned configuration.
 */
import { z } from 'zod';

const count = z.number().int().nonnegative();

export const badgeItemSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    earned: z.boolean(),
    earnedAt: z.iso.datetime().nullable().optional(),
    criteria: z.string().min(1).optional(),
  })
  .strict();

export const dailyGoalSchema = z
  .object({
    goalMinutes: z.number().finite().positive(),
    minutesToday: z.number().finite().nonnegative(),
    done: z.boolean(),
  })
  .strict();

export const gamificationResponseSchema = z
  .object({
    xp: count,
    level: z.number().int().positive(),
    streak: count,
    dailyGoal: dailyGoalSchema,
    xpPerLevel: z.number().int().positive().optional(),
    timezone: z.string().min(1).optional(),
    badges: z.array(badgeItemSchema).optional(),
  })
  .strict();

export const rewardNotificationEventSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(['xp', 'level', 'streak', 'goal', 'badge']),
    amount: z.number().int().nonnegative().optional(),
    level: z.number().int().positive().optional(),
    streak: count.optional(),
    badgeTitle: z.string().min(1).optional(),
  })
  .strict();
