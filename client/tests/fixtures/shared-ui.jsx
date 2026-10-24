// Isolated presentation fixture imports real shared components without real API writes.
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PreferencesContext } from '../../src/context/preferences.js';
import { Loading } from '../../src/components/Loading.jsx';
import { EmptyState } from '../../src/components/EmptyState.jsx';
import { ErrorMessage } from '../../src/components/ErrorMessage.jsx';
import { ConfirmDialog } from '../../src/components/ConfirmDialog.jsx';
import '../../src/index.css';

/** Exercise owner-controlled pending, retry, failure and successful dismissal states. */
export function SharedUiFixture() {
  const params = new URLSearchParams(window.location.search);
  const locale = params.get('locale') || 'en';
  const theme = params.get('theme') || 'light';
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [retries, setRetries] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dataset.theme = theme;
  }, [locale, theme]);

  /** Simulate a pending write then a failure; retry succeeds and closes the modal. */
  async function confirm() {
    setPending(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    setPending(false);
    if (!error) {
      setError({
        code: 'SERVICE_UNAVAILABLE',
        message: 'private-error-must-not-render',
      });
    } else {
      setConfirmed(true);
      setOpen(false);
    }
  }

  return (
    <PreferencesContext value={{
      uiLocale: locale,
      isRTL: locale === 'ar',
      dir: locale === 'ar' ? 'rtl' : 'ltr',
    }}>
      <main className="mx-auto flex max-w-xl flex-col gap-5 p-4">
        <h1 className="text-2xl font-bold">Shared UI fixture</h1>
        <Loading />
        <EmptyState />
        <ErrorMessage
          error={{
            code: 'UNKNOWN_FAILURE',
            message: 'private-error-must-not-render',
          }}
          onRetry={() => setRetries(value => value + 1)}
        />
        <ErrorMessage
          error={{ code: 'FORBIDDEN' }}
          onRetry={() => setRetries(value => value + 1)}
        />
        <output data-testid="retries">{retries}</output>
        <button type="button" onClick={() => setOpen(true)} className="min-h-11 rounded-control border border-border-control p-3">
          Open confirmation
        </button>
        <output data-testid="confirmed">{String(confirmed)}</output>
        <ConfirmDialog
          open={open}
          pending={pending}
          error={error}
          onCancel={() => setOpen(false)}
          onConfirm={confirm}
          destructive
        />
      </main>
    </PreferencesContext>
  );
}

createRoot(document.getElementById('root')).render(<SharedUiFixture />);
