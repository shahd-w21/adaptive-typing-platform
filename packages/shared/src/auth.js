/**
 * Shared runtime contracts for account requests and public account responses.
 * Both server and browser import these schemas to validate JSON at boundaries.
 * These are API shapes, not database models or authentication implementations.
 */
import { z } from 'zod';

const email = z.string().trim().toLowerCase().max(255).pipe(z.email());
// bcrypt accepts at most 72 bytes. The byte check also covers multibyte input;
// a JavaScript string-length limit alone would not enforce that restriction.
const password = z
  .string()
  .min(8)
  .max(72)
  .regex(/[A-Za-z]/)
  .regex(/[0-9]/)
  .refine((value) => new TextEncoder().encode(value).length <= 72);
// Registration/reset confirmations are optional API fields, but must match
// when supplied. Plain z.object strips unknown fields, including a client role.
export const registerSchema = z
  .object({ email, password, confirmPassword: z.string().optional() })
  .refine(
    (value) =>
      value.confirmPassword === undefined ||
      value.password === value.confirmPassword,
  );
// Login must accept existing passwords without reapplying new-password policy.
export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(256),
});
export const emailSchema = z.object({ email });
// One-use email verification/reset token; this is not the login JWT cookie.
export const tokenSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
});
export const resetPasswordSchema = z
  .object({
    token: tokenSchema.shape.token,
    password,
    confirmPassword: z.string().optional(),
  })
  .refine(
    (value) =>
      value.confirmPassword === undefined ||
      value.password === value.confirmPassword,
  );
// Authenticated password changes require both the old password and confirmation.
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword);
// Account deletion requires password confirmation, even with an active cookie.
export const deleteAccountSchema = z.object({
  password: z.string().min(1).max(256),
});
// PATCH fields are optional so omitted values remain unchanged on the server.
// Reject unknown keys at both levels and reject an entirely empty patch.
export const profileSchema = z
  .object({
    name: z.string().trim().max(100).nullable().optional(),
    // Validate an IANA time-zone name using the runtime's supported zones.
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
    preferences: z
      .object({
        themePreference: z.enum(['light', 'dark', 'system']).optional(),
        uiLocale: z.enum(['en', 'ar']).optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0);

// Current wire DTOs, not Prisma models. Object parsing strips extra response fields.
// Only owner-visible fields belong here; hashes, auth records and tokens do not.
export const publicUserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().nullable(),
  role: z.enum(['student', 'admin']),
  timezone: z.string(),
  targetWpm: z.number().int(),
  dailyGoalMinutes: z.number().int(),
  largeText: z.boolean(),
  reducedPressure: z.boolean(),
  xp: z.number().int().nonnegative(),
  level: z.number().int().positive(),
  streak: z.number().int().nonnegative(),
  preferences: z.object({
    themePreference: z.enum(['light', 'dark', 'system']),
    uiLocale: z.enum(['en', 'ar']),
  }),
});
// Login and session restoration return CSRF separately from the httpOnly JWT.
// The browser keeps this value in the existing auth state, never localStorage.
export const authResponseSchema = z.object({
  user: publicUserSchema,
  csrfToken: z.string().regex(/^[a-f0-9]{64}$/),
});
// Profile reads/updates do not create or replace the current auth session.
export const profileResponseSchema = z.object({ user: publicUserSchema });

// Current account actions return a message rather than a resource DTO.
export const acknowledgementSchema = z.object({ message: z.string() });

// This describes received JSON only. Transport maps code to a safe local message
// and does not display the optional server message verbatim.
export const apiErrorResponseSchema = z.object({
  error: z.object({ code: z.string(), message: z.string().optional() }),
});
