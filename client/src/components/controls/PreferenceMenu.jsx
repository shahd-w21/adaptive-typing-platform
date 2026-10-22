// Shared preference menu keeps native buttons, radio semantics and keyboard focus together.
import {
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { CheckIcon } from '../ui/Icons.jsx';

/**
 * Labeled menu-button pattern: arrows/Home/End move focus, Escape returns to the
 * trigger, Tab leaves naturally. Position is clamped to the live viewport.
 */
export function PreferenceMenu({ label, options, value, onChange, compact, helper }) {
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState(0);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();
  const selected = options.find(option => option.value === value) || options[0];
  const Icon = selected.icon;

  useEffect(() => {
    if (!open) {
      return;
    }
    const menu = menuRef.current;
    menu.querySelector('[aria-checked="true"]')?.focus();

    const outside = event => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const closeOnResize = () => setOpen(false);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', closeOnResize);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', closeOnResize);
    };
  }, [open]);

  /** Clamp the popup without adding a second stylesheet or clipping its options. */
  function showMenu() {
    const bounds = containerRef.current.getBoundingClientRect();
    const width = Math.min(224, window.innerWidth - 24);
    setLeft(Math.max(12, Math.min(bounds.left, window.innerWidth - width - 12)) - bounds.left);
    setOpen(true);
  }

  /** Return to the persistent trigger after selection or explicit dismissal. */
  function closeMenu() {
    setOpen(false);
    triggerRef.current.focus();
  }

  /** Move only among the menu's options; never intercept exercise typing. */
  function handleMenuKey(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
      return;
    }
    const buttons = [...menuRef.current.querySelectorAll('[role="menuitemradio"]')];
    const index = buttons.indexOf(document.activeElement);
    const next = {
      ArrowDown: (index + 1) % buttons.length,
      ArrowUp: (index - 1 + buttons.length) % buttons.length,
      Home: 0,
      End: buttons.length - 1,
    }[event.key];
    if (next !== undefined) {
      event.preventDefault();
      buttons[next].focus();
    }
  }

  return (
    <div ref={containerRef} className="relative inline-block" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setOpen(false);
      }
    }}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${label}: ${selected.label}`}
        className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-border-control bg-surface px-3 text-sm font-bold text-ink hover:bg-subtle"
        onClick={() => open ? closeMenu() : showMenu()}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            showMenu();
          }
        }}
      >
        <Icon size={16} />
        {!compact && <span>{selected.label}</span>}
      </button>
      {open && (
        <div className="absolute top-[calc(100%_+_6px)] z-100 w-[min(14rem,calc(100vw_-_24px))] rounded-control border border-border-control bg-surface p-2 text-ink shadow-popover" style={{ left }}>
          <div ref={menuRef} id={menuId} role="menu" aria-label={label} onKeyDown={handleMenuKey}>
            {options.map(option => (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={option.value === selected.value}
                tabIndex={-1}
                onClick={() => {
                  onChange(option.value);
                  closeMenu();
                }}
                className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-start ${option.value === selected.value ? 'bg-learning-soft font-bold text-learning-strong' : 'hover:bg-subtle'}`}
              >
                <span lang={option.lang} dir={option.lang === 'ar' ? 'rtl' : undefined}>{option.label}</span>
                {option.value === selected.value && <CheckIcon size={16} />}
              </button>
            ))}
          </div>
          {helper && <p className="mt-2 border-t border-border-subtle px-1 pt-2 text-xs text-muted">{helper}</p>}
        </div>
      )}
    </div>
  );
}
