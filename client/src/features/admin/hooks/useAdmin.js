import { useQuery } from '@tanstack/react-query';
import { checkAdminAccess } from '../../../api/admin.js';

export function useAdminPing() {
  return useQuery({ queryKey: ['admin', 'ping'], queryFn: checkAdminAccess });
}
