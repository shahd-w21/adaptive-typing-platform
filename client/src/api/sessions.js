/**
 * Typed HTTP functions for starting, submitting and recovering practice sessions.
 * Request and response DTOs are validated by the shared API transport.
 */
import { toSessionPayload } from '../features/typing/engine/sessionPayload.js';
import { request } from './client.js';

/**
 * Request a server-assigned practice passage and captured rules.
 *
 * @param {string} csrfToken Authenticated write token from the current auth session.
 * @returns {Promise<object>} Validated server assignment, including its exact text.
 */
export function startPracticeSession(csrfToken) {
  return request('/sessions', {
    method: 'POST',
    csrfToken,
    body: { mode: 'practice' },
  });
}

/**
 * Request a course lesson typing assignment within validated course/lesson bounds.
 *
 * @param {string} csrfToken Authenticated write token from the current auth session.
 * @param {object} [context={}] Course assignment context.
 * @param {string} [context.courseId] Target course ID.
 * @param {string} [context.enrollmentId] Owned enrollment ID.
 * @param {string} [context.lessonId] Target lesson ID.
 * @returns {Promise<object>} Validated server assignment.
 */
export function startCourseSession(csrfToken, { courseId, enrollmentId, lessonId } = {}) {
  const body = { mode: 'practice' };
  if (courseId) body.courseId = courseId;
  if (enrollmentId) body.enrollmentId = enrollmentId;
  if (lessonId) body.lessonId = lessonId;
  return request('/sessions', {
    method: 'POST',
    csrfToken,
    body,
  });
}


/**
 * Submit a recorder snapshot; only events and finishTimeMs are sent in the body.
 *
 * @param {string} sessionId Session ID placed in the URL, never copied into the body.
 * @param {object} recording Canonical submission or recorder snapshot with finishTime.
 * @param {string} csrfToken Authenticated write token from the current auth session.
 * @returns {Promise<object>} Validated official result computed by the server.
 */
export function submitSession(sessionId, recording, csrfToken) {
  return request(
    `/sessions/${encodeURIComponent(sessionId)}/submit`,
    {
      method: 'POST',
      csrfToken,
      body: toSessionPayload(recording),
    },
  );
}

/**
 * Abandon an active owned session without submitting scores or awarding results.
 *
 * @param {string} sessionId Session ID placed in the URL.
 * @param {string} csrfToken Authenticated write token from the current auth session.
 * @returns {Promise<object>} Validated abandonment acknowledgement.
 */
export function abandonSession(sessionId, csrfToken) {
  return request(`/sessions/${encodeURIComponent(sessionId)}/abandon`, {
    method: 'POST',
    csrfToken,
    body: {},
  });
}

/**
 * Read a session's saved assignment/result; recovery reads may be cancelled.
 *
 * @param {string} sessionId Session ID placed in the URL.
 * @param {{signal?: AbortSignal}} [options] Cancellation signal for logout/recovery.
 * @returns {Promise<object>} Validated session detail DTO.
 */
export function fetchSession(sessionId, { signal } = {}) {
  return request(`/sessions/${encodeURIComponent(sessionId)}`, { signal });
}
