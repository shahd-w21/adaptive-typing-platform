import test from 'node:test';
import assert from 'node:assert/strict';
import {
  courseSummarySchema,
  courseDetailSchema,
  courseCatalogResponseSchema,
  enrollmentSummarySchema,
  myEnrollmentsResponseSchema,
} from '@typeflow/shared';
import {
  mockCourses,
  mockStudentEnrollments,
} from '../../../client/src/mocks/courses.js';
import {
  fetchCourses,
  fetchCourseById,
  fetchMyEnrollments,
  enrollCourse,
  setCourseReviewScenario,
  resetCourseFixtureState,
} from '../../../client/src/api/courses.js';
import { queryKeys } from '../../../client/src/lib/queryKeys.js';
import en from '../../../client/src/i18n/dictionaries/en.json' with { type: 'json' };
import ar from '../../../client/src/i18n/dictionaries/ar.json' with { type: 'json' };

test('course DTO schemas validate mock catalog and details', () => {
  // Catalog schema validation
  const catalogParsed = courseCatalogResponseSchema.safeParse({ courses: mockCourses });
  assert.equal(catalogParsed.success, true, 'Mock courses must match courseCatalogResponseSchema');

  // Individual detail and summary validation
  for (const course of mockCourses) {
    const summaryParsed = courseSummarySchema.safeParse(course);
    assert.equal(summaryParsed.success, true, `Course ${course.id} must match courseSummarySchema`);
    const detailParsed = courseDetailSchema.safeParse(course);
    assert.equal(detailParsed.success, true, `Course ${course.id} must match courseDetailSchema`);
  }
});

test('drafts never appear in student fixture sets (SYS-57)', () => {
  const drafts = mockCourses.filter((c) => c.status === 'draft');
  assert.equal(drafts.length, 0, 'Student mock fixtures must not contain any draft courses');
});

test('enrollment schemas validate student enrollment fixtures (SYS-57, SYS-61)', () => {
  const enrollmentsParsed = myEnrollmentsResponseSchema.safeParse({
    enrollments: mockStudentEnrollments,
  });
  assert.equal(
    enrollmentsParsed.success,
    true,
    'Mock enrollments must match myEnrollmentsResponseSchema',
  );

  for (const enr of mockStudentEnrollments) {
    const parsed = enrollmentSummarySchema.safeParse(enr);
    assert.equal(parsed.success, true, `Enrollment ${enr.id} must match enrollmentSummarySchema`);
    assert.ok(typeof enr.id === 'string' && enr.id.length > 0, 'Enrollment ID must be opaque string');
    assert.ok(typeof enr.courseVersionId === 'string', 'Course version ID must be opaque string');
  }
});

test('course query keys isolate public catalog, details, and owner enrollments', () => {
  assert.deepEqual(queryKeys.courses(), ['public', 'courses', {}]);
  assert.deepEqual(queryKeys.course('c-foundations-01'), ['public', 'course', 'c-foundations-01']);
  assert.deepEqual(queryKeys.myCourses('user-1'), ['owner', 'user-1', 'my-courses', {}]);
  assert.throws(() => queryKeys.course(''), /A course ID is required/);
});

test('fetchCourses filters catalog by level, topic, and search keywords', async () => {
  resetCourseFixtureState();

  const all = await fetchCourses();
  assert.equal(all.isFixture, true);
  assert.equal(all.courses.length, mockCourses.length);

  const beginner = await fetchCourses({ level: 'beginner' });
  assert.ok(beginner.courses.every((c) => c.level === 'beginner'));

  const speed = await fetchCourses({ topic: 'speed' });
  assert.ok(speed.courses.every((c) => c.topic === 'speed'));

  const search = await fetchCourses({ search: 'syntax' });
  assert.ok(search.courses.length > 0);
  assert.ok(search.courses.some((c) => c.id === 'c-coding-04'));
});

test('fetchCourseById returns full course detail or throws 404 for unknown ID', async () => {
  const found = await fetchCourseById('c-foundations-01');
  assert.equal(found.isFixture, true);
  assert.equal(found.course.id, 'c-foundations-01');
  assert.ok(found.course.units.length > 0);

  await assert.rejects(fetchCourseById('non-existent-course-id'), {
    status: 404,
    code: 'NOT_FOUND',
  });
});

test('review scenarios: empty catalog, conflict 409, server error, and empty enrollments', async () => {
  resetCourseFixtureState();

  // 1. Empty catalog scenario
  setCourseReviewScenario('empty_catalog');
  const emptyRes = await fetchCourses();
  assert.equal(emptyRes.courses.length, 0);

  // 2. Empty enrollments scenario
  setCourseReviewScenario('empty_enrollments');
  const emptyEnr = await fetchMyEnrollments();
  assert.equal(emptyEnr.enrollments.length, 0);

  // 3. Conflict duplicate enrollment scenario
  setCourseReviewScenario('conflict_enroll');
  await assert.rejects(enrollCourse('c-speed-02'), {
    status: 409,
    code: 'CONFLICT',
  });

  // 4. Server error scenario
  setCourseReviewScenario('error_enroll');
  await assert.rejects(enrollCourse('c-coding-04'), {
    status: 500,
    code: 'SERVICE_UNAVAILABLE',
  });

  // Reset back to default
  resetCourseFixtureState();
  const resetRes = await fetchCourses();
  assert.ok(resetRes.courses.length > 0);
});

test('translation dictionaries contain matching English and Arabic courses keys', () => {
  assert.ok(en.courses, 'en.json must have courses dictionary');
  assert.ok(ar.courses, 'ar.json must have courses dictionary');

  const enKeys = Object.keys(en.courses).sort();
  const arKeys = Object.keys(ar.courses).sort();

  assert.deepEqual(enKeys, arKeys, 'Every course translation key in en.json must exist in ar.json');

  assert.ok(en.nav.courses && ar.nav.courses, 'nav.courses must exist in both locales');
  assert.ok(en.nav.myCourses && ar.nav.myCourses, 'nav.myCourses must exist in both locales');
});
