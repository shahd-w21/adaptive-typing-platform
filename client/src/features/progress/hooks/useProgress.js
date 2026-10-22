// Own progress query state while the existing screen owns its presentation.
import { useQuery } from '@tanstack/react-query';
import { fetchProgress } from '../../../api/progress.js';
import { queryKeys } from '../../../lib/queryKeys.js';
import { useAuth } from '../../../hooks/useAuth.js';

/** Fetch only after identity is known; switching accounts selects a different cache. */
export function useProgress() {
  const { user } = useAuth();
  return useQuery({
    queryKey: user ? queryKeys.progress(user.id) : ['disabled', 'progress'],
    queryFn: fetchProgress,
    enabled: Boolean(user),
  });
}
