import { useTranslation } from '../i18n/useTranslation.js';

/**
 * Accessible loading spinner and message conforming to TypeFlow design tokens.
 *
 * @param {object} props
 * @param {string} [props.message] Optional custom loading text (defaults to t('common.loading'))
 * @param {'sm'|'md'|'lg'} [props.size='md'] Spinner dimension
 * @param {string} [props.className] Additional container classes
 */
export function Loading({ message, size = 'md', className = '' }) {
  const { t } = useTranslation();
  const displayMessage = message ?? t('common.loading');

  const spinnerSizes = {
    sm: 'size-4 border-2',
    md: 'size-6 border-2',
    lg: 'size-10 border-3',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 p-6 text-muted ${className}`}
    >
      <div
        className={`animate-spin rounded-full border-border-subtle border-t-learning-accent ${spinnerSizes[size] || spinnerSizes.md}`}
        aria-hidden="true"
      />
      {displayMessage && (
        <span className="text-sm font-medium tracking-wide">
          {displayMessage}
        </span>
      )}
    </div>
  );
}

export default Loading;
