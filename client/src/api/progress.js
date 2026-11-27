// Progress API boundary: fetch real account progress and validate against shared DTO.
import { request } from './client.js';
import { progressResponseSchema } from '@typeflow/shared';

// Forward TanStack's AbortSignal rather than leaving cancelled requests running.
export const fetchProgress = ({ signal } = {}) =>
  request('/progress', { signal, responseSchema: progressResponseSchema });
