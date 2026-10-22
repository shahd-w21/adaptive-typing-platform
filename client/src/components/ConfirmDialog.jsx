// Controlled confirmation UI; callers own mutation, pending state and failure recovery.
import { useId, useRef } from 'react';
import { useTranslation } from '../i18n/useTranslation.js';
import { Dialog } from './ui/Dialog.jsx';
import { ErrorMessage } from './ErrorMessage.jsx';

/**
 * Start focus on Cancel and restore the opener after closing. onConfirm does not
 * close automatically: the owner closes after success and supplies errors on failure.
 * Pending writes cannot be dismissed or submitted a second time through this UI.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  pending = false,
  error,
  destructive = false,
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef(null);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      labelledBy={titleId}
      describedBy={descriptionId}
      initialFocusRef={cancelRef}
      dismissible={!pending}
      role="alertdialog"
      className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-dialog p-6 wrap-anywhere sm:p-8"
    >
      <h2 id={titleId} className="mb-3 font-display text-xl font-bold">{title ?? t('interfaceStates.confirmTitle')}</h2>
      <p id={descriptionId} className="mb-6 text-muted">{description ?? t('interfaceStates.confirmDescription')}</p>
      {error && <div className="mb-5"><ErrorMessage error={error} /></div>}
      {pending && <p role="status" className="mb-4 text-muted">{t('common.saving')}</p>}
      <div className="flex flex-wrap justify-end gap-3" aria-busy={pending}>
        <button ref={cancelRef} type="button" disabled={pending} onClick={onCancel} className="min-h-11 max-w-full rounded-full border border-border-control bg-surface px-5 py-2 font-bold hover:bg-subtle disabled:cursor-wait disabled:text-disabled-text">
          {cancelLabel ?? t('common.cancel')}
        </button>
        <button type="button" disabled={pending} onClick={onConfirm} className={`min-h-11 max-w-full rounded-full px-5 py-2 font-bold disabled:cursor-wait disabled:bg-disabled-bg disabled:text-disabled-text ${destructive ? 'border border-error-text bg-error-soft text-error-text hover:bg-surface' : 'bg-action-primary text-action-foreground hover:bg-action-hover'}`}>
          {pending ? t('common.saving') : (confirmLabel ?? t('common.confirm'))}
        </button>
      </div>
    </Dialog>
  );
}
