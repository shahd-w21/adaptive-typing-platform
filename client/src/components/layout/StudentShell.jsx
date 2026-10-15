import React, { useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation.js';
import { AppearanceSelector } from '../controls/AppearanceSelector.jsx';
import { LanguageSelector } from '../controls/LanguageSelector.jsx';
import {
  KeyboardIcon,
  FlameIcon,
  TrophyIcon,
  MenuIcon,
  XIcon,
} from '../ui/Icons.jsx';

export function StudentShell({
  activeTab = 'dashboard',
  onNavigate,
  children,
  user = { name: 'Layla', streak: 5, xp: 1420, level: 3 },
}) {
  const { t, isRTL } = useTranslation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-page)' }}>
      {/* Desktop Sidebar (224px wide) */}
      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--color-bg-surface)',
          borderInlineEnd: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
        }}
        className="student-sidebar"
      >
        {/* Brand */}
        <div
          style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            paddingInline: '20px',
            borderBottom: '1px solid var(--color-border-subtle)',
            gap: '10px',
            cursor: 'pointer',
          }}
          onClick={() => onNavigate('dashboard')}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-learning-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-learning-foreground)',
              boxShadow: 'var(--lip-primary)',
            }}
          >
            <KeyboardIcon size={20} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.5px',
            }}
          >
            TypeFlow
          </span>
        </div>

        {/* Nav Links */}
        <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} style={{ marginBottom: '4px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileDrawerOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-control)',
                      border: 'none',
                      backgroundColor: isActive ? 'var(--color-learning-soft)' : 'transparent',
                      color: isActive ? 'var(--color-learning-strong)' : 'var(--color-text-primary)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '14px',
                      cursor: 'pointer',
                      textAlign: isRTL ? 'right' : 'left',
                      fontFamily: 'inherit',
                      transition: 'background-color var(--motion-fast)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px' }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: 'var(--color-learning-accent)',
                          color: 'var(--color-learning-foreground)',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
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
          style={{
            padding: '16px',
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => onNavigate('profile')}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-learning-soft)',
                color: 'var(--color-learning-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              {user.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{user.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Level {user.level}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            height: 'var(--header-height)',
            backgroundColor: 'var(--color-bg-surface)',
            borderBottom: '1px solid var(--color-border-subtle)',
            paddingInline: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Mobile Menu Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="mobile-drawer-btn"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open navigation menu"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'none',
                color: 'var(--color-text-primary)',
              }}
            >
              <MenuIcon size={24} />
            </button>

            {/* Streak & Level Counter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--color-warning-soft)',
                  color: 'var(--color-streak-text)',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                <FlameIcon size={16} />
                <span>{user.streak} Days</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--color-reward-soft)',
                  color: 'var(--color-reward-text)',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                <TrophyIcon size={16} />
                <span>{user.xp} XP</span>
              </div>
            </div>
          </div>

          {/* Right Preferences */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LanguageSelector compact />
            <AppearanceSelector compact />
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '24px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
