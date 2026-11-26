/**
 * Student course API operations. Published versions are read-only snapshots;
 * enrollment writes capture the selected version and are safe to retry.
 */
import {
  courseCatalogResponseSchema,
  courseDetailSchema,
  courseSummarySchema,
  myEnrollmentsResponseSchema,
  enrollmentSummarySchema,
} from '@typeflow/shared';
import { createCourseRepository } from './repository.js';
import { HttpError } from '../../middleware/validate.js';

const isUuid = value => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

/** Read lesson preview data from a captured version, treating malformed absence as empty. */
function unitsOf(version) {
  return Array.isArray(version.units) ? version.units : [];
}

/** Convert persistence rows into the public, validated course summary DTO. */
function summaryOf(course, version) {
  const units = unitsOf(version);
  const lessons = units.flatMap(unit => Array.isArray(unit.lessons) ? unit.lessons : []);
  return courseSummarySchema.parse({
    id: course.id,
    versionId: version.id,
    slug: course.slug,
    title: version.title,
    description: version.description,
    level: version.level,
    topic: version.topic,
    status: version.status === 'archived' ? 'archived' : 'published',
    estimatedHours: version.estimatedHours,
    totalUnits: units.length,
    totalLessons: lessons.length,
    keyFocus: version.keyFocus,
    prerequisites: version.prerequisites,
    objectives: version.objectives,
  });
}

/** Select the first unfinished lesson for display; this does not mark progress. */
function currentLesson(version, completedLessonIds) {
  const units = unitsOf(version);
  for (const unit of units) {
    const lessons = Array.isArray(unit.lessons) ? unit.lessons : [];
    const lesson = lessons.find(item => !completedLessonIds.includes(item.id));
    if (lesson) return { unit, lesson };
  }
  return null;
}

/** Build the public enrollment view using only saved lesson completion IDs. */
function enrollmentOf(enrollment) {
  const version = enrollment.courseVersion;
  const units = unitsOf(version);
  const lessons = units.flatMap(unit => Array.isArray(unit.lessons) ? unit.lessons : []);
  const completedLessonIds = enrollment.completedLessonIds;
  const completedLessonsCount = lessons.filter(lesson => completedLessonIds.includes(lesson.id)).length;
  const progressPercent = lessons.length === 0
    ? 0
    : Math.floor((completedLessonsCount / lessons.length) * 100);
  const next = currentLesson(version, completedLessonIds);

  return enrollmentSummarySchema.parse({
    id: enrollment.id,
    courseId: enrollment.courseId,
    courseVersionId: enrollment.courseVersionId,
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt.toISOString(),
    lastActiveAt: enrollment.lastActiveAt.toISOString(),
    completedAt: enrollment.completedAt?.toISOString() ?? null,
    progressPercent,
    completedLessonsCount,
    totalLessonsCount: lessons.length,
    course: summaryOf(enrollment.course, version),
    ...(next ? {
      currentUnit: {
        id: next.unit.id,
        title: next.unit.title,
        index: next.unit.unitIndex,
      },
      currentLesson: {
        id: next.lesson.id,
        title: next.lesson.title,
        index: next.lesson.lessonIndex,
        type: next.lesson.type,
      },
    } : {}),
    resumeLink: `/courses/${enrollment.courseId}`,
  });
}

/**
 * Build student-facing catalog and enrollment operations.
 * @param {object} dependencies Prisma database client and optional clock.
 * @returns {object} Validated course API operations.
 */
export function createCourseService({ database, now = () => new Date() }) {
  const repository = createCourseRepository(database);

  return {
    /** Return searchable public snapshots, excluding drafts by construction. */
    async catalog(filters) {
      const rows = await repository.listPublished(filters);
      const courses = rows
        .map(course => course.versions[0] ? summaryOf(course, course.versions[0]) : null)
        .filter(Boolean);
      return courseCatalogResponseSchema.parse({ courses });
    },

    /** Return a published detail, or an archived read-only snapshot. */
    async detail(identifier) {
      const course = await repository.findByIdOrSlug(identifier);
      if (!course) throw new HttpError(404, 'NOT_FOUND', 'Course not found');

      const version = course.versions.find(item => item.status === 'published')
        ?? course.versions.find(item => item.status === 'archived');
      if (!version) throw new HttpError(404, 'NOT_FOUND', 'Course not found');

      const summary = summaryOf(course, version);
      return courseDetailSchema.parse({ ...summary, units: unitsOf(version) });
    },

    /** List the signed-in user's enrollment summaries and captured versions. */
    async myEnrollments(userId) {
      const rows = await repository.listEnrollments(userId);
      return myEnrollmentsResponseSchema.parse({ enrollments: rows.map(enrollmentOf) });
    },

    /** Create or recover one enrollment for the user's selected published version. */
    async enroll(userId, identifier) {
      const course = await repository.findByIdOrSlug(identifier);
      if (!course) throw new HttpError(404, 'NOT_FOUND', 'Course not found');
      const version = course.versions.find(item => item.status === 'published');
      if (!version) throw new HttpError(409, 'COURSE_UNAVAILABLE', 'Course is not open for enrollment');

      const existing = await repository.findEnrollmentForVersion(userId, version.id);
      if (existing) return { enrollment: enrollmentOf(existing) };

      try {
        const timestamp = now();
        const created = await repository.createEnrollment({
          userId,
          courseId: course.id,
          courseVersionId: version.id,
          status: 'active',
          enrolledAt: timestamp,
          lastActiveAt: timestamp,
        });
        return { enrollment: enrollmentOf(created) };
      } catch (error) {
        // The compound unique index makes concurrent identical enrollments idempotent.
        if (error.code !== 'P2002') throw error;
        const winner = await repository.findEnrollmentForVersion(userId, version.id);
        if (!winner) throw error;
        return { enrollment: enrollmentOf(winner) };
      }
    },

    /** Read an enrollment snapshot only after an ownership-scoped database lookup. */
    async ownedPath(userId, enrollmentId) {
      if (!isUuid(enrollmentId)) throw new HttpError(400, 'INVALID_REQUEST', 'Invalid enrollment identifier');
      const enrollment = await repository.findOwnedEnrollment(userId, enrollmentId);
      if (!enrollment) throw new HttpError(404, 'NOT_FOUND', 'Enrollment not found');
      return {
        enrollment: enrollmentOf(enrollment),
        course: courseDetailSchema.parse({
          ...summaryOf(enrollment.course, enrollment.courseVersion),
          units: unitsOf(enrollment.courseVersion),
        }),
      };
    },
  };
}
