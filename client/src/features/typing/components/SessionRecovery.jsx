/** Explain reload/expiry honestly: no browser keystrokes were persisted. */
import { Loading } from '../../../components/Loading.jsx';
import { ErrorMessage } from '../../../components/ErrorMessage.jsx';
import { useTranslation } from '../../../i18n/useTranslation.js';

/** Explicit actions recheck server state or abandon before creating another assignment. */
export function SessionRecovery({ session, onRestart, onExit }) {
  const { t } = useTranslation();
  if (session.status === 'recovering') {
    return <Loading labelKey="sessionFlow.recovering" />;
  }
  return (
    <section
      className="mx-auto my-6 max-w-2xl rounded-card border border-border-subtle bg-surface p-6"
      aria-labelledby="session-recovery-title"
    >
      <h1 id="session-recovery-title" className="mb-3 text-2xl font-bold">
        {t('sessionFlow.recoveryTitle')}
      </h1>
      <p className="mb-4 text-muted">
        {t(
          `sessionFlow.${session.status === 'expired' ? 'expired' : session.status === 'abandoned' ? 'abandoned' : 'lostProgress'}`,
        )}
      </p>
      {session.error && (
        <ErrorMessage
          error={session.error}
          onRetry={() => session.controller.recover()}
        />
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="min-h-12 rounded-full bg-action-primary px-6 font-bold text-action-foreground"
        >
          {t('sessionFlow.restart')}
        </button>
        <button
          type="button"
          onClick={onExit}
          className="min-h-12 rounded-full border border-border-control px-6 font-bold"
        >
          {t('common.exit')}
        </button>
      </div>
      {/* NOTE FOR DEVS — FE-11: owned history can recover older saved results.
          This view intentionally stores no typing log and cannot resume a recorder. */}
    </section>
  );
}
