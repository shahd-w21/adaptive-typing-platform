/**
 * Central TanStack Query cache addresses, not API URLs or permission checks.
 * Protected data is grouped by account so users cannot share cached results.
 * Keys contain IDs/resource names only; never tokens or raw typing events.
 */

/** Account prefix used to cancel/remove every protected query for one user. */
const owner = (ownerId) => {
  if (typeof ownerId !== 'string' || !ownerId.trim()) {
    throw new TypeError('An authenticated owner ID is required');
  }
  return ['owner', ownerId];
};

// Current endpoints accept no filters. Add explicit allowlists when their
// contracts are agreed; never cache filtered data under an unfiltered key.
// Return a fresh empty object so omitted filters and {} produce the same key.
function unfiltered(filters = {}) {
  if (
    !filters ||
    typeof filters !== 'object' ||
    Array.isArray(filters) ||
    Object.keys(filters).length
  ) {
    throw new TypeError('This endpoint has no agreed filters');
  }
  return {};
}
/** Build a resource-specific factory: resource('progress')(userId, filters). */
const resource = (name) => (ownerId, filters) => [
  ...owner(ownerId),
  name,
  unfiltered(filters),
];

export const queryKeys = {
  // Bootstrap identity is the one ownerless query; AuthProvider clears it on logout.
  auth: { current: ['auth', 'me'] },
  owner,
  // Reserved for genuinely public data; private DTOs must use an owner key.
  public: (resourceName) => ['public', resourceName],
  dashboard: resource('dashboard'),
  path: resource('learning-path'),
  progress: resource('progress'),
  gamification: resource('gamification'),
  adminAccess: resource('admin-access'),
  sessions: resource('sessions'),
  // Detail results need both the account and session ID to prevent collisions.
  session: (ownerId, sessionId) => {
    if (typeof sessionId !== 'string' || !sessionId.trim()) {
      throw new TypeError('A session ID is required');
    }
    return [...owner(ownerId), 'session', sessionId];
  },
};
