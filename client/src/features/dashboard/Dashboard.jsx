import React from 'react';
import { useTranslation } from '../../i18n/useTranslation.js';
import { PlayIcon, FlameIcon, TrophyIcon, ArrowRightIcon, CheckIcon } from '../../components/ui/Icons.jsx';

export function Dashboard({ onStartPractice, onNavigate }) {
  const { t, isRTL } = useTranslation();

  const recentSessions = [
    { id: 's1', mode: 'Adaptive Practice', netWpm: 48, rawAccuracy: 96, date: 'Today, 2:30 PM' },
    { id: 's2', mode: 'Spaced Review', netWpm: 52, rawAccuracy: 98, date: 'Yesterday' },
    { id: 's3', mode: 'Timed Test (3m)', netWpm: 46, rawAccuracy: 94, date: '2 days ago' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '24px' }} className="dashboard-grid">
      {/* Main Primary Content Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Welcome Banner */}
        <div>
          <h1 className="text-heading-page" style={{ marginBottom: '6px' }}>
            Welcome back, Layla!
          </h1>
          <p className="text-body-default" style={{ color: 'var(--color-text-secondary)' }}>
            Let's keep building your touch typing accuracy and speed.
          </p>
        </div>

        {/* Large Hero Recommendation Card */}
        <div
          className="surface-card"
          style={{
            border: '2px solid var(--color-learning-accent)',
            backgroundColor: 'var(--color-bg-surface)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-learning-soft)',
              color: 'var(--color-learning-strong)',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '14px',
            }}
          >
            <span>🎯 RECOMMENDED NEXT ACTIVITY</span>
          </div>

          <h2 className="text-heading-section" style={{ marginBottom: '8px' }}>
            Home Row Mastery & Upper Reach
          </h2>

          <p className="text-body-default" style={{ color: 'var(--color-text-secondary)', marginBottom: '20px', maxWidth: '640px' }}>
            <strong>Why this practice?</strong> You have less evidence for these keys. Practise them to strengthen finger agility before advancing to the next group.
          </p>

          {/* Focus Keys Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Focus keys:</span>
            {['p', ';', '/', 'e'].map((k) => (
              <span
                key={k}
                className="english-island"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '2px solid var(--color-border-control)',
                  backgroundColor: 'var(--color-bg-subtle)',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                {k}
              </span>
            ))}
          </div>

          {/* Start CTA with 4px node lip */}
          <button
            type="button"
            onClick={onStartPractice}
            className="btn-primary"
            style={{
              height: '52px',
              padding: '0 32px',
              fontSize: '17px',
              boxShadow: 'var(--lip-node)',
              backgroundColor: 'var(--color-learning-accent)',
              color: 'var(--color-learning-foreground)',
            }}
          >
            <PlayIcon size={20} />
            <span>Start Practice (2 mins)</span>
          </button>
        </div>

        {/* Compact Path Preview */}
        <div className="surface-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="text-heading-card">Your Learning Path</h3>
            <button
              type="button"
              onClick={() => onNavigate('path')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-action-link)',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>View Full Map</span>
              <ArrowRightIcon size={16} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', overflowX: 'auto', padding: '12px 0' }}>
            {/* Step 1: Mastered */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success-soft)',
                  border: '2px solid var(--color-success-accent)',
                  color: 'var(--color-success-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckIcon size={24} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>Home Row</span>
            </div>

            <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-success-accent)' }} />

            {/* Step 2: Current Node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-learning-accent)',
                  color: 'var(--color-learning-foreground)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--lip-node)',
                  cursor: 'pointer',
                }}
                onClick={onStartPractice}
              >
                <PlayIcon size={24} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-learning-strong)' }}>Top Row</span>
            </div>

            <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-border-subtle)' }} />

            {/* Step 3: Locked */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-disabled-bg)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-disabled-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                🔒
              </div>
              <span style={{ fontSize: '12px' }}>Bottom Row</span>
            </div>
          </div>
        </div>

        {/* Recent Sessions Table */}
        <div className="surface-card">
          <h3 className="text-heading-card" style={{ marginBottom: '16px' }}>
            Recent Sessions
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                <th style={{ padding: '8px 12px' }}>Activity</th>
                <th style={{ padding: '8px 12px' }}>Net Speed</th>
                <th style={{ padding: '8px 12px' }}>Raw Accuracy</th>
                <th style={{ padding: '8px 12px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((session) => (
                <tr key={session.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', fontSize: '14px' }}>
                  <td style={{ padding: '12px' }}>{session.mode}</td>
                  <td style={{ padding: '12px', fontWeight: 700 }} className="english-island">{session.netWpm} WPM</td>
                  <td style={{ padding: '12px' }} className="english-island">{session.rawAccuracy}%</td>
                  <td style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>{session.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Desktop Right Rail (280px wide) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Daily Goal Card */}
        <div className="surface-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>Daily Goal</span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>15 / 20 mins</span>
          </div>
          <div style={{ height: '8px', backgroundColor: 'var(--color-border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '75%', height: '100%', backgroundColor: 'var(--color-success-accent)', borderRadius: '4px' }} />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
            5 more minutes to reach today's target!
          </p>
        </div>

        {/* Due Review Card */}
        <div className="surface-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>Spaced Review</span>
            <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-learning-soft)', color: 'var(--color-learning-strong)', fontSize: '11px', fontWeight: 700 }}>
              3 Keys Due
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '14px' }}>
            Keys <strong>E, R, T</strong> are scheduled for memory consolidation.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('review')}
            className="btn-secondary"
            style={{ width: '100%', height: '40px', fontSize: '14px' }}
          >
            Start Review
          </button>
        </div>

        {/* Current Streak Card */}
        <div className="surface-card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-warning-soft)',
              color: 'var(--color-streak-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FlameIcon size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px' }}>5 Day Streak!</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Practised today</div>
          </div>
        </div>
      </div>
    </div>
  );
}
