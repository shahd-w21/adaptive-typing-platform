import { request, ApiError } from './client.js';
import {
  mockCourses,
  mockStudentEnrollments,
  mockCoursePathFoundations,
  mockCoursePathNovice,
  mockCoursePathSparse,
  mockCoursePathUnmetPrerequisites,
} from '../mocks/courses.js';

/**
 * In-memory state for development fixtures to allow interactive testing of
 * enrollments, course paths and review scenarios without persisting to backend database.
 */
let localEnrollments = [...mockStudentEnrollments];
let activeReviewScenario = 'default'; // 'default' | 'empty_catalog' | 'error_enroll' | 'conflict_enroll' | 'empty_enrollments'
let activeCoursePathScenario = 'default'; // 'default' | 'novice' | 'sparse' | 'unmet_prerequisites' | 'path_error' | 'start_error'

/** Set an active review scenario for manual test verification */
export function setCourseReviewScenario(scenario) {
  activeReviewScenario = scenario;
}

export function getCourseReviewScenario() {
  return activeReviewScenario;
}

export function setCoursePathScenario(scenario) {
  activeCoursePathScenario = scenario;
}

export function getCoursePathScenario() {
  return activeCoursePathScenario;
}

export function resetCourseFixtureState() {
  localEnrollments = [...mockStudentEnrollments];
  activeReviewScenario = 'default';
  activeCoursePathScenario = 'default';
}


/**
 * Fetch published courses catalog with optional client/server filtering.
 *
 * @param {object} [filters={}]
 * @param {string} [filters.search] Keyword filter
 * @param {string} [filters.level] 'all' | 'beginner' | 'intermediate' | 'advanced'
 * @param {string} [filters.topic] 'all' | 'foundations' | 'speed' | 'numbers_symbols' | 'code_prose'
 * @param {string} [filters.status] 'all' | 'published' | 'archived' (default: published)
 * @returns {Promise<{ courses: Array<object>, isFixture: boolean }>}
 */
export async function fetchCourses(filters = {}) {
  // Attempt real endpoint first if configured; handle graceful fixture fallback
  try {
    const data = await request('/courses', { available: false });
    return { courses: data.courses, isFixture: false };
  } catch {
    // Development fixture flow (explicitly flagged)
    if (activeReviewScenario === 'empty_catalog') {
      return { courses: [], isFixture: true };
    }

    let result = mockCourses.filter((c) => c.status !== 'draft');

    // Filter by status if specified, otherwise default to showing published and archived
    if (filters.status && filters.status !== 'all') {
      result = result.filter((c) => c.status === filters.status);
    }

    if (filters.level && filters.level !== 'all') {
      result = result.filter((c) => c.level === filters.level);
    }

    if (filters.topic && filters.topic !== 'all') {
      result = result.filter((c) => c.topic === filters.topic);
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.keyFocus.toLowerCase().includes(q),
      );
    }

    return { courses: result, isFixture: true };
  }
}

/**
 * Fetch a single course by ID or slug with full units/lessons path preview.
 *
 * @param {string} courseId
 * @returns {Promise<{ course: object, isFixture: boolean }>}
 */
export async function fetchCourseById(courseId) {
  try {
    const data = await request(`/courses/${courseId}`, { available: false });
    return { course: data, isFixture: false };
  } catch {
    const found = mockCourses.find(
      (c) => c.id === courseId || c.slug === courseId,
    );
    if (!found || found.status === 'draft') {
      throw new ApiError('Course not found or unavailable.', {
        status: 404,
        code: 'NOT_FOUND',
      });
    }
    return { course: found, isFixture: true };
  }
}

/**
 * Fetch current student's enrolled courses.
 *
 * @returns {Promise<{ enrollments: Array<object>, isFixture: boolean }>}
 */
export async function fetchMyEnrollments() {
  try {
    const data = await request('/my-courses', { available: false });
    return { enrollments: data.enrollments, isFixture: false };
  } catch {
    if (activeReviewScenario === 'empty_enrollments') {
      return { enrollments: [], isFixture: true };
    }
    return { enrollments: [...localEnrollments], isFixture: true };
  }
}

/**
 * Enroll student in a published course.
 *
 * @param {string} courseId Opaque course ID
 * @param {object} [options]
 * @param {string} [options.csrfToken] Required for authenticated server writes
 * @returns {Promise<{ enrollment: object, isFixture: boolean }>}
 */
export async function enrollCourse(courseId, { csrfToken } = {}) {
  try {
    const data = await request(`/courses/${courseId}/enroll`, {
      method: 'POST',
      body: { courseId },
      csrfToken,
      authenticated: true,
      available: false,
    });
    return { enrollment: data, isFixture: false };
  } catch {
    // If not a simulated failure, handle scenario injections
    if (activeReviewScenario === 'error_enroll') {
      throw new ApiError(
        'Server failed to process course enrollment. Please retry.',
        {
          status: 500,
          code: 'SERVICE_UNAVAILABLE',
        },
      );
    }

    const course = mockCourses.find((c) => c.id === courseId);
    if (!course || course.status === 'draft') {
      throw new ApiError('Course not found.', {
        status: 404,
        code: 'NOT_FOUND',
      });
    }

    if (course.status === 'archived') {
      throw new ApiError('Archived courses do not accept new enrollments.', {
        status: 400,
        code: 'INVALID_REQUEST',
      });
    }

    // Check duplicate enrollment (conflict)
    const existing = localEnrollments.find((e) => e.courseId === courseId);
    if (existing || activeReviewScenario === 'conflict_enroll') {
      throw new ApiError(
        'You are already enrolled in this course version.',
        {
          status: 409,
          code: 'CONFLICT',
        },
      );
    }

    // Create opaque new enrollment fixture
    const newEnrollment = {
      id: `enr-layla-${Date.now()}`,
      courseId: course.id,
      courseVersionId: course.versionId,
      status: 'active',
      enrolledAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      completedAt: null,
      progressPercent: 0,
      completedLessonsCount: 0,
      totalLessonsCount: course.totalLessons,
      currentUnit: course.units[0]
        ? {
            id: course.units[0].id,
            title: course.units[0].title,
            index: course.units[0].unitIndex,
          }
        : undefined,
      currentLesson: course.units[0]?.lessons?.[0]
        ? {
            id: course.units[0].lessons[0].id,
            title: course.units[0].lessons[0].title,
            index: course.units[0].lessons[0].lessonIndex,
            type: course.units[0].lessons[0].type,
          }
        : undefined,
      resumeLink: `/courses/${course.id}/path`,
    };

    localEnrollments.push(newEnrollment);
    return { enrollment: newEnrollment, isFixture: true };
  }
}

/**
 * Fetch ordered units, lessons and progress for an enrolled course path.
 *
 * @param {string} courseId Course identifier
 * @param {object} [options]
 * @param {string} [options.ownerId] Student owner ID
 * @returns {Promise<{ path: object, isFixture: boolean }>}
 */
export async function fetchCoursePath(courseId) {
  try {
    const data = await request(
      `/courses/${encodeURIComponent(courseId)}/path`,
      { available: false },
    );
    return { path: data, isFixture: false };
  } catch {
    if (activeCoursePathScenario === 'path_error') {
      throw new ApiError('Failed to load course learning path from server.', {
        status: 500,
        code: 'SERVICE_UNAVAILABLE',
      });
    }

    if (activeCoursePathScenario === 'novice') {
      return { path: mockCoursePathNovice, isFixture: true };
    }

    if (activeCoursePathScenario === 'sparse') {
      return { path: mockCoursePathSparse, isFixture: true };
    }

    if (activeCoursePathScenario === 'unmet_prerequisites') {
      return { path: mockCoursePathUnmetPrerequisites, isFixture: true };
    }

    // Default scenario: if courseId is c-speed-02, return speed path with unmet prereqs; else foundations
    if (courseId === 'c-speed-02') {
      return { path: mockCoursePathUnmetPrerequisites, isFixture: true };
    }

    return { path: mockCoursePathFoundations, isFixture: true };
  }
}

