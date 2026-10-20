import { useQuery } from '@tanstack/react-query';
import { fetchLearningPath } from '../../api/path.js';
import { queryKeys } from '../../lib/queryKeys.js';

export function useLearningPath() {
  return useQuery({ queryKey: queryKeys.path, queryFn: fetchLearningPath });
}
