import test from 'node:test';
import assert from 'node:assert/strict';
import {
  courseSummarySchema,
  courseDetailSchema,
  courseCatalogResponseSchema,
  enrollmentSummarySchema,
  myEnrollmentsResponseSchema,
  adminCourseDetailSchema,
  adminCourseListResponseSchema,
  adminCourseMetadataSchema,
  adminUnitAuthoringSchema,
} from '@typeflow/shared';
import {
  mockCourses,
  mockStudentEnrollments,
  mockAdminCourses,
} from '../../../client/src/mocks/courses.js';
import {
  fetchCourses,
  fetchCourseById,
  fetchMyEnrollments,
  enrollCourse,
  setCourseReviewScenario,
  resetCourseFixtureState,
} from '../../../client/src/api/courses.js';
import {
  fetchAdminCourses,
  fetchAdminCourseById,
  saveAdminCourseDraft,
  createSuccessorDraft,
  archiveCourse,
  setAdminCourseScenario,
  resetAdminCourseFixtureState,
} from '../../../client/src/api/adminCourses.js';
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

test('admin course schemas validate mockAdminCourses, metadata, and ordered units (SYS-58, SYS-62)', () => {
  assert.ok(mockAdminCourses.length > 0, 'mockAdminCourses must not be empty');

  // Verify list summary schema
  const summaries = mockAdminCourses.map((c) => ({
    id: c.id,
    versionId: c.versionId,
    versionLabel: c.versionLabel || 'v1.0.0',
    slug: c.slug,
    title: c.title,
    description: c.description || '',
    level: c.level,
    topic: c.topic,
    status: c.status,
    estimatedHours: c.estimatedHours,
    keyFocus: c.keyFocus,
    prerequisites: c.prerequisites || [],
    objectives: c.objectives || [],
    revision: c.revision || 1,
    updatedAt: c.updatedAt,
    author: c.author,
    totalUnits: c.units ? c.units.length : (c.totalUnits || 0),
    totalLessons: c.units
      ? c.units.reduce((acc, u) => acc + (u.lessons?.length || u.lessonCount || 0), 0)
      : (c.totalLessons || 0),
  }));

  const listParsed = adminCourseListResponseSchema.safeParse({ courses: summaries });
  assert.equal(listParsed.success, true, 'Admin course list must match adminCourseListResponseSchema');

  // Verify detailed schema on each course draft/version
  for (const course of mockAdminCourses) {
    const metaParsed = adminCourseMetadataSchema.safeParse(course);
    assert.equal(
      metaParsed.success,
      true,
      `Course ${course.id} must match adminCourseMetadataSchema`,
    );

    const detailParsed = adminCourseDetailSchema.safeParse(course);
    assert.equal(
      detailParsed.success,
      true,
      `Course ${course.id} must match adminCourseDetailSchema: ${JSON.stringify(detailParsed.error?.issues)}`,
    );

    // Verify ordered units
    for (const unit of course.units || []) {
      const unitParsed = adminUnitAuthoringSchema.safeParse(unit);
      assert.equal(unitParsed.success, true, `Unit ${unit.id} must match adminUnitAuthoringSchema`);
    }
  }

  // Ensure drafts exist in admin mock but never in student mock
  const adminDrafts = mockAdminCourses.filter((c) => c.status === 'draft');
  const studentDrafts = mockCourses.filter((c) => c.status === 'draft');
  assert.ok(adminDrafts.length > 0, 'Admin fixtures must contain drafts');
  assert.equal(studentDrafts.length, 0, 'Student fixtures must never expose drafts');
});

test('admin course query keys isolate admin resources by owner', () => {
  assert.deepEqual(queryKeys.adminCourses('admin-user-1'), [
    'owner',
    'admin-user-1',
    'admin-courses',
    {},
  ]);
  assert.deepEqual(queryKeys.adminCourse('admin-user-1', 'c-draft-code-01'), [
    'owner',
    'admin-user-1',
    'admin-course',
    'c-draft-code-01',
  ]);
  assert.throws(() => queryKeys.adminCourse('admin-user-1', ''), /A course ID is required/);
  assert.throws(() => queryKeys.adminCourses(''), /An authenticated owner ID is required/);
});

test('fetchAdminCourses lists drafts, published versions, and archives with filters', async () => {
  resetAdminCourseFixtureState();

  const all = await fetchAdminCourses();
  assert.equal(all.isFixture, true);
  assert.ok(all.courses.length >= mockAdminCourses.length);

  // Status filters
  const draftsOnly = await fetchAdminCourses({ status: 'draft' });
  assert.ok(draftsOnly.courses.every((c) => c.status === 'draft'));
  assert.ok(draftsOnly.courses.length > 0);

  const publishedOnly = await fetchAdminCourses({ status: 'published' });
  assert.ok(publishedOnly.courses.every((c) => c.status === 'published'));

  const archivedOnly = await fetchAdminCourses({ status: 'archived' });
  assert.ok(archivedOnly.courses.every((c) => c.status === 'archived'));

  // Search filter
  const searchResults = await fetchAdminCourses({ search: 'syntax' });
  assert.ok(searchResults.courses.some((c) => c.slug === 'code-syntax-fundamentals'));
});

test('fetchAdminCourseById returns draft detail and throws 404 for unknown ID', async () => {
  resetAdminCourseFixtureState();

  const draft = await fetchAdminCourseById('c-draft-code-01');
  assert.equal(draft.isFixture, true);
  assert.equal(draft.course.id, 'c-draft-code-01');
  assert.equal(draft.course.status, 'draft');
  assert.ok(draft.course.units.length > 0);

  await assert.rejects(fetchAdminCourseById('non-existent-course-id'), {
    status: 404,
    code: 'NOT_FOUND',
  });
});

test('saveAdminCourseDraft creates new draft, updates draft, and enforces stale-edit concurrency (SYS-62)', async () => {
  resetAdminCourseFixtureState();

  // 1. Create a brand new draft
  const newDraftData = {
    title: 'Testing and QA Typing',
    slug: 'testing-qa-typing',
    versionLabel: 'v1.0.0-draft',
    description: 'Drills for test frameworks, assertions, and edge case keywords.',
    level: 'intermediate',
    topic: 'code_prose',
    status: 'draft',
    estimatedHours: 2.5,
    keyFocus: 'Assertions, Mocking, and Test Syntax',
    prerequisites: ['Foundations'],
    objectives: ['Type assert and describe blocks with 98% accuracy'],
    revision: 1,
    units: [
      {
        id: 'u-qa-01',
        unitIndex: 1,
        title: 'Assertion Drills',
        description: 'Common assert methods and expect statements.',
        lessonCount: 2,
        lessons: [],
      },
    ],
  };

  const created = await saveAdminCourseDraft(newDraftData);
  assert.equal(created.isFixture, true);
  assert.ok(created.course.id.startsWith('c-draft-'));
  assert.equal(created.course.title, 'Testing and QA Typing');
  assert.equal(created.course.revision, 1);

  // 2. Update existing draft
  const updatedData = {
    ...created.course,
    description: 'Updated description for testing curriculum.',
  };
  const updated = await saveAdminCourseDraft(updatedData);
  assert.equal(updated.course.description, 'Updated description for testing curriculum.');
  assert.equal(updated.course.revision, 2);

  // 3. Concurrency check: saving with stale revision must reject with 409 STALE_EDIT_CONFLICT
  const staleData = {
    ...created.course,
    revision: 1, // Stale revision
    title: 'Stale Title Overwrite',
  };
  await assert.rejects(
    saveAdminCourseDraft(staleData, 'csrf-mock', { forceSave: false }),
    (err) => err.status === 409 && err.code === 'STALE_EDIT_CONFLICT',
  );

  // 4. Force save overrides conflict when explicitly instructed
  const forced = await saveAdminCourseDraft(staleData, 'csrf-mock', { forceSave: true });
  assert.ok(forced.course.revision > 2);

  // 5. Enforce immutability: published courses cannot be saved directly
  const publishedSave = {
    id: 'c-foundations-01',
    title: 'Attempting Direct Edit to Published',
    slug: 'touch-typing-foundations',
    versionLabel: 'v1.0.0',
    level: 'beginner',
    topic: 'foundations',
    status: 'published',
    estimatedHours: 4.5,
    keyFocus: 'Home row',
    prerequisites: [],
    objectives: ['Test'],
    revision: 3,
    units: [],
  };
  await assert.rejects(
    saveAdminCourseDraft(publishedSave),
    (err) => err.status === 400 && err.code === 'IMMUTABLE_VERSION',
  );
});

test('createSuccessorDraft branches a new draft from an immutable published course (SYS-62)', async () => {
  resetAdminCourseFixtureState();

  const successor = await createSuccessorDraft('c-foundations-01');
  assert.equal(successor.isFixture, true);
  assert.equal(successor.course.status, 'draft');
  assert.ok(successor.course.versionLabel.includes('-draft'));
  assert.ok(successor.course.versionLabel.startsWith('v2.'));
  assert.equal(successor.course.revision, 1);

  // Original published course remains published and intact
  const original = await fetchAdminCourseById('c-foundations-01');
  assert.equal(original.course.status, 'published');
  assert.equal(original.course.versionLabel, 'v1.0.0');
});

test('archiveCourse marks course as archived', async () => {
  resetAdminCourseFixtureState();

  const archived = await archiveCourse('c-draft-code-01');
  assert.equal(archived.course.status, 'archived');

  const fetched = await fetchAdminCourseById('c-draft-code-01');
  assert.equal(fetched.course.status, 'archived');
});

test('admin course reviewer scenarios: empty list, conflict 409, and server error 500', async () => {
  resetAdminCourseFixtureState();

  // Scenario 1: Empty list
  setAdminCourseScenario('empty');
  const emptyRes = await fetchAdminCourses();
  assert.equal(emptyRes.courses.length, 0);

  // Scenario 2: Save conflict
  setAdminCourseScenario('conflict');
  const draftToSave = {
    id: 'c-draft-speed-v2',
    slug: 'speed-and-fluency-v2',
    versionLabel: 'v2.0.0-draft',
    title: 'Speed v2',
    level: 'advanced',
    topic: 'speed',
    status: 'draft',
    estimatedHours: 4.0,
    keyFocus: 'Burst rhythm',
    prerequisites: [],
    objectives: ['Speed'],
    revision: 1,
    units: [],
  };
  await assert.rejects(
    saveAdminCourseDraft(draftToSave),
    (err) => err.status === 409 && err.code === 'STALE_EDIT_CONFLICT',
  );

  // Scenario 3: Server error
  setAdminCourseScenario('serverError');
  await assert.rejects(
    fetchAdminCourses(),
    (err) => err.status === 500 && err.code === 'SERVER_ERROR',
  );

  // Reset back to default
  resetAdminCourseFixtureState();
  const resetRes = await fetchAdminCourses();
  assert.ok(resetRes.courses.length > 0);
});

test('translation dictionaries contain matching English and Arabic adminCourses keys', () => {
  assert.ok(en.adminCourses, 'en.json must have adminCourses dictionary');
  assert.ok(ar.adminCourses, 'ar.json must have adminCourses dictionary');

  const enKeys = Object.keys(en.adminCourses).sort();
  const arKeys = Object.keys(ar.adminCourses).sort();

  assert.deepEqual(enKeys, arKeys, 'Every adminCourses translation key in en.json must exist in ar.json');
  assert.ok(en.nav.adminCourses && ar.nav.adminCourses, 'nav.adminCourses must exist in both locales');
  assert.ok(en.adminNav.courses && ar.adminNav.courses, 'adminNav.courses must exist in both locales');
});
