import { request } from './client.js';

export const startPracticeSession = csrfToken => request('/sessions', {
  method: 'POST', csrfToken, body: JSON.stringify({ mode: 'practice' }),
});

export const submitSession = (sessionId, payload, csrfToken) => request(`/sessions/${encodeURIComponent(sessionId)}/submit`, {
  method: 'POST', csrfToken, body: JSON.stringify(payload),
});

export const abandonSession = (sessionId, csrfToken) => request(`/sessions/${encodeURIComponent(sessionId)}/abandon`, {
  method: 'POST', csrfToken, body: JSON.stringify({}),
});

// Reads may be cancelled during logout/recovery; writes are never auto-retried.
export const fetchSession = (sessionId, { signal } = {}) =>
  request(`/sessions/${encodeURIComponent(sessionId)}`, { signal });
