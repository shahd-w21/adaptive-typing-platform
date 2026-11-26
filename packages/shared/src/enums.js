/** Canonical wire enums shared by account, session and learning DTOs. */
import { z } from 'zod';

export const userRoleSchema = z.enum(['student', 'admin']);
export const themePreferenceSchema = z.enum(['light', 'dark', 'system']);
export const uiLocaleSchema = z.enum(['en', 'ar']);
export const sessionModeSchema = z.literal('practice');
export const sessionSourceSchema = z.literal('fallback');
export const sessionStatusSchema = z.enum(['created', 'completed', 'abandoned']);
export const keyProgressStatusSchema = z.enum([
  'locked',
  'in_progress',
  'mastered',
]);
