/** Shared account presentation and profile-setting request contracts. */
import { z } from 'zod';
import { themePreferenceSchema, uiLocaleSchema } from './enums.js';

export const preferencesSchema = z
  .object({
    themePreference: themePreferenceSchema.optional(),
    uiLocale: uiLocaleSchema.optional(),
  })
  .strict();

// PATCH preserves omitted fields and rejects an empty or unknown-field update.
export const profileSchema = z
  .object({
    name: z.string().trim().max(100).nullable().optional(),
    timezone: z
      .string()
      .max(80)
      .refine((value) => {
        try {
          new Intl.DateTimeFormat('en', { timeZone: value });
          return true;
        } catch {
          return false;
        }
      })
      .optional(),
    targetWpm: z.number().int().min(10).max(250).optional(),
    dailyGoalMinutes: z.number().int().min(1).max(240).optional(),
    largeText: z.boolean().optional(),
    reducedPressure: z.boolean().optional(),
    preferences: preferencesSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0);
