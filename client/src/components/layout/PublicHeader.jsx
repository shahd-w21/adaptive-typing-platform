import React from 'react';
import { useTranslation } from '../../i18n/useTranslation.js';
import { AppearanceSelector } from '../controls/AppearanceSelector.jsx';
import { LanguageSelector } from '../controls/LanguageSelector.jsx';
import { KeyboardIcon } from '../ui/Icons.jsx';

export function PublicHeader({ activeTab, onNavigate }) {
  const { t } = useTranslation();

  return (
    <header className="shell-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {/* Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-learning-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-learning-foreground)',
              boxShadow: 'var(--lip-primary)',
            }}
          >
            <KeyboardIcon size={22} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.5px',
            }}
          >
            TypeFlow
          </span>
        </button>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: activeTab === 'landing' ? 700 : 500,
              color: activeTab === 'landing' ? 'var(--color-action-link)' : 'var(--color-text-secondary)',
              padding: '6px 8px',
            }}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate('verify-cert')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: activeTab === 'verify-cert' ? 700 : 500,
              color: activeTab === 'verify-cert' ? 'var(--color-action-link)' : 'var(--color-text-secondary)',
              padding: '6px 8px',
            }}
          >
            Verify Certificate
          </button>
        </nav>
      </div>

      {/* Right Action Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <LanguageSelector compact />
        <AppearanceSelector compact />

        <button
          type="button"
          onClick={() => onNavigate('login')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-pill)',
          }}
        >
          {t('nav.login')}
        </button>

        <button
          type="button"
          onClick={() => onNavigate('register')}
          className="btn-primary"
          style={{ height: '40px', padding: '0 18px', fontSize: '15px' }}
        >
          {t('nav.register')}
        </button>
      </div>
    </header>
  );
}
