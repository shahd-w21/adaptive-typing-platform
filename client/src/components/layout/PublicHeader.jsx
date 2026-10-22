// Public navigation uses the same destinations on desktop and in the mobile dialog.
import {
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useTranslation } from '../../i18n/useTranslation.js';
import { AppearanceSelector } from '../controls/AppearanceSelector.jsx';
import { LanguageSelector } from '../controls/LanguageSelector.jsx';
import { Dialog } from '../ui/Dialog.jsx';
import { KeyboardIcon, MenuIcon, XIcon } from '../ui/Icons.jsx';

/** Preserve FE-01 view callbacks while providing a keyboard-accessible mobile menu. */
export function PublicHeader({ activeTab, onNavigate }) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const previousTab = useRef(activeTab);

  useEffect(() => {
    if (previousTab.current !== activeTab) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
      previousTab.current = activeTab;
    }
  }, [activeTab]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const closeOnDesktop = () => {
      if (desktop.matches) {
        setMenuOpen(false);
      }
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  /** Close before invoking the page owner's navigation callback. */
  function navigate(view) {
    setMenuOpen(false);
    onNavigate(view);
  }

  const destinations = [
    { id: 'landing', label: t('nav.home') },
    { id: 'verify-cert', label: t('nav.verifyCertificate') },
  ];

  /** Keep phone and desktop destinations and selected-page semantics identical. */
  function renderLinks() {
    return destinations.map(item => (
      <button
        key={item.id}
        type="button"
        aria-current={activeTab === item.id ? 'page' : undefined}
        onClick={() => navigate(item.id)}
        className={`min-h-11 rounded-control px-3 py-2 text-start text-sm hover:bg-subtle ${activeTab === item.id ? 'font-bold text-action-link' : 'font-medium text-muted'}`}
      >
        {item.label}
      </button>
    ));
  }

  return (
    <>
      <a href="#main-content" className="skip-link">{t('navigation.skipToContent')}</a>
      <header className="site-header sticky top-0 z-50 flex min-h-[var(--header-height)] flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-surface/90 px-3 py-2 backdrop-blur-xl md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 lg:gap-6">
          <button type="button" onClick={() => navigate('landing')} aria-label={t('navigation.homeLabel')} className="flex min-h-11 items-center gap-2 rounded-control text-ink">
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-learning-accent text-learning-foreground shadow-primary">
              <KeyboardIcon size={22} />
            </span>
            <span className="font-display text-xl font-extrabold" lang="en" dir="ltr">TypeFlow</span>
          </button>
          <nav aria-label={t('navigation.public')} className="hidden items-center gap-2 md:flex">{renderLinks()}</nav>
        </div>
        <button type="button" className="flex size-11 items-center justify-center rounded-control text-ink hover:bg-subtle md:hidden" aria-label={t('nav.openMenu')} aria-expanded={menuOpen} aria-controls={menuId} onClick={() => setMenuOpen(true)}>
          <MenuIcon size={24} />
        </button>
        <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto">
          <LanguageSelector compact />
          <AppearanceSelector compact />
          <button type="button" onClick={() => navigate('login')} className="min-h-11 rounded-full px-3 py-2 text-sm font-bold text-ink hover:bg-subtle">{t('nav.login')}</button>
          <button type="button" onClick={() => navigate('register')} className="min-h-11 rounded-full bg-action-primary px-4 py-2 text-sm font-bold text-action-foreground shadow-primary hover:bg-action-hover">{t('nav.register')}</button>
        </div>
      </header>
      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} id={menuId} label={t('navigation.public')} className="m-0 me-auto h-dvh w-[min(20rem,90vw)] p-4">
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="font-display text-lg font-bold">{t('navigation.public')}</span>
          <button type="button" onClick={() => setMenuOpen(false)} aria-label={t('common.close')} className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-subtle"><XIcon /></button>
        </div>
        <nav aria-label={t('navigation.public')} className="flex flex-col gap-2">
          {renderLinks()}
          <button type="button" onClick={() => navigate('login')} className="min-h-11 rounded-control px-3 py-2 text-start font-bold hover:bg-subtle">{t('nav.login')}</button>
          <button type="button" onClick={() => navigate('register')} className="min-h-11 rounded-control bg-action-primary px-3 py-2 text-start font-bold text-action-foreground hover:bg-action-hover">{t('nav.register')}</button>
        </nav>
      </Dialog>
    </>
  );
}
