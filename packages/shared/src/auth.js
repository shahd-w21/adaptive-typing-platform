import { z } from 'zod';

const email = z.string().trim().toLowerCase().max(255).pipe(z.email());
const password = z.string().min(8).max(72).regex(/[A-Za-z]/).regex(/[0-9]/)
  .refine(value => new TextEncoder().encode(value).length <= 72);
export const registerSchema = z.object({ email, password, confirmPassword: z.string().optional() })
  .refine(value => value.confirmPassword === undefined || value.password === value.confirmPassword);
export const loginSchema = z.object({ email, password: z.string().min(1).max(256) });
export const emailSchema = z.object({ email });
export const tokenSchema = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) });
export const resetPasswordSchema = z.object({ token: tokenSchema.shape.token, password, confirmPassword: z.string().optional() })
  .refine(value => value.confirmPassword === undefined || value.password === value.confirmPassword);
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: password, confirmPassword: z.string() })
  .refine(value => value.newPassword === value.confirmPassword);
export const deleteAccountSchema = z.object({ password: z.string().min(1).max(256) });
export const profileSchema = z.object({
  name: z.string().trim().max(100).nullable().optional(),
  timezone: z.string().max(80).refine(value => { try { new Intl.DateTimeFormat('en', { timeZone: value }); return true; } catch { return false; } }).optional(),
  targetWpm: z.number().int().min(10).max(250).optional(),
  dailyGoalMinutes: z.number().int().min(1).max(240).optional(),
  largeText: z.boolean().optional(), reducedPressure: z.boolean().optional(),
  preferences: z.object({ themePreference: z.enum(['light', 'dark', 'system']).optional(), uiLocale: z.enum(['en', 'ar']).optional() }).strict().optional(),
}).strict().refine(value => Object.keys(value).length > 0);
