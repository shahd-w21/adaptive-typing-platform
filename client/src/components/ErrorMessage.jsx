import { useTranslation } from '../i18n/useTranslation.js';
import { AlertCircleIcon, RotateCcwIcon } from './ui/Icons.jsx';

/**
 * Accessible error message with optional retry trigger.
 *
 * @param {object} props
 * @param {string} [props.title] Error headline
 * @param {string} props.message Error description or reason
 * @param {() => void} [props.onRetry] Optional retry callback
 * @param {string} [props.retryLabel] Custom text for retry button (defaults to t('common.retry'))
 * @param {string} [props.className] Additional container classes
 */
export function ErrorMessage({
  title,
  message,
  onRetry,
  retryLabel,
  className = '',
}) {
  const { t } = useTranslation();
  const retryText = retryLabel ?? t('common.retry');

  return (
    <div
      role="alert"
      className={`flex items-start gap-3.5 rounded-card border border-error-text/30 bg-error-soft p-4 text-error-text shadow-sm ${className}`}
    >
      <div className="shrink-0 pt-0.5 text-error-text" aria-hidden="true">
        <AlertCircleIcon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="mb-1 text-sm font-bold tracking-tight">
            {title}
          </h4>
        )}
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-control border border-error-text/40 bg-surface/80 px-3 py-1.5 text-xs font-bold text-error-text transition-colors hover:bg-surface focus:outline-none focus:ring-2 focus:ring-error-text/50"
        >
          <RotateCcwIcon size={14} aria-hidden="true" />
          <span>{retryText}</span>
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
