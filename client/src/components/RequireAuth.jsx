// Session boundary delegates shared loading and recoverable errors to common UI.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loading } from './Loading.jsx';
import { ErrorMessage } from './ErrorMessage.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useTranslation } from '../i18n/useTranslation.js';

/** Keep session recovery outside protected content until the real API resolves. */
function SessionState({ error = false }) {
  const { retrySession } = useAuth();
  const { t } = useTranslation();
  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-6 text-ink">
      <div className="w-full max-w-md">
        {error ? <ErrorMessage message={t('auth.sessionFailed')} onRetry={() => retrySession()} /> : <Loading labelKey="auth.sessionLoading" />}
      </div>
    </main>
  );
}

export function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <SessionState />;
  if (status === 'error') return <SessionState error />;
  if (status === 'anonymous') return <Navigate to="/register" replace state={{ from: location, reason: 'auth-required' }} />;
  return children ?? <Outlet />;
}
