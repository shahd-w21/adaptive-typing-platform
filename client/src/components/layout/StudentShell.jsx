import { useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation.js';
import { AppearanceSelector } from '../controls/AppearanceSelector.jsx';
import { LanguageSelector } from '../controls/LanguageSelector.jsx';
import {
  KeyboardIcon,
  FlameIcon,
  TrophyIcon,
  MenuIcon,
} from '../ui/Icons.jsx';

export function StudentShell({
  activeTab = 'dashboard',
  onNavigate,
  children,
  user = { name: 'Layla', streak: 5, xp: 1420, level: 3 },
}) {
  const { t, isRTL } = useTranslation();
  const [, setMobileDrawerOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: '📊' },
    { id: 'path', label: t('nav.learningPath'), icon: '🗺️' },
    { id: 'practice', label: t('nav.practice'), icon: '⌨️' },
    { id: 'review', label: t('nav.review'), icon: '🔄', badge: '3' },
    { id: 'tests', label: t('nav.tests'), icon: '⏱️' },
    { id: 'progress', label: t('nav.progress'), icon: '📈' },
    { id: 'achievements', label: t('nav.achievements'), icon: '🏆' },
    { id: 'certificates', label: t('nav.certificates'), icon: '📜' },
    { id: 'forum', label: t('nav.forum'), icon: '💬' },
    { id: 'admin', label: t('nav.admin'), icon: '⚙️' },
  ];

  return (
    <div className="flex min-h-screen bg-page">
      {/* Desktop Sidebar (224px wide) */}
      <aside
        className="max-lg:hidden w-[var(--sidebar-width)] bg-surface border-e border-e-border-subtle flex flex-col sticky top-0 h-screen z-40"
      >
        {/* Brand */}
        <div
          className="h-[var(--header-height)] flex items-center px-5 border-b border-b-border-subtle gap-2.5 cursor-pointer"
          onClick={() => onNavigate('dashboard')}
        >
          <div
            className="w-9 h-9 rounded-[10px] bg-learning-accent flex items-center justify-center text-learning-foreground shadow-primary"
          >
            <KeyboardIcon size={20} />
          </div>
          <span
            className="font-display rtl:font-arabic text-[20px] font-extrabold text-ink tracking-[-0.5px]"
          >
            TypeFlow
          </span>
        </div>

        {/* Nav Links */}
        <nav className="py-4 px-3 flex-1 overflow-y-auto">
          <ul className="list-none m-0 p-0">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} className="mb-1">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileDrawerOpen(false);
                    }}
                    className={[
                      "w-full flex items-center justify-between py-2.5 px-3.5 rounded-control border-0 text-[14px] cursor-pointer [font-family:inherit] [transition:background-color_var(--motion-fast)]",
                      isActive ? 'bg-learning-soft text-learning-strong font-bold' : 'bg-transparent text-ink font-medium hover:bg-subtle',
                      isRTL ? 'text-right' : 'text-left',
                    ].filter(Boolean).join(' ')}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[16px]">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className="py-0.5 px-2 rounded-full bg-learning-accent text-learning-foreground text-[11px] font-bold"
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Mini Card */}
        <div
          className="p-4 border-t border-t-border-subtle flex items-center justify-between"
        >
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => onNavigate('profile')}
          >
            <div
              className="w-9 h-9 rounded-full bg-learning-soft text-learning-strong flex items-center justify-center font-bold text-[14px]"
            >
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="text-[14px] font-bold">{user.name}</div>
              <div className="text-[12px] text-muted">Level {user.level}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header
          className="h-[var(--header-height)] bg-surface border-b border-b-border-subtle px-6 flex items-center justify-between sticky top-0 z-30"
        >
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="max-lg:block bg-transparent border-0 cursor-pointer hidden text-ink"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open navigation menu"
            >
              <MenuIcon size={24} />
            </button>

            {/* Streak & Level Counter */}
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-warning-soft text-streak-text text-[13px] font-bold"
              >
                <FlameIcon size={16} />
                <span>{user.streak} Days</span>
              </div>

              <div
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-reward-soft text-reward-text text-[13px] font-bold"
              >
                <TrophyIcon size={16} />
                <span>{user.xp} XP</span>
              </div>
            </div>
          </div>

          {/* Right Preferences */}
          <div className="flex items-center gap-3">
            <LanguageSelector compact />
            <AppearanceSelector compact />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 max-w-360 w-full my-0 mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
