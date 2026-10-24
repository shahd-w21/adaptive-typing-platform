// Shared empty collection state; actions remain explicit decisions of the page owner.
import { useId } from 'react';
import { useTranslation } from '../i18n/useTranslation.js';
import { InboxIcon } from './ui/Icons.jsx';

/** Render a translated explanation and an optional, named next action. */
export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
  className = '',
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const DisplayIcon = Icon || InboxIcon;

  return (
    <section
      aria-labelledby={titleId}
      className={`min-w-0 rounded-card border border-border-subtle bg-surface p-6 text-center wrap-anywhere sm:p-8 ${className}`}
    >
      <DisplayIcon size={30} className="mx-auto mb-3 text-muted" aria-hidden="true" />
      <h2 id={titleId} className="mb-2 font-display text-xl font-bold">
        {title ?? t('interfaceStates.emptyTitle')}
      </h2>
      <p className="text-muted">
        {description ?? t('interfaceStates.emptyDescription')}
      </p>
      {onAction && actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 min-h-11 max-w-full rounded-full bg-action-primary px-5 py-2 font-bold text-action-foreground hover:bg-action-hover"
        >
          {actionLabel}
        </button>
      )}
    </section>
  );
}

export default EmptyState;
