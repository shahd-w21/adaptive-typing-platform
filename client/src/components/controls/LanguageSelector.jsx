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
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t('preferences.language')}: ${currentLang.label}`}
        className={[
          "flex items-center gap-2 py-0 px-3 bg-surface border border-border-subtle rounded-full text-ink cursor-pointer [font-family:inherit] text-[14px] font-bold [transition:border-color_var(--motion-fast)] hover:border-border-control",
          compact ? 'h-9' : 'h-10',
        ].filter(Boolean).join(' ')}
      >
        <GlobeIcon size={16} />
        {!compact && <span>{currentLang.label}</span>}
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%_+_6px)] end-0 z-100 w-65 bg-surface border border-border-subtle rounded-control shadow-popover p-2"
        >
          <ul role="listbox" className="list-none m-0 p-0">
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
                  className={[
                    "flex items-center justify-between py-2.5 px-3 rounded-lg cursor-pointer text-[15px]",
                    isSelected ? 'font-bold text-learning-strong bg-learning-soft' : 'font-normal text-ink bg-transparent hover:bg-subtle',
                  ].filter(Boolean).join(' ')}
                >
                  <span>{lang.label}</span>
                  {isSelected && <CheckIcon size={16} />}
                </li>
              );
            })}
          </ul>

          <div
            className="mt-2 pt-2 border-t border-t-border-subtle text-[12px] leading-[16px] text-muted px-1"
          >
            {t('preferences.langHelper')}
          </div>
        </div>
      )}
    </div>
  );
}
