// Admin layout reuses the authenticated shell and its identical desktop/mobile actions.
import { StudentShell } from './StudentShell.jsx';
import { ErrorMessage } from '../ErrorMessage.jsx';

/**
 * Expose only the existing admin/profile/logout route contract. Page-owned admin
 * sections stay in AdminView. RequireRole and server authorization remain required.
 */
export function AdminShell({ user, ...props }) {
  if (user?.role?.toLowerCase() !== 'admin') {
    return <ErrorMessage error={{ code: 'FORBIDDEN' }} />;
  }

  return <StudentShell {...props} user={user} />;
}
