// Shared indeterminate status; the owning page controls what is loading.
import { useTranslation } from '../i18n/useTranslation.js';
import { LoaderIcon } from './ui/Icons.jsx';

/** Announce a localized status without moving focus or fabricating progress. */
export function Loading({ label, labelKey = 'common.loading', compact = false }) {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`flex min-w-0 items-center justify-center gap-3 text-muted ${compact ? 'py-2' : 'rounded-card border border-border-subtle bg-surface p-6'}`}
    >
      <LoaderIcon className="shrink-0 animate-spin motion-reduce:animate-none" />
      <span className="min-w-0 wrap-anywhere">{label ?? t(labelKey)}</span>
    </div>
  );
}
