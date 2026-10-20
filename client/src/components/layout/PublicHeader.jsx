import { useTranslation } from '../../i18n/useTranslation.js';
import { AppearanceSelector } from '../controls/AppearanceSelector.jsx';
import { LanguageSelector } from '../controls/LanguageSelector.jsx';
import { KeyboardIcon } from '../ui/Icons.jsx';

export function PublicHeader({ activeTab, onNavigate }) {
  const { t } = useTranslation();

  return (
    <header className="site-header sticky top-0 z-50 flex min-h-[var(--header-height)] flex-wrap items-center justify-between gap-2 border-b border-b-border-subtle bg-surface/90 px-3 py-2 backdrop-blur-xl sm:flex-nowrap sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3 sm:gap-5 lg:gap-8">
        {/* Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer p-0 no-underline"
        >
          <div
            className="flex size-8.5 items-center justify-center rounded-[10px] bg-learning-accent text-learning-foreground shadow-primary sm:size-9.5"
          >
            <KeyboardIcon size={22} />
          </div>
          <span
            className="font-display rtl:font-arabic text-[18px] font-extrabold tracking-[-0.5px] text-ink sm:text-[22px]"
          >
            TypeFlow
          </span>
        </button>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-3 sm:flex lg:gap-5">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className={[
              "bg-transparent border-0 cursor-pointer text-[15px] py-1.5 px-2",
              activeTab === 'landing' ? 'font-bold text-action-link' : 'font-medium text-muted',
            ].filter(Boolean).join(' ')}
          >
            {t('nav.home')}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('verify-cert')}
            className={[
              "bg-transparent border-0 cursor-pointer text-[15px] py-1.5 px-2",
              activeTab === 'verify-cert' ? 'font-bold text-action-link' : 'font-medium text-muted',
            ].filter(Boolean).join(' ')}
          >
            {t('nav.verifyCertificate')}
          </button>
        </nav>
      </div>

      {/* Right Action Tools */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-3">
        <LanguageSelector compact />
        <AppearanceSelector compact />

        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="rounded-full border-0 bg-transparent px-1.5 py-2 text-[12px] font-bold text-ink transition-colors hover:bg-subtle sm:px-3 sm:text-[15px]"
        >
          {t('nav.login')}
        </button>

        <button
          type="button"
          onClick={() => onNavigate('register')}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-full border-0 bg-action-primary px-2.5 text-[12px] font-bold text-action-foreground no-underline shadow-primary transition-[background-color,translate,box-shadow] hover:-translate-y-px hover:bg-action-hover active:translate-y-0.5 active:bg-action-pressed active:shadow-none disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text disabled:shadow-none sm:h-10 sm:px-4.5 sm:text-[15px]"
        >
          {t('nav.register')}
        </button>
      </div>
    </header>
  );
}
