import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTranslation } from '../i18n/useTranslation.js';

function RoleDenied() {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6 text-center text-ink">
      <section className="w-full max-w-md rounded-card border border-border-subtle bg-surface p-8 shadow-card" role="alert">
        <div className="mb-4 text-3xl text-warning-text" aria-hidden="true">!</div>
        <h1 className="mb-2 font-display text-xl font-bold">{t('auth.permissionDenied')}</h1>
        <Link to="/" className="font-bold text-action-link">{t('common.back')}</Link>
      </section>
    </main>
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
