// Fetch and validate server-owned XP/level/streak/daily-goal data;
// reward calculations and badge policies remain on the server.
import { gamificationResponseSchema } from '@typeflow/shared';
import { ApiError, request } from './client.js';

/**
 * Fetch the authenticated student's official gamification summary.
 * Rejects malformed payloads with CONTRACT_ERROR instead of inventing values.
 */
export async function fetchGamification({ signal } = {}) {
  const payload = await request('/gamification', { signal });
  const parsed = gamificationResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError('Invalid gamification response.', {
      status: 500,
      code: 'CONTRACT_ERROR',
    });
  }
  return parsed.data;
}
