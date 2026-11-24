/** Public account DTOs shared by authentication and profile API boundaries. */
import { z } from 'zod';
import { userRoleSchema, themePreferenceSchema, uiLocaleSchema } from './enums.js';

// Only owner-visible fields belong here; exclude hashes, tokens and auth records.
export const publicUserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().nullable(),
  role: userRoleSchema,
  timezone: z.string(),
  targetWpm: z.number().int(),
  dailyGoalMinutes: z.number().int(),
  largeText: z.boolean(),
  reducedPressure: z.boolean(),
  xp: z.number().int().nonnegative(),
  level: z.number().int().positive(),
  streak: z.number().int().nonnegative(),
  preferences: z.object({
    themePreference: themePreferenceSchema,
    uiLocale: uiLocaleSchema,
  }),
});

// Login and session restoration return CSRF separately from the httpOnly JWT.
export const authResponseSchema = z.object({
  user: publicUserSchema,
  csrfToken: z.string().regex(/^[a-f0-9]{64}$/),
});

export const profileResponseSchema = z.object({ user: publicUserSchema });
