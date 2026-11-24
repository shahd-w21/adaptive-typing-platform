/**
 * Protected course authoring and administration API client.
 * Handles course drafts, metadata editing, ordered unit authoring,
 * versioning, stale-edit concurrency conflicts, and immutable publications (SYS-58, SYS-62).
 */
import { request, ApiError } from './client.js';
import { mockAdminCourses } from '../mocks/courses.js';
import {
  adminCourseDetailSchema,
  adminCourseListResponseSchema,
} from '@typeflow/shared';

// In-memory working state for development fixtures to allow full interactive testing
let localAdminCourses = JSON.parse(JSON.stringify(mockAdminCourses));
let activeAdminScenario = 'default'; // 'default' | 'empty' | 'conflict' | 'serverError'

/** Configure active reviewer scenario for manual/automated verification */
export function setAdminCourseScenario(scenario) {
  activeAdminScenario = scenario;
}

export function getAdminCourseScenario() {
  return activeAdminScenario;
}

export function resetAdminCourseFixtureState() {
  localAdminCourses = JSON.parse(JSON.stringify(mockAdminCourses));
  activeAdminScenario = 'default';
}

/**
 * Fetch all admin courses including drafts, published versions, and archives.
 *
 * @param {object} [filters={}]
 * @param {string} [filters.search] Keyword filter for title, slug, description, or focus
 * @param {string} [filters.status] 'all' | 'draft' | 'published' | 'archived'
 * @param {string} [filters.level] 'all' | 'beginner' | 'intermediate' | 'advanced'
 * @param {string} [filters.topic] 'all' | 'foundations' | 'speed' | 'numbers_symbols' | 'code_prose'
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ courses: Array<object>, isFixture: boolean }>}
 */
export async function fetchAdminCourses(filters = {}, signal) {
  try {
    const data = await request('/admin/courses', { available: false, signal });
    return { courses: data.courses, isFixture: false };
  } catch (err) {
    if (err?.name === 'AbortError') throw err;

    if (activeAdminScenario === 'serverError') {
      throw new ApiError('Failed to load admin courses from server.', {
        status: 500,
        code: 'SERVER_ERROR',
      });
    }

    if (activeAdminScenario === 'empty') {
      return { courses: [], isFixture: true };
    }

    let result = [...localAdminCourses];

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
          c.slug.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.keyFocus && c.keyFocus.toLowerCase().includes(q)),
      );
    }

    // Map to summary structure with totalUnits and totalLessons
    const summaries = result.map((course) => ({
      id: course.id,
      versionId: course.versionId,
      versionLabel: course.versionLabel || 'v1.0.0',
      slug: course.slug,
      title: course.title,
      description: course.description || '',
      level: course.level,
      topic: course.topic,
      status: course.status,
      estimatedHours: course.estimatedHours,
      keyFocus: course.keyFocus,
      prerequisites: course.prerequisites || [],
      objectives: course.objectives || [],
      revision: course.revision || 1,
      updatedAt: course.updatedAt || new Date().toISOString(),
      author: course.author || 'Admin',
      totalUnits: course.units ? course.units.length : (course.totalUnits || 0),
      totalLessons: course.units
        ? course.units.reduce((acc, u) => acc + (u.lessons?.length || u.lessonCount || 0), 0)
        : (course.totalLessons || 0),
    }));

    // Validate against shared response contract
    const parsed = adminCourseListResponseSchema.safeParse({ courses: summaries });
    if (!parsed.success) {
      console.warn('Admin course list schema validation warning:', parsed.error);
    }

    return { courses: summaries, isFixture: true };
  }
}

/**
 * Fetch a full course draft or published course detail by ID.
 *
 * @param {string} courseId
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ course: object, isFixture: boolean }>}
 */
export async function fetchAdminCourseById(courseId, signal) {
  try {
    const data = await request(`/admin/courses/${encodeURIComponent(courseId)}`, {
      available: false,
      signal,
    });
    return { course: data, isFixture: false };
  } catch (err) {
    if (err?.name === 'AbortError') throw err;

    if (activeAdminScenario === 'serverError') {
      throw new ApiError('Failed to load course details from server.', {
        status: 500,
        code: 'SERVER_ERROR',
      });
    }

    const found = localAdminCourses.find((c) => c.id === courseId || c.slug === courseId);
    if (!found) {
      throw new ApiError('Course not found or unavailable.', {
        status: 404,
        code: 'NOT_FOUND',
      });
    }

    // Ensure full unit and metadata representation
    const detail = {
      ...found,
      versionLabel: found.versionLabel || 'v1.0.0',
      revision: found.revision || 1,
      prerequisites: found.prerequisites || [],
      objectives: found.objectives || [],
      units: (found.units || []).map((u, idx) => ({
        id: u.id || `u-${idx + 1}`,
        unitIndex: u.unitIndex ?? (idx + 1),
        title: u.title || `Unit ${idx + 1}`,
        description: u.description || '',
        lessonCount: u.lessonCount ?? (u.lessons?.length || 0),
        lessons: u.lessons || [],
      })),
      totalUnits: found.units ? found.units.length : 0,
      totalLessons: found.units
        ? found.units.reduce((acc, u) => acc + (u.lessons?.length || u.lessonCount || 0), 0)
        : 0,
    };

    return { course: detail, isFixture: true };
  }
}

/**
 * Save or update a course draft with optimistic concurrency checks (SYS-58, SYS-62).
 * Rejects stale edits if another author has updated the draft (HTTP 409).
 *
 * @param {object} courseData
 * @param {string} [csrfToken]
 * @param {object} [options={}]
 * @param {boolean} [options.forceSave=false] Overwrite conflict if author explicitly confirms
 * @returns {Promise<{ course: object, isFixture: boolean }>}
 */
export async function saveAdminCourseDraft(courseData, csrfToken, options = {}) {
  try {
    const data = await request('/admin/courses', {
      method: courseData.id ? 'PUT' : 'POST',
      body: courseData,
      csrfToken,
      available: false,
    });
    return { course: data, isFixture: false };
  } catch {
    if (activeAdminScenario === 'serverError') {
      throw new ApiError('Server error while saving course draft. Please retry.', {
        status: 500,
        code: 'SERVER_ERROR',
      });
    }

    // Stale-edit conflict simulation or detection (SYS-62)
    if (activeAdminScenario === 'conflict') {
      throw new ApiError(
        'Stale edit conflict: another administrator updated this course draft.',
        {
          status: 409,
          code: 'STALE_EDIT_CONFLICT',
          serverRevision: (courseData.revision || 1) + 1,
        },
      );
    }

    // Check for real stale revision in local fixture state
    if (courseData.id) {
      const existing = localAdminCourses.find((c) => c.id === courseData.id);
      if (existing) {
        // Enforce immutability of published courses
        if (existing.status === 'published' || existing.status === 'archived') {
          throw new ApiError(
            'Published and archived course versions are immutable (SYS-62). Create a successor draft to apply changes.',
            { status: 400, code: 'IMMUTABLE_VERSION' },
          );
        }

        // Concurrency check unless forceSave is explicitly requested
        if (!options.forceSave && existing.revision > (courseData.revision || 1)) {
          throw new ApiError(
            `Stale edit conflict: course draft was updated to revision ${existing.revision}.`,
            {
              status: 409,
              code: 'STALE_EDIT_CONFLICT',
              serverRevision: existing.revision,
            },
          );
        }
      }
    }

    const candidate = {
      ...courseData,
      id: courseData.id || `c-draft-${Date.now().toString(36)}`,
      versionId: courseData.versionId || `cv-${courseData.slug}-v1-draft`,
      versionLabel: courseData.versionLabel || 'v1.0.0-draft',
      revision: courseData.revision || 1,
      units: courseData.units || [],
    };

    // Validate the incoming draft schema
    const validated = adminCourseDetailSchema.safeParse(candidate);
    if (!validated.success) {
      const firstIssue = validated.error.issues[0];
      throw new ApiError(firstIssue?.message || 'Invalid course draft data.', {
        status: 422,
        code: 'VALIDATION_FAILED',
        details: validated.error.flatten(),
      });
    }

    const now = new Date().toISOString();
    let savedCourse;

    if (courseData.id && localAdminCourses.some((c) => c.id === courseData.id)) {
      // Update existing draft
      const idx = localAdminCourses.findIndex((c) => c.id === courseData.id);
      const prev = localAdminCourses[idx];
      savedCourse = {
        ...prev,
        ...candidate,
        revision: options.forceSave
          ? Math.max(prev.revision + 1, (courseData.revision || 1) + 1)
          : (courseData.revision || 1) + 1,
        updatedAt: now,
      };
      localAdminCourses[idx] = savedCourse;
    } else {
      // Create new draft
      savedCourse = {
        ...candidate,
        status: 'draft',
        revision: 1,
        author: candidate.author || 'Admin Author',
        updatedAt: now,
      };
      localAdminCourses.unshift(savedCourse);
    }

    return { course: savedCourse, isFixture: true };
  }
}

/**
 * Create a successor draft branched from an existing published course (SYS-62).
 * Preserves the original immutable published course and creates a new draft version.
 *
 * @param {string} courseId
 * @param {string} [csrfToken]
 * @returns {Promise<{ course: object, isFixture: boolean }>}
 */
export async function createSuccessorDraft(courseId, csrfToken) {
  try {
    const data = await request(`/admin/courses/${encodeURIComponent(courseId)}/successor`, {
      method: 'POST',
      csrfToken,
      available: false,
    });
    return { course: data, isFixture: false };
  } catch {
    if (activeAdminScenario === 'serverError') {
      throw new ApiError('Failed to create successor draft on server.', {
        status: 500,
        code: 'SERVER_ERROR',
      });
    }

    const source = localAdminCourses.find((c) => c.id === courseId || c.slug === courseId);
    if (!source) {
      throw new ApiError('Source course not found.', {
        status: 404,
        code: 'NOT_FOUND',
      });
    }

    const match = source.versionLabel?.match(/v?(\d+)/);
    const currentMajor = match ? parseInt(match[1], 10) : 1;
    const nextMajor = isNaN(currentMajor) ? 2 : currentMajor + 1;
    const successorVersionLabel = `v${nextMajor}.0.0-draft`;
    const newId = `c-draft-${source.slug}-v${nextMajor}`;

    const successorDraft = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      versionId: `cv-${source.slug}-v${nextMajor}-draft`,
      versionLabel: successorVersionLabel,
      title: `${source.title} (${successorVersionLabel})`,
      status: 'draft',
      revision: 1,
      author: 'Admin Author',
      updatedAt: new Date().toISOString(),
      units: (source.units || []).map((u, i) => ({
        ...u,
        id: `u-${newId}-${i + 1}`,
      })),
    };

    localAdminCourses.unshift(successorDraft);
    return { course: successorDraft, isFixture: true };
  }
}

/**
 * Archive an existing course draft or published version (SYS-62).
 *
 * @param {string} courseId
 * @param {string} [csrfToken]
 * @returns {Promise<{ course: object, isFixture: boolean }>}
 */
export async function archiveCourse(courseId, csrfToken) {
  try {
    const data = await request(`/admin/courses/${encodeURIComponent(courseId)}/archive`, {
      method: 'POST',
      csrfToken,
      available: false,
    });
    return { course: data, isFixture: false };
  } catch {
    const found = localAdminCourses.find((c) => c.id === courseId || c.slug === courseId);
    if (!found) {
      throw new ApiError('Course not found to archive.', {
        status: 404,
        code: 'NOT_FOUND',
      });
    }

    found.status = 'archived';
    found.updatedAt = new Date().toISOString();
    return { course: found, isFixture: true };
  }
}
