// Account-scoped rewards query shared by views that display saved reward totals.
import { useQuery } from '@tanstack/react-query';
import { fetchGamification } from '../../../api/gamification.js';
import { queryKeys } from '../../../lib/queryKeys.js';
import { useAuth } from '../../../hooks/useAuth.js';

/** Allow a view to defer fetching, but never fetch without a confirmed user. */
export function useGamification(enabled = true) {
  const { user } = useAuth();
  return useQuery({
    queryKey: user
      ? queryKeys.gamification(user.id)
      : ['disabled', 'gamification'],
    queryFn: fetchGamification,
    enabled: enabled && Boolean(user),
  });
}
