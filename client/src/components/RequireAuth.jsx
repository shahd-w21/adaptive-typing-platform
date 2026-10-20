import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTranslation } from '../i18n/useTranslation.js';

function SessionState({ error = false }) {
  const { retrySession } = useAuth();
  const { t } = useTranslation();
  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-6 text-ink">
      <section className="w-full max-w-md rounded-card border border-border-subtle bg-surface p-8 text-center shadow-card" role={error ? 'alert' : 'status'}>
        <div className="mx-auto mb-5 size-8 animate-spin rounded-full border-[3px] border-learning-accent/25 border-t-learning-accent motion-reduce:animate-none" aria-hidden="true" />
        <h1 className="mb-2 font-display text-xl font-bold">{error ? t('auth.sessionFailed') : t('auth.sessionLoading')}</h1>
        {error && <button type="button" onClick={() => retrySession()} className="mt-4 rounded-full bg-action-primary px-6 py-3 font-bold text-action-foreground hover:bg-action-hover">{t('common.retry')}</button>}
      </section>
    </main>
  );
}

export function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <SessionState />;
  if (status === 'error') return <SessionState error />;
  if (status === 'anonymous') return <Navigate to="/register" replace state={{ from: location }} />;
  return children ?? <Outlet />;
}
