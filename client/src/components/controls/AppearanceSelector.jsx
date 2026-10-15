import React, { useState, useRef, useEffect } from 'react';
import { usePreferences } from '../../context/PreferencesContext.jsx';
import { useTranslation } from '../../i18n/useTranslation.js';
import { SunIcon, MoonIcon, MonitorIcon, CheckIcon } from '../ui/Icons.jsx';

export function AppearanceSelector({ compact = false }) {
  const { themePreference, setThemePreference, resolvedTheme } = usePreferences();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { value: 'light', label: t('preferences.light'), icon: SunIcon },
    { value: 'dark', label: t('preferences.dark'), icon: MoonIcon },
    { value: 'system', label: t('preferences.system'), icon: MonitorIcon },
  ];

  const currentOption = options.find((opt) => opt.value === themePreference) || options[2];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="appearance-selector" ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t('preferences.appearance')}: ${currentOption.label}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: compact ? '36px' : '40px',
          padding: '0 12px',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-pill)',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: '14px',
          fontWeight: 700,
          transition: 'border-color var(--motion-fast)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-border-control)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border-subtle)')}
      >
        <CurrentIcon size={16} />
        {!compact && <span>{currentOption.label}</span>}
      </button>

      {open && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            insetInlineEnd: 0,
            zIndex: 100,
            minWidth: '150px',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-control)',
            boxShadow: 'var(--shadow-popover)',
            padding: '6px',
            listStyle: 'none',
            margin: 0,
          }}
        >
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = themePreference === opt.value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => {
                  setThemePreference(opt.value);
                  setOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setThemePreference(opt.value);
                    setOpen(false);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isSelected ? 700 : 400,
                  color: isSelected ? 'var(--color-learning-strong)' : 'var(--color-text-primary)',
                  backgroundColor: isSelected ? 'var(--color-learning-soft)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={16} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <CheckIcon size={16} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
