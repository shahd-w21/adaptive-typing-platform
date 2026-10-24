// Read saved progress from the real API; UI fixtures are not a failure fallback.
import { request } from './client.js';

// Forward TanStack's AbortSignal rather than leaving cancelled requests running.
export const fetchProgress = ({ signal } = {}) =>
  request('/progress', { signal });
