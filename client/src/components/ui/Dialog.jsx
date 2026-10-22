// Native modal boundary shared by drawers and confirmations; owns focus and scroll only.
import { useEffect, useRef } from 'react';

/**
 * Make the background inert, contain keyboard focus, and restore the opener on close.
 * Callers own open state and actions. Presentation changes never remount children.
 * initialFocusRef should point to the least consequential action in a confirmation.
 */
export function Dialog({
  open,
  onClose,
  children,
  label,
  labelledBy,
  describedBy,
  initialFocusRef,
  className = '',
  role = 'dialog',
  dismissible = true,
  id,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const dialog = dialogRef.current;
    const opener = document.activeElement;
    const previousOverflow = document.documentElement.style.overflow;
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    initialFocusRef?.current?.focus();

    return () => {
      dialog.close();
      document.documentElement.style.overflow = previousOverflow;
      // A navigation may remove or hide the opener; never focus a stale element.
      if (opener instanceof HTMLElement && opener.isConnected && opener.getClientRects().length) {
        opener.focus({ preventScroll: true });
      }
    };
  }, [open, initialFocusRef]);

  /** Native backdrop clicks target the dialog, outside its content rectangle. */
  function handleBackdropClick(event) {
    if (!dismissible || event.target !== event.currentTarget) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) {
      onClose();
    }
  }

  /**
   * Native modality makes the page inert, but browsers can tab into browser chrome
   * at the boundary. Cycle visible controls explicitly in both directions.
   */
  function handleTabKey(event) {
    if (event.key !== 'Tab' || event.defaultPrevented) {
      return;
    }
    const controls = [...event.currentTarget.querySelectorAll(
      'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    )].filter(element => element.tabIndex >= 0 && element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (!first) {
      event.preventDefault();
      event.currentTarget.focus();
    } else if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      id={id}
      role={role}
      tabIndex={-1}
      aria-modal="true"
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={`max-h-[100dvh] max-w-[100vw] overflow-y-auto overscroll-contain border border-border-subtle bg-surface text-ink shadow-popover backdrop:bg-overlay backdrop:backdrop-blur-sm ${className}`}
      onCancel={event => {
        event.preventDefault();
        if (dismissible) {
          onClose();
        }
      }}
      onClick={handleBackdropClick}
      onKeyDown={handleTabKey}
    >
      {children}
    </dialog>
  );
}
