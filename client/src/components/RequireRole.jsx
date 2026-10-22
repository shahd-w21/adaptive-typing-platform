// Role-specific page boundary; permission feedback never substitutes for server checks.
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ErrorMessage } from './ErrorMessage.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useTranslation } from '../i18n/useTranslation.js';

function RoleDenied() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-6 text-center text-ink">
      <section className="w-full max-w-md">
        <ErrorMessage error={{ code: 'FORBIDDEN' }} />
        <Link to="/" className="mt-4 inline-flex min-h-11 items-center rounded-control px-3 font-bold text-action-link">{t('common.back')}</Link>
      </section>
    </div>
  );
}

export function RequireRole({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();
  const requiredRoles = Array.isArray(role) ? role : [role];
  const userRole = user?.role?.toLowerCase();

  if (!userRole) return <Navigate to="/register" replace state={{ from: location }} />;
  if (!requiredRoles.includes(userRole)) return <RoleDenied />;
  return children ?? <Outlet />;
}
