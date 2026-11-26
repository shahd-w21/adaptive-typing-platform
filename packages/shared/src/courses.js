import { z } from 'zod';

export const courseLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);
export const courseTopicSchema = z.enum(['foundations', 'speed', 'numbers_symbols', 'code_prose']);
export const courseStatusSchema = z.enum(['draft', 'published', 'archived']);

export const lessonPreviewSchema = z.object({
  id: z.string().min(1),
  lessonIndex: z.number().int().nonnegative(),
  title: z.string().min(1),
  type: z.enum(['lesson', 'practice', 'checkpoint', 'review']),
  keysIntroduced: z.array(z.string()).optional(),
});

export const unitPreviewSchema = z.object({
  id: z.string().min(1),
  unitIndex: z.number().int().nonnegative(),
  title: z.string().min(1),
  description: z.string().optional(),
  lessonCount: z.number().int().nonnegative(),
  lessons: z.array(lessonPreviewSchema).optional(),
});

export const courseSummarySchema = z.object({
  id: z.string().min(1),
  versionId: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  level: courseLevelSchema,
  topic: courseTopicSchema,
  status: z.enum(['published', 'archived']),
  estimatedHours: z.number().positive(),
  totalUnits: z.number().int().nonnegative(),
  totalLessons: z.number().int().nonnegative(),
  keyFocus: z.string(),
  prerequisites: z.array(z.string()),
  objectives: z.array(z.string()),
});

export const courseDetailSchema = courseSummarySchema.extend({
  units: z.array(unitPreviewSchema),
});

export const courseCatalogResponseSchema = z.object({
  courses: z.array(courseSummarySchema),
});

/** Query fields accepted by the public catalog; draft rows are never returned. */
export const courseCatalogQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  level: z.union([courseLevelSchema, z.literal('all')]).optional(),
  topic: z.union([courseTopicSchema, z.literal('all')]).optional(),
  status: z.enum(['all', 'published', 'archived']).default('all'),
});

export const courseDetailResponseSchema = courseDetailSchema;

/** Admin unit authoring schema within course drafts */
export const adminUnitAuthoringSchema = z.object({
  id: z.string().min(1),
  unitIndex: z.number().int().nonnegative(),
  title: z.string().min(1, 'Unit title is required'),
  description: z.string().default(''),
  lessonCount: z.number().int().nonnegative().default(0),
  lessons: z.array(z.any()).optional().default([]),
});

/** Admin course metadata schema (SYS-58, SYS-62) */
export const adminCourseMetadataSchema = z.object({
  id: z.string().min(1),
  versionId: z.string().min(1),
  versionLabel: z.string().min(1, 'Version label is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must consist of lowercase letters, numbers, and hyphens'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().default(''),
  level: courseLevelSchema,
  topic: courseTopicSchema,
  status: courseStatusSchema,
  estimatedHours: z.number().positive('Estimated hours must be a positive number'),
  keyFocus: z.string().min(1, 'Key focus is required'),
  prerequisites: z.array(z.string().min(1)).default([]),
  objectives: z.array(z.string().min(1)).min(1, 'At least one learning objective is required'),
  revision: z.number().int().nonnegative().default(1),
  updatedAt: z.string().optional(),
  author: z.string().optional(),
});

/** Admin full course authoring schema including ordered units */
export const adminCourseDetailSchema = adminCourseMetadataSchema.extend({
  units: z.array(adminUnitAuthoringSchema).default([]),
  totalUnits: z.number().int().nonnegative().optional(),
  totalLessons: z.number().int().nonnegative().optional(),
});

/** Admin courses list item */
export const adminCourseSummarySchema = adminCourseMetadataSchema.extend({
  totalUnits: z.number().int().nonnegative(),
  totalLessons: z.number().int().nonnegative(),
});

/** Admin courses list response */
export const adminCourseListResponseSchema = z.object({
  courses: z.array(adminCourseSummarySchema),
});

