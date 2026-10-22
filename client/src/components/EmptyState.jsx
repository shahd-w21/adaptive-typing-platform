/**
 * Accessible empty state view with an optional icon, description, and primary/secondary CTA actions.
 *
 * @param {object} props
 * @param {import('react').ComponentType<{ size?: number, className?: string }>} [props.icon] Lucide/Icons component
 * @param {string} props.title Primary headline explaining the empty state
 * @param {string} [props.description] Helpful secondary description or guidance
 * @param {string} [props.actionLabel] Text for the primary action button
 * @param {() => void} [props.onAction] Handler for the primary action
 * @param {string} [props.secondaryActionLabel] Text for secondary action
 * @param {() => void} [props.onSecondaryAction] Handler for secondary action
 * @param {string} [props.className] Additional container classes
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) {
  return (
    <div
      className={`mx-auto flex max-w-lg flex-col items-center justify-center rounded-card border border-dashed border-border-subtle bg-surface/50 p-8 text-center shadow-card sm:p-12 ${className}`}
    >
      {Icon && (
        <div
          className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-learning-soft text-learning-strong"
          aria-hidden="true"
        >
          <Icon size={28} />
        </div>
      )}
      <h3 className="mb-2 font-display text-lg font-bold text-ink sm:text-xl">
        {title}
      </h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted">
          {description}
        </p>
      )}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-action-primary px-5 py-2 text-sm font-bold text-action-foreground shadow-primary transition-colors hover:bg-action-hover focus:outline-none focus:ring-2 focus:ring-action-focus"
            >
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-border-subtle bg-surface px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-subtle focus:outline-none focus:ring-2 focus:ring-action-focus"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
