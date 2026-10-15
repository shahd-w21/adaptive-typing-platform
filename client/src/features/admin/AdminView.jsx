import React, { useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation.js';

export function AdminView() {
  const { isRTL } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'settings' | 'moderation'

  // Mock platform analytics per SYS-44
  const platformStats = {
    activeLearners: 142,
    sessionsCompleted: 1840,
    aiPassRate: '94.8%',
    fallbackRate: '5.2%',
    currentGate: '95.0%',
    engineVersion: 'v1.2.0',
  };

  const users = [
    { id: 'u1', name: 'Omar S.', email: 'omar@example.com', role: 'Admin', status: 'Active', isLastAdmin: false },
    { id: 'u2', name: 'Layla M.', email: 'layla@example.com', role: 'Student', status: 'Active', isLastAdmin: false },
    { id: 'u3', name: 'Karim D.', email: 'karim@example.com', role: 'Student', status: 'Active', isLastAdmin: false },
    { id: 'u4', name: 'System Root', email: 'admin@typeflow.edu', role: 'Admin', status: 'Active', isLastAdmin: true },
  ];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="text-heading-page" style={{ marginBottom: '4px' }}>
            Platform Administration
          </h1>
          <p className="text-body-default" style={{ color: 'var(--color-text-secondary)' }}>
            Supervise learning health, adaptive settings, content generation, and accounts.
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'overview', label: 'Analytics' },
            { id: 'users', label: 'Users' },
            { id: 'settings', label: 'Learning Settings' },
            { id: 'moderation', label: 'Moderation' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--color-border-subtle)',
                backgroundColor: activeTab === tab.id ? 'var(--color-action-primary)' : 'var(--color-bg-surface)',
                color: activeTab === tab.id ? 'var(--color-action-foreground)' : 'var(--color-text-primary)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Key Aggregates Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="surface-card">
              <div className="text-caption-default">Active Learners (24h)</div>
              <div className="text-display-lg english-island" style={{ color: 'var(--color-learning-strong)', margin: '8px 0' }}>
                {platformStats.activeLearners}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Logged-in students</div>
            </div>

            <div className="surface-card">
              <div className="text-caption-default">Sessions Completed</div>
              <div className="text-display-lg english-island" style={{ margin: '8px 0' }}>
                {platformStats.sessionsCompleted}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total scored replays</div>
            </div>

            <div className="surface-card">
              <div className="text-caption-default">AI Feasibility Pass Rate</div>
              <div className="text-display-lg english-island" style={{ color: 'var(--color-success-text)', margin: '8px 0' }}>
                {platformStats.aiPassRate}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Feasible generation specs</div>
            </div>

            <div className="surface-card">
              <div className="text-caption-default">Curated Fallback Rate</div>
              <div className="text-display-lg english-island" style={{ margin: '8px 0' }}>
                {platformStats.fallbackRate}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Offline drill safety net</div>
            </div>
          </div>

          <div className="surface-card">
            <h3 className="text-heading-card" style={{ marginBottom: '12px' }}>Engine Health & Stability</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '22px' }}>
              All submission payloads are verified against server-stored assigned passages. No unvalidated characters or locked keygroups were introduced. Fallback offline generators are fully operational.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="surface-card">
          <h2 className="text-heading-card" style={{ marginBottom: '16px' }}>User Directory</h2>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                <th style={{ padding: '10px 12px' }}>Name</th>
                <th style={{ padding: '10px 12px' }}>Email</th>
                <th style={{ padding: '10px 12px' }}>Role</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', fontSize: '14px' }}>
                  <td style={{ padding: '12px', fontWeight: 700 }}>{u.name}</td>
                  <td style={{ padding: '12px' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: u.role === 'Admin' ? 'var(--color-learning-soft)' : 'var(--color-bg-subtle)',
                        color: u.role === 'Admin' ? 'var(--color-learning-strong)' : 'var(--color-text-primary)',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--color-success-text)' }}>{u.status}</td>
                  <td style={{ padding: '12px' }}>
                    {u.isLastAdmin ? (
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                        Protected (Last Admin)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => alert(`Deactivating ${u.name}...`)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-error-text)',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="surface-card" style={{ maxWidth: '640px' }}>
          <h2 className="text-heading-card" style={{ marginBottom: '8px' }}>Versioned Learning Settings</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
            Changes create a new immutable version for future sessions without altering completed histories.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>
                Raw Accuracy Gate (% required to increase difficulty)
              </label>
              <input type="number" defaultValue={95} min={80} max={99} className="form-input" style={{ width: '120px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>
                Difficulty Reduction Threshold (drops difficulty if below)
              </label>
              <input type="number" defaultValue={90} min={70} max={94} className="form-input" style={{ width: '120px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>
                Maximum Initial Latency Cutoff (ms)
              </label>
              <input type="number" defaultValue={2000} className="form-input" style={{ width: '160px' }} />
            </div>

            <button
              type="button"
              onClick={() => alert('New immutable version activated: v1.3.0')}
              className="btn-primary"
              style={{ alignSelf: 'flex-start', marginTop: '12px' }}
            >
              Activate New Version
            </button>
          </div>
        </div>
      )}

      {activeTab === 'moderation' && (
        <div className="surface-card">
          <h2 className="text-heading-card" style={{ marginBottom: '16px' }}>Reported Content Queue</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Zero reported threads or replies pending review. All learner content is currently compliant.
          </p>
        </div>
      )}
    </div>
  );
}
