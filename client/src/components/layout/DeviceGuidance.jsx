import React from 'react';
import { useTranslation } from '../../i18n/useTranslation.js';
import { MonitorIcon, KeyboardIcon, ArrowLeftIcon } from '../ui/Icons.jsx';

export function DeviceGuidance({ onBack }) {
  const { t, isRTL } = useTranslation();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        maxWidth: '540px',
        margin: '40px auto',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '24px',
          backgroundColor: 'var(--color-warning-soft)',
          color: 'var(--color-warning-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <KeyboardIcon size={36} />
      </div>

      <h2 className="text-heading-section" style={{ marginBottom: '12px' }}>
        {t('typing.deviceGuidanceTitle')}
      </h2>

      <p className="text-body-default" style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', maxWidth: '420px' }}>
        {t('typing.deviceGuidanceDesc')}
      </p>

      <div
        className="surface-card"
        style={{
          textAlign: isRTL ? 'right' : 'left',
          width: '100%',
          marginBottom: '24px',
          backgroundColor: 'var(--color-bg-subtle)',
          fontSize: '14px',
          lineHeight: '22px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontWeight: 700 }}>
          <MonitorIcon size={18} />
          <span>Minimum Requirements:</span>
        </div>
        <ul style={{ paddingInlineStart: '20px', margin: 0, color: 'var(--color-text-secondary)' }}>
          <li>Desktop or Laptop computer</li>
          <li>Physical English QWERTY keyboard</li>
          <li>Viewport width of at least 1024 CSS pixels</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="btn-primary"
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <ArrowLeftIcon size={18} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
        <span>Back to Dashboard</span>
      </button>
    </div>
  );
}
