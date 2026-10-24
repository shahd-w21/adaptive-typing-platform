// Connect dashboard rendering to an account-scoped remote-data query.
import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '../../../api/dashboard.js';
import { queryKeys } from '../../../lib/queryKeys.js';
import { useAuth } from '../../../hooks/useAuth.js';

/** Return TanStack's data/loading/error/refetch state for the current account. */
export function useDashboard() {
  const { user } = useAuth();
  // The disabled key contains no private data and never triggers an anonymous read.
  return useQuery({
    queryKey: user ? queryKeys.dashboard(user.id) : ['disabled', 'dashboard'],
    queryFn: fetchDashboard,
    enabled: Boolean(user),
  });
}
