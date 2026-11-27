// Admin React Query hooks: access probe and draft analytics.
// Each hook is owner-scoped so cached data is never shared across accounts.
import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  checkAdminAccess,
  createAdminUsersApi,
  fetchAnalytics,
} from '../../../api/admin.js';
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

/**
 * FE-18 user-management hooks.
 * The development adapter is disposable and account-scoped; mutations refresh
 * the same validated list rather than inventing rows in the component.
 *
 * @param {{ search?: string, page?: number, pageSize?: number }} [filters={}]
 * @returns {object} Query and mutation state for the protected user directory.
 */
export function useAdminUsers(filters = {}) {
  const { user, csrfToken } = useAuth();
  const queryClient = useQueryClient();
  const api = useMemo(
    () => createAdminUsersApi(
      user,
      {
        csrfToken,
        mode: import.meta.env?.DEV ? 'fixture' : 'unavailable',
      },
    ),
    [user, csrfToken],
  );

  const list = useQuery({
    queryKey: user
      ? queryKeys.adminUsers(user.id, filters)
      : ['disabled', 'admin-users'],
    queryFn: () => api.list(filters),
    enabled: Boolean(user) && user.role === 'admin',
  });

  async function refresh() {
    await queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === 'owner'
        && query.queryKey[1] === user?.id
        && query.queryKey[2] === 'admin-users',
    });
  }

  const deactivate = useMutation({
    mutationFn: (id) => api.deactivate(id),
    onSuccess: refresh,
  });

  const deleteUser = useMutation({
    mutationFn: (id) => api.delete(id),
    onSuccess: refresh,
  });

  const createAdmin = useMutation({
    mutationFn: (input) => api.createAdmin(input),
    onSuccess: refresh,
  });

  return {
    api,
    source: api.source,
    list,
    deactivate,
    deleteUser,
    createAdmin,
  };
}
