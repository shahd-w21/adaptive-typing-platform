// Fetch server-owned XP/level/streak data; reward calculations stay on the server.
import { request } from './client.js';
import { gamificationResponseSchema } from '@typeflow/shared';

// The optional signal cancels the read when its account/query is no longer active.
export const fetchGamification = ({ signal } = {}) =>
  request('/gamification', { signal, responseSchema: gamificationResponseSchema });
