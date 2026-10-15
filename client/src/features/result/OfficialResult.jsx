import React from 'react';
import { useTranslation } from '../../i18n/useTranslation.js';
import { TrophyIcon, FlameIcon, ArrowRightIcon, CheckIcon, RotateCcwIcon } from '../../components/ui/Icons.jsx';

export function OfficialResult({
  result = {
    netWpm: 48,
    grossWpm: 52,
    rawAccuracy: 96.4,
    finalAccuracy: 100,
    durationMs: 45000,
  },
  xpEarned = 75,
  streakDays = 5,
  reason = 'Great consistency! Your next activity focuses on strengthening right-hand pinky reach for P and semicolon.',
  onContinue,
  onRetry,
}) {
  const { t, isRTL } = useTranslation();

  return (
    <div
      className="official-result-view"
      style={{
        maxWidth: '840px',
        margin: '0 auto',
        padding: '32px 16px',
      }}
    >
      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--color-success-soft)',
            color: 'var(--color-success-text)',
            fontSize: '14px',
            fontWeight: 700,
            marginBottom: '12px',
          }}
        >
          <CheckIcon size={16} />
          <span>{t('results.officialResult')}</span>
        </div>
        <h1 className="text-heading-page">Session Completed!</h1>
        <p className="text-body-default" style={{ color: 'var(--color-text-secondary)', marginTop: '6px' }}>
          Official server-verified performance metrics
        </p>
      </div>

      {/* 4 Distinct Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {/* Net WPM */}
        <div className="surface-card" style={{ textAlign: 'center', padding: '20px' }}>
          <div className="text-caption-default" style={{ marginBottom: '6px', fontWeight: 700 }}>
            {t('typing.netWpm')}
          </div>
          <div className="text-metric-large" style={{ color: 'var(--color-learning-strong)' }}>
            {result.netWpm}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            words / min
          </div>
        </div>

        {/* Gross WPM */}
        <div className="surface-card" style={{ textAlign: 'center', padding: '20px' }}>
          <div className="text-caption-default" style={{ marginBottom: '6px', fontWeight: 700 }}>
            {t('typing.grossWpm')}
          </div>
          <div className="text-metric-large">{result.grossWpm}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            raw speed
          </div>
        </div>

        {/* Raw Accuracy */}
        <div className="surface-card" style={{ textAlign: 'center', padding: '20px' }}>
          <div className="text-caption-default" style={{ marginBottom: '6px', fontWeight: 700 }}>
            {t('typing.rawAccuracy')}
          </div>
          <div
            className="text-metric-large"
            style={{ color: result.rawAccuracy >= 95 ? 'var(--color-success-text)' : 'var(--color-warning-text)' }}
          >
            {result.rawAccuracy}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            accuracy gate
          </div>
        </div>

        {/* Final Accuracy */}
        <div className="surface-card" style={{ textAlign: 'center', padding: '20px' }}>
          <div className="text-caption-default" style={{ marginBottom: '6px', fontWeight: 700 }}>
            {t('typing.finalAccuracy')}
          </div>
          <div className="text-metric-large">{result.finalAccuracy}%</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            final buffer
          </div>
        </div>
      </div>

      {/* Explanatory Context Note for Metrics */}
      <div
        className="surface-card"
        style={{
          backgroundColor: 'var(--color-bg-subtle)',
          marginBottom: '28px',
          padding: '16px 20px',
          fontSize: '13px',
          lineHeight: '20px',
          color: 'var(--color-text-secondary)',
        }}
      >
        <p><strong>Raw Accuracy:</strong> {t('results.rawAccuracyHelp')}</p>
        <p style={{ marginTop: '4px' }}><strong>Final Accuracy:</strong> {t('results.finalAccuracyHelp')}</p>
      </div>

      {/* Rewards & Next Steps Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        {/* Rewards Earned Card */}
        <div className="surface-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--color-reward-text)' }}>
            <TrophyIcon size={20} />
            <span style={{ fontWeight: 700, fontSize: '15px' }}>{t('results.rewardsEarned')}</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--color-reward-soft)',
                color: 'var(--color-reward-text)',
                fontWeight: 700,
                fontSize: '15px',
              }}
            >
              <span>⭐</span>
              <span>{t('results.xpEarned', { count: xpEarned })}</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--color-warning-soft)',
                color: 'var(--color-streak-text)',
                fontWeight: 700,
                fontSize: '15px',
              }}
            >
              <FlameIcon size={18} />
              <span>{t('results.streakMaintained', { days: streakDays })}</span>
            </div>
          </div>
        </div>

        {/* Why This Practice / Next Activity Card */}
        <div className="surface-card">
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px', color: 'var(--color-learning-strong)' }}>
            {t('results.whyPractice')}
          </div>
          <p className="text-body-default" style={{ fontSize: '14px', lineHeight: '22px', color: 'var(--color-text-secondary)' }}>
            {reason}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
        <button
          type="button"
          onClick={onRetry}
          className="btn-secondary"
          style={{ height: '48px', padding: '0 24px' }}
        >
          <RotateCcwIcon size={18} />
          <span>Practise Again</span>
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="btn-primary"
          style={{ height: '48px', padding: '0 32px' }}
        >
          <span>{t('results.nextStep')}</span>
          <ArrowRightIcon size={18} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
        </button>
      </div>
    </div>
  );
}
