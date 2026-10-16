import { useState, useRef, useEffect } from 'react';
import { usePreferences } from '../../context/preferences.js';
import { useTranslation } from '../../i18n/useTranslation.js';
import { SunIcon, MoonIcon, MonitorIcon, CheckIcon } from '../ui/Icons.jsx';

export function AppearanceSelector({ compact = false }) {
  const { themePreference, setThemePreference } = usePreferences();
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
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t('preferences.appearance')}: ${currentOption.label}`}
        className={[
          "flex items-center gap-2 py-0 px-3 bg-surface border border-border-subtle rounded-full text-ink cursor-pointer [font-family:inherit] text-[14px] font-bold [transition:border-color_var(--motion-fast)] hover:border-border-control",
          compact ? 'h-9' : 'h-10',
        ].filter(Boolean).join(' ')}
      >
        <CurrentIcon size={16} />
        {!compact && <span>{currentOption.label}</span>}
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute top-[calc(100%_+_6px)] end-0 z-100 min-w-37.5 bg-surface border border-border-subtle rounded-control shadow-popover p-1.5 list-none m-0"
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
                className={[
                  "flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer text-[14px]",
                  isSelected ? 'font-bold text-learning-strong bg-learning-soft' : 'font-normal text-ink bg-transparent hover:bg-subtle',
                ].filter(Boolean).join(' ')}
              >
                <div className="flex items-center gap-2">
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
