// Draft FE-23 DTO schemas for content authoring and versioned learning settings.
// These schemas intentionally exclude database records and private audit details.
import { z } from 'zod';

export const adminWordListSchema = z.object({
  id: z.string().trim().min(1).max(100),
  language: z.literal('en'),
  words: z.array(z.string().trim().min(1).max(50)).min(1).max(500),
  source: z.string().trim().min(1).max(200),
}).strict();

export const adminThemeSchema = z.object({
  id: z.string().trim().min(1).max(100),
  label: z.string().trim().min(1).max(100),
  wordListIds: z.array(z.string().trim().min(1)).min(1),
}).strict();

export const adminKeyGroupSchema = z.object({
  id: z.string().trim().min(1).max(100),
  label: z.string().trim().min(1).max(100),
  keys: z.array(z.string().trim().min(1).max(10)).min(1),
  prerequisiteGroupIds: z.array(z.string().trim().min(1)),
}).strict();

export const blockedWordsSchema = z.object({
  words: z.array(z.string().trim().min(1).max(100)).max(500),
}).strict();

export const adminContentSchema = z.object({
  version: z.string().regex(/^v\d+\.\d+\.\d+$/),
  wordLists: z.array(adminWordListSchema),
  blockedWords: blockedWordsSchema,
  themes: z.array(adminThemeSchema),
  keyGroups: z.array(adminKeyGroupSchema),
}).strict();

export const contentValidationSchema = z.object({
  valid: z.boolean(),
  version: z.string().regex(/^v\d+\.\d+\.\d+$/),
  errors: z.array(z.string()),
  preview: z.object({
    beginner: z.string(),
    advanced: z.string(),
  }).strict(),
}).strict();

export const learningSettingsSchema = z.object({
  currentVersion: z.string().regex(/^v\d+\.\d+\.\d+$/),
  rawAccuracyGatePercent: z.number().int().min(80).max(99),
  difficultyReductionPercent: z.number().int().min(70).max(94),
  initialLatencyCutoffMs: z.number().int().min(500).max(5000),
}).strict();

export const activateLearningSettingsSchema = learningSettingsSchema.extend({
  expectedCurrentVersion: z.string().regex(/^v\d+\.\d+\.\d+$/),
}).strict();
