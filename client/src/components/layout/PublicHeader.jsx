import { useTranslation } from '../../i18n/useTranslation.js';
import { AppearanceSelector } from '../controls/AppearanceSelector.jsx';
import { LanguageSelector } from '../controls/LanguageSelector.jsx';
import { KeyboardIcon } from '../ui/Icons.jsx';

export function PublicHeader({ activeTab, onNavigate }) {
  const { t } = useTranslation();

  return (
    <header className="h-[var(--header-height)] flex items-center justify-between border-b border-b-border-subtle bg-surface px-8 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        {/* Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer p-0 no-underline"
        >
          <div
            className="w-9.5 h-9.5 rounded-[10px] bg-learning-accent flex items-center justify-center text-learning-foreground shadow-primary"
          >
            <KeyboardIcon size={22} />
          </div>
          <span
            className="font-display rtl:font-arabic text-[22px] font-extrabold text-ink tracking-[-0.5px]"
          >
            TypeFlow
          </span>
        </button>

        {/* Navigation Links */}
        <nav className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className={[
              "bg-transparent border-0 cursor-pointer text-[15px] py-1.5 px-2",
              activeTab === 'landing' ? 'font-bold text-action-link' : 'font-medium text-muted',
            ].filter(Boolean).join(' ')}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate('verify-cert')}
            className={[
              "bg-transparent border-0 cursor-pointer text-[15px] py-1.5 px-2",
              activeTab === 'verify-cert' ? 'font-bold text-action-link' : 'font-medium text-muted',
            ].filter(Boolean).join(' ')}
          >
            Verify Certificate
          </button>
        </nav>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-3">
        <LanguageSelector compact />
        <AppearanceSelector compact />

        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="bg-transparent border-0 cursor-pointer text-[15px] font-bold text-ink py-2 px-3.5 rounded-full"
        >
          {t('nav.login')}
        </button>

        <button
          type="button"
          onClick={() => onNavigate('register')}
          className="inline-flex items-center justify-center gap-2 font-body rtl:font-arabic font-bold text-action-foreground bg-action-primary border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none h-10 py-0 px-4.5 text-[15px]"
        >
          {t('nav.register')}
        </button>
      </div>
    </header>
  );
}
