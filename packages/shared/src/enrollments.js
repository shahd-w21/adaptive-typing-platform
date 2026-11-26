import { z } from 'zod';

export const enrollmentStatusSchema = z.enum(['active', 'completed', 'paused']);

export const enrollmentSummarySchema = z.object({
  id: z.string().min(1),
  courseId: z.string().min(1),
  courseVersionId: z.string().min(1),
  status: enrollmentStatusSchema,
  enrolledAt: z.string(),
  lastActiveAt: z.string(),
  completedAt: z.string().nullable().optional(),
  progressPercent: z.number().min(0).max(100),
  completedLessonsCount: z.number().int().nonnegative(),
  totalLessonsCount: z.number().int().nonnegative(),
  currentUnit: z
    .object({
      id: z.string(),
      title: z.string(),
      index: z.number(),
    })
    .optional(),
  currentLesson: z
    .object({
      id: z.string(),
      title: z.string(),
      index: z.number(),
      type: z.string().optional(),
    })
    .optional(),
  resumeLink: z.string().optional(),
});

export const myEnrollmentsResponseSchema = z.object({
  enrollments: z.array(enrollmentSummarySchema),
});

export const enrollCourseRequestSchema = z.object({
  courseId: z.string().min(1),
});
