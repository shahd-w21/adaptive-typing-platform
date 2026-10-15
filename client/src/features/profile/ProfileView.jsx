import React, { useState } from 'react';
import { usePreferences } from '../../context/PreferencesContext.jsx';
import { useTranslation } from '../../i18n/useTranslation.js';
import { SunIcon, MoonIcon, MonitorIcon, AlertCircleIcon } from '../../components/ui/Icons.jsx';

export function ProfileView() {
  const {
    themePreference,
    setThemePreference,
    uiLocale,
    setUiLocale,
    largeText,
    setLargeText,
    reducedPressure,
    setReducedPressure,
  } = usePreferences();
  const { t } = useTranslation();

  const [targetWpm, setTargetWpm] = useState(60);
  const [displayName, setDisplayName] = useState('Layla M.');
  const [consentCertName, setConsentCertName] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <h1 className="text-heading-page" style={{ marginBottom: '8px' }}>
        Profile & Learning Preferences
      </h1>
      <p className="text-body-default" style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
        Manage account details, presentation theme, language, and accessibility options.
      </p>

      {/* Account Info Card */}
      <div className="surface-card" style={{ marginBottom: '24px' }}>
        <h2 className="text-heading-card" style={{ marginBottom: '16px' }}>Account Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Display Name</label>
            <input type="text" className="form-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Email Address</label>
            <input type="email" disabled className="form-input" value="layla@example.com" style={{ opacity: 0.7 }} />
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={consentCertName} onChange={(e) => setConsentCertName(e.target.checked)} />
            <span>Show my display name on public verification records for certificates</span>
          </label>
        </div>
      </div>

      {/* Appearance & Language Card */}
      <div className="surface-card" style={{ marginBottom: '24px' }}>
        <h2 className="text-heading-card" style={{ marginBottom: '16px' }}>Appearance & Interface Language</h2>

        {/* Theme Radios */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
            Color Mode
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { id: 'light', label: 'Light', icon: SunIcon },
              { id: 'dark', label: 'Dark', icon: MoonIcon },
              { id: 'system', label: 'System', icon: MonitorIcon },
            ].map((theme) => {
              const Icon = theme.icon;
              const isSelected = themePreference === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setThemePreference(theme.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px',
                    borderRadius: 'var(--radius-control)',
                    border: '2px solid',
                    borderColor: isSelected ? 'var(--color-learning-accent)' : 'var(--color-border-subtle)',
                    backgroundColor: isSelected ? 'var(--color-learning-soft)' : 'var(--color-bg-surface)',
                    color: isSelected ? 'var(--color-learning-strong)' : 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontWeight: isSelected ? 700 : 500,
                  }}
                >
                  <Icon size={24} />
                  <span>{theme.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <span style={{ fontSize: '14px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
            Interface Language (لغة الواجهة)
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setUiLocale('en')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-control)',
                border: '2px solid',
                borderColor: uiLocale === 'en' ? 'var(--color-learning-accent)' : 'var(--color-border-subtle)',
                backgroundColor: uiLocale === 'en' ? 'var(--color-learning-soft)' : 'var(--color-bg-surface)',
                color: uiLocale === 'en' ? 'var(--color-learning-strong)' : 'var(--color-text-primary)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setUiLocale('ar')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-control)',
                border: '2px solid',
                borderColor: uiLocale === 'ar' ? 'var(--color-learning-accent)' : 'var(--color-border-subtle)',
                backgroundColor: uiLocale === 'ar' ? 'var(--color-learning-soft)' : 'var(--color-bg-surface)',
                color: uiLocale === 'ar' ? 'var(--color-learning-strong)' : 'var(--color-text-primary)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              العربية
            </button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
            {t('preferences.langHelper')}
          </p>
        </div>
      </div>

      {/* Typing & Accessibility Settings Card */}
      <div className="surface-card" style={{ marginBottom: '24px' }}>
        <h2 className="text-heading-card" style={{ marginBottom: '16px' }}>Typing Target & Accessibility</h2>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: 700 }}>Personal Target Net Speed</label>
            <span className="english-island" style={{ fontWeight: 800, color: 'var(--color-learning-strong)' }}>
              {targetWpm} WPM
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="120"
            step="5"
            value={targetWpm}
            onChange={(e) => setTargetWpm(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Used to calibrate expected latency targets for upcoming lessons.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>Large Text Mode</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Enlarges exercise font from 28px to 36px</div>
            </div>
            <input type="checkbox" checked={largeText} onChange={(e) => setLargeText(e.target.checked)} />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>Reduced Pressure Mode</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Hides live speed and timer emphasis during typing</div>
            </div>
            <input type="checkbox" checked={reducedPressure} onChange={(e) => setReducedPressure(e.target.checked)} />
          </label>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="surface-card" style={{ borderColor: 'var(--color-error-text)' }}>
        <h2 className="text-heading-card" style={{ color: 'var(--color-error-text)', marginBottom: '8px' }}>
          Danger Zone
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
          Permanently delete your account. This irreversibly anonymises your personal history, certificates, and forum posts according to SRS SYS-9.
        </p>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="btn-primary"
          style={{ backgroundColor: 'var(--color-error-text)', height: '42px', fontSize: '14px' }}
        >
          Delete Account
        </button>
      </div>

      {/* Deletion Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--color-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div className="surface-card" style={{ maxWidth: '440px', textAlign: 'center' }}>
            <div style={{ color: 'var(--color-error-text)', marginBottom: '12px' }}>
              <AlertCircleIcon size={36} />
            </div>
            <h3 className="text-heading-section" style={{ fontSize: '20px', marginBottom: '8px' }}>
              Confirm Irreversible Deletion
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              All private keystroke sessions and account credentials will be erased. Verification records will no longer show your name.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button type="button" onClick={() => setShowDeleteModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Account deletion request acknowledged.');
                  setShowDeleteModal(false);
                }}
                className="btn-primary"
                style={{ backgroundColor: 'var(--color-error-text)' }}
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
