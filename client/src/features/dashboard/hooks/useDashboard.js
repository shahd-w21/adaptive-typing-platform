import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '../../../api/dashboard.js';
import { queryKeys } from '../../../lib/queryKeys.js';

export function useDashboard() {
  return useQuery({ queryKey: queryKeys.dashboard, queryFn: fetchDashboard });
}
