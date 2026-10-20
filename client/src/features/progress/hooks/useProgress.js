import { useQuery } from '@tanstack/react-query';
import { fetchProgress } from '../../../api/progress.js';
import { queryKeys } from '../../../lib/queryKeys.js';

export function useProgress() {
  return useQuery({ queryKey: queryKeys.progress, queryFn: fetchProgress });
}
