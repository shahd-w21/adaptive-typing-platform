import React, { useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation.js';

export function ProgressView() {
  const { isRTL } = useTranslation();
  const [filterMode, setFilterMode] = useState('all');

  const historyData = [
    { id: '1', date: 'Oct 14, 2026', mode: 'Adaptive Practice', netWpm: 52, grossWpm: 54, rawAccuracy: 97.4, finalAccuracy: 100 },
    { id: '2', date: 'Oct 14, 2026', mode: 'Spaced Review', netWpm: 50, grossWpm: 51, rawAccuracy: 98.1, finalAccuracy: 100 },
    { id: '3', date: 'Oct 13, 2026', mode: 'Timed Test (3m)', netWpm: 48, grossWpm: 52, rawAccuracy: 94.6, finalAccuracy: 98 },
    { id: '4', date: 'Oct 12, 2026', mode: 'Adaptive Practice', netWpm: 45, grossWpm: 49, rawAccuracy: 95.0, finalAccuracy: 100 },
    { id: '5', date: 'Oct 11, 2026', mode: 'Adaptive Practice', netWpm: 42, grossWpm: 46, rawAccuracy: 93.2, finalAccuracy: 96 },
  ];

  const filteredHistory = filterMode === 'all'
    ? historyData
    : historyData.filter((h) => h.mode.toLowerCase().includes(filterMode));

  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="text-heading-page" style={{ marginBottom: '4px' }}>
            Progress & Session Analytics
          </h1>
          <p className="text-body-default" style={{ color: 'var(--color-text-secondary)' }}>
            Track speed development and raw accuracy stability over time.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'adaptive', 'review', 'test'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterMode(f)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--color-border-subtle)',
                backgroundColor: filterMode === f ? 'var(--color-action-primary)' : 'var(--color-bg-surface)',
                color: filterMode === f ? 'var(--color-action-foreground)' : 'var(--color-text-primary)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Speed & Accuracy Trend Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        <div className="surface-card">
          <div className="text-caption-default">Average Net Speed</div>
          <div className="text-display-lg english-island" style={{ color: 'var(--color-learning-strong)', margin: '8px 0' }}>
            47.4 <span style={{ fontSize: '20px', color: 'var(--color-text-secondary)' }}>WPM</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-success-text)', fontWeight: 700 }}>
            ↑ +5.4 WPM in the last 7 days
          </div>
        </div>

        <div className="surface-card">
          <div className="text-caption-default">Average Raw Accuracy</div>
          <div className="text-display-lg english-island" style={{ color: 'var(--color-success-text)', margin: '8px 0' }}>
            95.7%
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Consistently above the 95% gate
          </div>
        </div>
      </div>

      {/* Historical Sessions Table */}
      <div className="surface-card">
        <h2 className="text-heading-card" style={{ marginBottom: '16px' }}>
          Session Records
        </h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
              <th style={{ padding: '10px 12px' }}>Date</th>
              <th style={{ padding: '10px 12px' }}>Mode</th>
              <th style={{ padding: '10px 12px' }}>Net WPM</th>
              <th style={{ padding: '10px 12px' }}>Gross WPM</th>
              <th style={{ padding: '10px 12px' }}>Raw Accuracy</th>
              <th style={{ padding: '10px 12px' }}>Final Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', fontSize: '14px' }}>
                <td style={{ padding: '12px' }}>{s.date}</td>
                <td style={{ padding: '12px' }}>{s.mode}</td>
                <td style={{ padding: '12px', fontWeight: 700 }} className="english-island">{s.netWpm}</td>
                <td style={{ padding: '12px' }} className="english-island">{s.grossWpm}</td>
                <td style={{ padding: '12px' }} className="english-island">{s.rawAccuracy}%</td>
                <td style={{ padding: '12px' }} className="english-island">{s.finalAccuracy}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
