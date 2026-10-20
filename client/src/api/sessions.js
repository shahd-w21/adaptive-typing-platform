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

export const fetchSession = sessionId => request(`/sessions/${encodeURIComponent(sessionId)}`);
