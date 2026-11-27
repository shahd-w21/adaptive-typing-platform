// Admin React Query hooks: access probe and draft analytics.
// Each hook is owner-scoped so cached data is never shared across accounts.
import { useQuery } from '@tanstack/react-query';
import { checkAdminAccess, fetchAnalytics } from '../../../api/admin.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { queryKeys } from '../../../lib/queryKeys.js';

// ---------------------------------------------------------------------------
// Admin access probe
// ---------------------------------------------------------------------------

/**
 * Verifies admin access on mount.
 * Run for every Admin UI session; the server enforces role and session checks.
 *
 * @returns {import('@tanstack/react-query').UseQueryResult<{ message: string }>}
 */
export function useAdminPing() {
  const { user } = useAuth();
  return useQuery({
    queryKey: user
      ? queryKeys.adminAccess(user.id)
      : ['disabled', 'admin-access'],
    queryFn: checkAdminAccess,
    enabled: user?.role === 'admin',
  });
}

// ---------------------------------------------------------------------------
// Analytics hook
// ---------------------------------------------------------------------------

/**
 * Fetches platform analytics for the reporting window.
 * Automatically isolated by owner ID — switching accounts clears cached data.
 * Falls back to a validated development fixture when BE-22 is not yet deployed.
 *
 * @param {{ window?: '7d'|'30d'|'90d', page?: number, pageSize?: number }} [filters={}]
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useAnalytics(filters = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: user
      ? queryKeys.analytics(user.id, filters)
      : ['disabled', 'analytics'],

    queryFn: ({ signal }) => fetchAnalytics(filters, { signal }),

    // Only run when an admin is authenticated.
    enabled: Boolean(user) && user.role === 'admin',

    // Stale after 5 minutes; analytics data does not need to be real-time.
    staleTime: 5 * 60 * 1000,
  });
}
