// Responsive authenticated shell; route guards and the server remain the authority for access.
import {
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useTranslation } from '../../i18n/useTranslation.js';
import { AppearanceSelector } from '../controls/AppearanceSelector.jsx';
import { LanguageSelector } from '../controls/LanguageSelector.jsx';
import { useGamification } from '../../features/gamification/hooks/useGamification.js';
import { Dialog } from '../ui/Dialog.jsx';
import {
  KeyboardIcon,
  FlameIcon,
  TrophyIcon,
  MenuIcon,
  CheckIcon,
  KeyboardIcon as PracticeIcon,
  RotateCcwIcon,
  ShieldIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  XIcon,
} from '../ui/Icons.jsx';

/** Share destinations, account actions and preferences between sidebar and drawer. */
export function StudentShell({
  activeTab = 'dashboard',
  onNavigate,
  onLogout,
  children,
  user = {},
}) {
  const { t, isRTL } = useTranslation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const navigationId = useId();
  const previousTab = useRef(activeTab);
  const role = user.role?.toLowerCase();
  const displayName = user.name || user.email || t('common.account');
  const gamificationQuery = useGamification(role === 'student');
  const gamification = gamificationQuery.data;
  const navigationLabel = t(role === 'admin' ? 'navigation.admin' : 'navigation.student');

  useEffect(() => {
    if (previousTab.current !== activeTab) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
      previousTab.current = activeTab;
    }
  }, [activeTab]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => {
      if (desktop.matches) {
        setMobileDrawerOpen(false);
      }
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: ArrowRightIcon },
    { id: 'courses', label: t('nav.courses'), icon: KeyboardIcon },
    { id: 'my-courses', label: t('nav.myCourses'), icon: CheckIcon },
    { id: 'path', label: t('nav.learningPath'), icon: CheckIcon },
    { id: 'practice', label: t('nav.practice'), icon: PracticeIcon },
    { id: 'review', label: t('nav.review'), icon: RotateCcwIcon },
    { id: 'tests', label: t('nav.tests'), icon: ShieldIcon },
    { id: 'progress', label: t('nav.progress'), icon: ArrowRightIcon },
    { id: 'achievements', label: t('nav.achievements'), icon: TrophyIcon },
    { id: 'certificates', label: t('nav.certificates'), icon: ShieldIcon },
    { id: 'forum', label: t('nav.forum'), icon: AlertCircleIcon },
    { id: 'admin', label: t('nav.admin'), icon: AlertCircleIcon },
  ];
  const visibleNavItems = role === 'admin'
    ? navItems.filter(item => item.id === 'admin')
    : role === 'student' ? navItems.filter(item => item.id !== 'admin') : [];

  const renderNav = () => (
    <ul className="m-0 list-none p-0">
      {visibleNavItems.map(item => {
        const isActive = activeTab === item.id;
        return (
          <li key={item.id} className="mb-1">
            <button type="button" aria-current={isActive ? 'page' : undefined} onClick={() => { onNavigate(item.id); setMobileDrawerOpen(false); }} className={[
              'flex min-h-11 w-full items-center justify-between rounded-control border-0 px-3.5 py-2.5 text-[14px] [font-family:inherit] [transition:background-color_var(--motion-fast)]',
              isActive ? 'bg-learning-soft font-bold text-learning-strong shadow-[inset_3px_0_0_var(--tf-color-learning-accent)] rtl:shadow-[inset_-3px_0_0_var(--tf-color-learning-accent)]' : 'bg-transparent font-medium text-ink hover:bg-subtle',
              isRTL ? 'text-right' : 'text-left',
            ].join(' ')}>
              <span className="flex items-center gap-2.5"><item.icon size={17} aria-hidden="true" /><span>{item.label}</span></span>
              {item.badge && <span className="rounded-full bg-learning-accent px-2 py-0.5 text-[11px] font-bold text-learning-foreground">{item.badge}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="flex min-h-screen min-w-0 bg-[radial-gradient(ellipse_at_78%_0%,color-mix(in_srgb,var(--tf-color-learning-soft)_45%,transparent),transparent_34rem)] bg-page">
      <a href="#main-content" className="skip-link">{t('navigation.skipToContent')}</a>
      {/* Desktop Sidebar (224px wide) */}
      <aside
        aria-label={navigationLabel}
        className="max-lg:hidden sticky top-0 z-40 flex h-dvh w-[var(--sidebar-width)] shrink-0 flex-col border-e border-e-border-subtle bg-surface/95 shadow-[1px_0_0_color-mix(in_srgb,var(--tf-color-border-subtle)_35%,transparent)] backdrop-blur"
      >
        {/* Brand */}
        <button type="button" className="flex h-[var(--header-height)] items-center gap-2.5 border-0 border-b border-b-border-subtle bg-transparent px-5 text-start" onClick={() => onNavigate(role === 'admin' ? 'admin' : 'dashboard')}>
          <span className="flex size-9 items-center justify-center rounded-[10px] bg-learning-accent text-learning-foreground shadow-primary" aria-hidden="true">
            <KeyboardIcon size={20} />
          </span>
          <span
            className="font-display rtl:font-arabic text-[20px] font-extrabold text-ink tracking-[-0.5px]"
          >
            TypeFlow
          </span>
        </button>

        {/* Nav Links */}
        <nav aria-label={navigationLabel} className="py-4 px-3 flex-1 overflow-y-auto">
          {renderNav()}
        </nav>

        {/* User Mini Card */}
        <div
          className="p-4 border-t border-t-border-subtle flex flex-wrap items-center justify-between gap-3"
        >
          <button type="button" aria-label={`${t('nav.profile')}: ${displayName}`} className="flex min-h-11 min-w-0 items-center gap-2.5 border-0 bg-transparent text-start" onClick={() => onNavigate('profile')}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-learning-soft text-[14px] font-bold text-learning-strong">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0"><span className="block truncate text-[14px] font-bold">{displayName}</span><span className="block text-[12px] text-muted">{role === 'admin' ? t('common.administrator') : `${t('common.level')} ${user.level ?? 1}`}</span></span>
          </button>
          {onLogout && <button type="button" onClick={onLogout} className="min-h-11 rounded-full border border-border-control bg-surface px-3 py-2 text-xs font-bold text-ink hover:bg-subtle">{t('nav.logout')}</button>}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header
          className="site-header sticky top-0 z-30 flex min-h-[var(--header-height)] flex-wrap items-center justify-between gap-2 border-b border-b-border-subtle bg-surface/90 px-3 py-2 backdrop-blur-xl sm:flex-nowrap sm:px-6"
        >
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-control bg-transparent text-ink hover:bg-subtle lg:hidden"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label={t('nav.openMenu')}
              aria-expanded={mobileDrawerOpen}
              aria-controls={navigationId}
            >
              <MenuIcon size={24} />
            </button>

            {/* Streak & Level Counter */}
            {role === 'student' ? <div className="flex flex-wrap items-center gap-3 max-sm:gap-1.5">
              <div
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-warning-soft text-streak-text text-[13px] font-bold"
              >
                <FlameIcon size={16} />
                <span>{gamification?.streak ?? user.streak ?? 0} {t('common.days')}</span>
              </div>

              <div
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-reward-soft text-reward-text text-[13px] font-bold"
              >
                <TrophyIcon size={16} />
                <span dir="ltr">{gamification?.xp ?? user.xp ?? 0} XP</span>
              </div>
            </div> : <span className="font-bold text-ink">{t('nav.admin')}</span>}
          </div>

          {/* Right Preferences */}
          <div className="flex items-center gap-2">
            <LanguageSelector compact />
            <AppearanceSelector compact />
          </div>
        </header>

        {/* Page Content */}
        <main id="main-content" tabIndex={-1} className="mx-auto my-0 w-full min-w-0 max-w-360 flex-1 px-4 py-7 sm:px-6 sm:py-9 [&_h1]:tracking-[-0.035em] [&_h1]:leading-tight">
          {children}
        </main>
      </div>
      <Dialog
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        id={navigationId}
        label={navigationLabel}
        className="m-0 me-auto h-dvh w-[min(20rem,90vw)] p-4"
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="font-display text-lg font-bold">TypeFlow</span>
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            aria-label={t('common.close')}
            className="flex size-11 items-center justify-center rounded-full text-ink hover:bg-subtle"
          >
            <XIcon size={19} />
          </button>
        </div>
        <nav aria-label={navigationLabel}>{renderNav()}</nav>
        <div className="mt-5 flex flex-col gap-3 border-t border-border-subtle pt-4">
          <button
            type="button"
            onClick={() => {
              setMobileDrawerOpen(false);
              onNavigate('profile');
            }}
            className="min-h-11 rounded-control px-3 py-2 text-start font-bold hover:bg-subtle"
          >
            {t('nav.profile')}
          </button>
          {onLogout && (
            <button
              type="button"
              onClick={() => {
                setMobileDrawerOpen(false);
                onLogout();
              }}
              className="min-h-11 rounded-control px-3 py-2 text-start font-bold text-error-text hover:bg-error-soft"
            >
              {t('nav.logout')}
            </button>
          )}
        </div>
      </Dialog>
    </div>
  );
}
