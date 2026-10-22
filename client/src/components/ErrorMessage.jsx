// Shared safe error and permission state; never render arbitrary server error text.
import { useId } from 'react';
import { useTranslation } from '../i18n/useTranslation.js';
import { AlertCircleIcon } from './ui/Icons.jsx';

/**
 * Map known API codes to interface messages, with a generic English/Arabic fallback.
 * title/message are trusted, localized UI copy, not exception or response messages.
 * Retries are user initiated; the caller owns pending state and retry safety.
 */
export function ErrorMessage({
  error,
  title,
  message,
  onRetry,
  retrying = false,
  retryLabel,
  className = '',
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const code =
    typeof error?.code === 'string' && /^[A-Z_]+$/.test(error.code)
      ? error.code
      : '';
  const messageKey = `apiErrors.${code}`;
  const translated = code ? t(messageKey) : messageKey;
  const permissionDenied = code === 'FORBIDDEN';

  const displayMessage =
    message ??
    (translated !== messageKey
      ? translated
      : t('interfaceStates.errorDescription'));

  return (
    <section
      role="alert"
      aria-labelledby={titleId}
      className={`min-w-0 rounded-card border border-error-text/40 bg-error-soft p-5 text-error-text wrap-anywhere ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircleIcon className="mt-1 shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="mb-1 font-display text-lg font-bold">
            {title ??
              t(
                permissionDenied
                  ? 'auth.permissionDenied'
                  : 'common.error',
              )}
          </h2>
          <p>{displayMessage}</p>
        </div>
      </div>
      {onRetry && !permissionDenied && (
        <button
          type="button"
          disabled={retrying}
          onClick={onRetry}
          className="mt-4 min-h-11 max-w-full rounded-full border border-error-text px-5 py-2 font-bold hover:bg-surface disabled:cursor-wait disabled:opacity-70"
        >
          {retryLabel ?? t(retrying ? 'common.loading' : 'common.retry')}
        </button>
      )}
    </section>
  );
}

export default ErrorMessage;
