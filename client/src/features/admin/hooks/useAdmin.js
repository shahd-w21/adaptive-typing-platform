// Query the current access probe; full admin feature contracts remain separate.
import { useQuery } from '@tanstack/react-query';
import { checkAdminAccess } from '../../../api/admin.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { queryKeys } from '../../../lib/queryKeys.js';

/** Run for an Admin UI session; the API must still enforce role/active-session checks. */
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
