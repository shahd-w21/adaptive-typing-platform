import { useQuery } from '@tanstack/react-query';
import { fetchGamification } from '../../../api/gamification.js';
import { queryKeys } from '../../../lib/queryKeys.js';

export function useGamification(enabled = true) {
  return useQuery({ queryKey: queryKeys.gamification, queryFn: fetchGamification, enabled });
}
