// Keep server path data separate from local theme/language and typing state.
import { useQuery } from '@tanstack/react-query';
import { fetchLearningPath } from '../../api/path.js';
import { queryKeys } from '../../lib/queryKeys.js';
import { useAuth } from '../../hooks/useAuth.js';

/** Return the current owner's path query; the backend decides learning eligibility. */
export function useLearningPath() {
  const { user } = useAuth();
  return useQuery({
    queryKey: user ? queryKeys.path(user.id) : ['disabled', 'learning-path'],
    queryFn: fetchLearningPath,
    enabled: Boolean(user),
  });
}
