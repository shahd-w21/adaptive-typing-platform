import { useState, useRef, useEffect } from 'react';
import { usePreferences } from '../../context/preferences.js';
import { useTranslation } from '../../i18n/useTranslation.js';
import { GlobeIcon, CheckIcon } from '../ui/Icons.jsx';

export function LanguageSelector({ compact = false }) {
  const { uiLocale, setUiLocale } = usePreferences();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
  ];

  const currentLang = languages.find((l) => l.code === uiLocale) || languages[0];

  return (
    <div className="language-selector" ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t('preferences.language')}: ${currentLang.label}`}
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
        <GlobeIcon size={16} />
        {!compact && <span>{currentLang.label}</span>}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            insetInlineEnd: 0,
            zIndex: 100,
            width: '260px',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-control)',
            boxShadow: 'var(--shadow-popover)',
            padding: '8px',
          }}
        >
          <ul role="listbox" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {languages.map((lang) => {
              const isSelected = uiLocale === lang.code;
              return (
                <li
                  key={lang.code}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onClick={() => {
                    setUiLocale(lang.code);
                    setOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setUiLocale(lang.code);
                      setOpen(false);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
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
                  <span>{lang.label}</span>
                  {isSelected && <CheckIcon size={16} />}
                </li>
              );
            })}
          </ul>

          <div
            style={{
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px solid var(--color-border-subtle)',
              fontSize: '12px',
              lineHeight: '16px',
              color: 'var(--color-text-secondary)',
              paddingInline: '4px',
            }}
          >
            {t('preferences.langHelper')}
          </div>
        </div>
      )}
    </div>
  );
}
