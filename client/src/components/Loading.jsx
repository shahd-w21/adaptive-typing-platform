// Shared indeterminate status; the owning page controls what is loading.
import { useTranslation } from '../i18n/useTranslation.js';
import { LoaderIcon } from './ui/Icons.jsx';

/** Announce a localized status without moving focus or fabricating progress. */
export function Loading({
  label,
  labelKey = 'common.loading',
  compact = false,
  message,
  size = 'md',
  className = '',
}) {
  const { t } = useTranslation();
  const text = label ?? message ?? t(labelKey);

  const sizeClasses = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`flex min-w-0 items-center justify-center gap-3 text-muted ${
        compact
          ? 'py-2'
          : 'rounded-card border border-border-subtle bg-surface p-6'
      } ${className}`}
    >
      <LoaderIcon
        className={`shrink-0 animate-spin motion-reduce:animate-none ${
          sizeClasses[size] || sizeClasses.md
        }`}
      />
      <span className="min-w-0 wrap-anywhere">{text}</span>
    </div>
  );
}

export default Loading;
