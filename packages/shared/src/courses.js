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

/**
 * Node progression states required by SYS-58-61 for course learning paths:
 * - locked: Prerequisites unmet
 * - available: Ready to begin
 * - in-progress: Active current lesson
 * - completed: Official server replay passed
 * - placement-exempt: Verified competence by initial diagnostic (distinct from completed/mastered)
 */
export const lessonNodeStatusSchema = z.enum([
  'locked',
  'available',
  'in-progress',
  'completed',
  'placement-exempt',
]);

export const lessonNodeSchema = z.object({
  id: z.string().min(1),
  lessonIndex: z.number().int().nonnegative(),
  title: z.string().min(1),
  type: z.enum(['lesson', 'practice', 'checkpoint', 'review']),
  status: lessonNodeStatusSchema,
  reason: z.string().optional(),
  keysIntroduced: z.array(z.string()).default([]),
  completionCriteria: z
    .object({
      minAccuracy: z.number().min(0).max(100).optional(),
      targetWpm: z.number().nonnegative().optional(),
    })
    .optional(),
  isNextAction: z.boolean().default(false),
});

export const unitPathSchema = z.object({
  id: z.string().min(1),
  unitIndex: z.number().int().nonnegative(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['locked', 'available', 'in-progress', 'completed']),
  lessonCount: z.number().int().nonnegative(),
  completedLessonsCount: z.number().int().nonnegative(),
  lessons: z.array(lessonNodeSchema),
});

export const nextActionSchema = z.object({
  lessonId: z.string().min(1),
  unitId: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(['lesson', 'practice', 'checkpoint', 'review']),
  actionLabel: z.string(),
  reason: z.string(),
});

export const coursePathResponseSchema = z.object({
  courseId: z.string().min(1),
  courseVersionId: z.string().min(1),
  courseTitle: z.string().min(1),
  enrollmentId: z.string().min(1),
  status: z.enum(['active', 'completed', 'paused']),
  progressPercent: z.number().min(0).max(100),
  completedLessonsCount: z.number().int().nonnegative(),
  totalLessonsCount: z.number().int().nonnegative(),
  placementExemptionsCount: z.number().int().nonnegative().default(0),
  nextAction: nextActionSchema.nullable(),
  units: z.array(unitPathSchema),
});

export const courseSessionContextSchema = z.object({
  courseId: z.string().min(1),
  courseVersionId: z.string().optional(),
  enrollmentId: z.string().min(1),
  lessonId: z.string().min(1),
  mode: z.string().default('practice'),
});

