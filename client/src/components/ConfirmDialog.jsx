import { useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/useTranslation.js';
import { AlertCircleIcon, XIcon } from './ui/Icons.jsx';

/**
 * Accessible confirmation dialog with focus trap and escape handling.
 *
 * @param {object} props
 * @param {boolean} props.isOpen Dialog visibility state
 * @param {string} props.title Dialog title
 * @param {string} props.message Main explanation / prompt text
 * @param {string} [props.confirmLabel] Label for confirm button (defaults to t('common.confirm'))
 * @param {string} [props.cancelLabel] Label for cancel button (defaults to t('common.cancel'))
 * @param {() => void} props.onConfirm Callback on confirmation
 * @param {() => void} props.onCancel Callback on cancel or dismiss
 * @param {boolean} [props.isDestructive=false] Style confirm button with error/danger treatment
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isDestructive = false,
}) {
  const { t } = useTranslation();
  const confirmRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    cancelRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-page/80 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-md rounded-card border border-border-subtle bg-surface p-6 shadow-modal transition-all sm:p-7">
        <button
          type="button"
          onClick={onCancel}
          aria-label={t('common.close')}
          className="absolute top-4 end-4 rounded-control p-1 text-muted transition-colors hover:bg-subtle hover:text-ink focus:outline-none focus:ring-2 focus:ring-action-focus"
        >
          <XIcon size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
              isDestructive
                ? 'bg-error-soft text-error-text'
                : 'bg-learning-soft text-learning-strong'
            }`}
            aria-hidden="true"
          >
            <AlertCircleIcon size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="confirm-dialog-title"
              className="font-display text-lg font-bold text-ink"
            >
              {title}
            </h3>
            <p
              id="confirm-dialog-desc"
              className="mt-2 text-sm leading-relaxed text-muted"
            >
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-10 rounded-full border border-border-subtle bg-surface px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-subtle focus:outline-none focus:ring-2 focus:ring-action-focus"
          >
            {cancelLabel ?? t('common.cancel')}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`min-h-10 rounded-full px-5 py-2 text-sm font-bold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-action-focus ${
              isDestructive
                ? 'bg-error-text text-white hover:opacity-90'
                : 'bg-action-primary text-action-foreground shadow-primary hover:bg-action-hover'
            }`}
          >
            {confirmLabel ?? t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
