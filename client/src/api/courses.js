import { request } from './client.js';


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
  const data = await request('/courses', {
    available: false,
    query: filters,
  });
  return { courses: data.courses, isFixture: false };
}

/**
 * Fetch a single course by ID or slug with full units/lessons path preview.
 *
 * @param {string} courseId
 * @returns {Promise<{ course: object, isFixture: boolean }>}
 */
export async function fetchCourseById(courseId) {
  const data = await request(`/courses/${courseId}`, { available: false });
  return { course: data, isFixture: false };
}

/**
 * Fetch current student's enrolled courses.
 *
 * @returns {Promise<{ enrollments: Array<object>, isFixture: boolean }>}
 */
export async function fetchMyEnrollments() {
  const data = await request('/my-courses', { available: false });
  return { enrollments: data.enrollments, isFixture: false };
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
  const data = await request(`/courses/${courseId}/enroll`, {
    method: 'POST',
    body: { courseId },
    csrfToken,
    authenticated: true,
    available: false,
  });
  return { enrollment: data, isFixture: false };
}
