import React, { useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation.js';
import { PlayIcon, ShieldIcon } from '../../components/ui/Icons.jsx';

export function TestsView({ onStartTimed, onStartCertified }) {
  const { t } = useTranslation();
  const [selectedDuration, setSelectedDuration] = useState(3);
  const [consentName, setConsentName] = useState(true);

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      <h1 className="text-heading-page" style={{ marginBottom: '8px' }}>
        Typing Tests & Certification
      </h1>
      <p className="text-body-default" style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
        Test your raw speed and accuracy under strict, unpaused conditions.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Timed Test Card */}
        <div className="surface-card">
          <div style={{ fontSize: '28px', marginBottom: '12px' }}>⏱️</div>
          <h2 className="text-heading-section" style={{ fontSize: '20px', marginBottom: '8px' }}>
            Timed Speed Test
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
            A standard timed passage test. Pause is disabled and idle time counts toward your elapsed duration.
          </p>

          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              Select Duration:
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[1, 3, 5].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDuration(d)}
                  style={{
                    flex: 1,
                    height: '40px',
                    borderRadius: 'var(--radius-control)',
                    border: '2px solid',
                    borderColor: selectedDuration === d ? 'var(--color-learning-accent)' : 'var(--color-border-subtle)',
                    backgroundColor: selectedDuration === d ? 'var(--color-learning-soft)' : 'var(--color-bg-surface)',
                    color: selectedDuration === d ? 'var(--color-learning-strong)' : 'var(--color-text-primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {d} Minute{d > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onStartTimed(selectedDuration)}
            className="btn-primary"
            style={{ width: '100%', height: '48px' }}
          >
            <PlayIcon size={18} />
            <span>Start {selectedDuration}-Minute Test</span>
          </button>
        </div>

        {/* Certified Test Card */}
        <div
          className="surface-card"
          style={{
            border: '2px solid var(--color-learning-accent)',
            backgroundColor: 'var(--color-bg-surface)',
          }}
        >
          <div style={{ color: 'var(--color-learning-strong)', marginBottom: '12px' }}>
            <ShieldIcon size={32} />
          </div>
          <h2 className="text-heading-section" style={{ fontSize: '20px', marginBottom: '8px' }}>
            Certified Performance Test
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
            Qualify for an authentic unproctored TypeFlow performance certificate. Requires minimum 95% raw accuracy.
          </p>

          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'var(--color-bg-subtle)',
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              Passing Thresholds:
            </div>
            <div>• Minimum 30 Net WPM</div>
            <div>• Minimum 95.0% Raw Accuracy</div>
            <div>• 3-Minute duration under strict focus</div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '20px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={consentName}
              onChange={(e) => setConsentName(e.target.checked)}
            />
            <span>Include my name on public verification record</span>
          </label>

          <button
            type="button"
            onClick={onStartCertified}
            className="btn-primary"
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: 'var(--color-learning-accent)',
              boxShadow: 'var(--lip-node)',
            }}
          >
            <span>Begin Certified Test</span>
          </button>
        </div>
      </div>
    </div>
  );
}
