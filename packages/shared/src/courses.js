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
