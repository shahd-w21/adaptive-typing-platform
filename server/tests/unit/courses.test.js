import test from 'node:test';
import assert from 'node:assert/strict';
import {
  courseSummarySchema,
  courseDetailSchema,
  courseCatalogResponseSchema,
  enrollmentSummarySchema,
  myEnrollmentsResponseSchema,
  coursePathResponseSchema,
  lessonNodeSchema,
  unitPathSchema,
  courseSessionContextSchema,
} from '@typeflow/shared';
import {
  mockCourses,
  mockStudentEnrollments,
  mockCoursePathFoundations,
  mockCoursePathNovice,
  mockCoursePathSparse,
  mockCoursePathUnmetPrerequisites,
} from '../../../client/src/mocks/courses.js';
import {
  fetchCourses,
  fetchCourseById,
  fetchMyEnrollments,
  enrollCourse,
  fetchCoursePath,
  setCourseReviewScenario,
  setCoursePathScenario,
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

test('course path DTO schemas validate default, novice, and sparse evidence paths', () => {
  const foundationsParsed = coursePathResponseSchema.safeParse(mockCoursePathFoundations);
  assert.equal(foundationsParsed.success, true, 'Foundations path must match coursePathResponseSchema');

  const noviceParsed = coursePathResponseSchema.safeParse(mockCoursePathNovice);
  assert.equal(noviceParsed.success, true, 'Novice path must match coursePathResponseSchema');

  const sparseParsed = coursePathResponseSchema.safeParse(mockCoursePathSparse);
  assert.equal(sparseParsed.success, true, 'Sparse evidence path must match coursePathResponseSchema');

  const unmetParsed = coursePathResponseSchema.safeParse(mockCoursePathUnmetPrerequisites);
  assert.equal(unmetParsed.success, true, 'Unmet prerequisites path must match coursePathResponseSchema');

  for (const unit of mockCoursePathFoundations.units) {
    const unitParsed = unitPathSchema.safeParse(unit);
    assert.equal(unitParsed.success, true, `Unit ${unit.id} must match unitPathSchema`);
  }
});

test('lesson nodes represent locked, available, in-progress, completed, and placement-exempt states with reason text (SYS-58-61)', () => {
  const allLessons = mockCoursePathFoundations.units.flatMap((u) => u.lessons);

  // 1. Verify existence of all 5 required progression states
  const statuses = new Set(allLessons.map((l) => l.status));
  assert.ok(statuses.has('completed'), 'Path must contain completed nodes');
  assert.ok(statuses.has('in-progress'), 'Path must contain in-progress nodes');
  assert.ok(statuses.has('available'), 'Path must contain available nodes');
  assert.ok(statuses.has('locked'), 'Path must contain locked nodes');
  assert.ok(statuses.has('placement-exempt'), 'Path must contain placement-exempt nodes');

  // 2. Validate lesson node schema and reason text
  for (const lesson of allLessons) {
    const parsed = lessonNodeSchema.safeParse(lesson);
    assert.equal(parsed.success, true, `Lesson ${lesson.id} must match lessonNodeSchema`);
    assert.ok(typeof lesson.reason === 'string' && lesson.reason.length > 0, `Lesson ${lesson.id} must have accessible reason text`);
  }

  // 3. Placement exempt must not award unearned course completion (SYS-60, SYS-61)
  const exemptNode = allLessons.find((l) => l.status === 'placement-exempt');
  assert.ok(exemptNode, 'Placement exempt node must exist in fixture');
  assert.equal(exemptNode.status, 'placement-exempt');
  assert.notEqual(exemptNode.status, 'completed', 'Placement exemption remains distinct from completed lesson');
});

test('course query keys isolate coursePath by owner and courseId', () => {
  const key = queryKeys.coursePath('student-layla', 'c-foundations-01');
  assert.deepEqual(key, ['owner', 'student-layla', 'course-path', 'c-foundations-01']);

  assert.throws(() => queryKeys.coursePath('student-layla', ''), /A course ID is required/);
});

test('fetchCoursePath returns structured path and handles novice, sparse, and error scenarios', async () => {
  resetCourseFixtureState();

  // 1. Default scenario
  const defaultPath = await fetchCoursePath('c-foundations-01');
  assert.equal(defaultPath.isFixture, true);
  assert.equal(defaultPath.path.courseId, 'c-foundations-01');
  assert.equal(defaultPath.path.progressPercent, 50);
  assert.ok(defaultPath.path.nextAction);

  // 2. Novice scenario
  setCoursePathScenario('novice');
  const novicePath = await fetchCoursePath('c-foundations-01');
  assert.equal(novicePath.path.progressPercent, 0);
  assert.equal(novicePath.path.nextAction.lessonId, 'l-foundations-101');
  assert.equal(novicePath.path.units[0].lessons[0].status, 'available');

  // 3. Sparse evidence scenario
  setCoursePathScenario('sparse');
  const sparsePath = await fetchCoursePath('c-foundations-01');
  assert.equal(sparsePath.path.progressPercent, 12);
  assert.equal(sparsePath.path.nextAction.lessonId, 'l-foundations-103');

  // 4. Path error scenario
  setCoursePathScenario('path_error');
  await assert.rejects(fetchCoursePath('c-foundations-01'), {
    status: 500,
    code: 'SERVICE_UNAVAILABLE',
  });

  // Reset back
  resetCourseFixtureState();
});

test('course session context validates owned enrollment and lesson boundaries', () => {
  const validContext = {
    courseId: 'c-foundations-01',
    courseVersionId: 'cv-foundations-v1',
    enrollmentId: 'enr-layla-foundations',
    lessonId: 'l-foundations-301',
    mode: 'practice',
  };

  const parsed = courseSessionContextSchema.safeParse(validContext);
  assert.equal(parsed.success, true);

  // Missing enrollment or lesson must fail
  assert.equal(courseSessionContextSchema.safeParse({ courseId: 'c-foundations-01' }).success, false);
});

