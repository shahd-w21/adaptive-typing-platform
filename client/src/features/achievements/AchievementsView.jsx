
export function AchievementsView() {
  const badges = [
    { id: 'b1', title: 'First Touch', desc: 'Completed your first typing session', earned: true, date: 'Oct 11, 2026', icon: '🌱' },
    { id: 'b2', title: 'Home Row Master', desc: 'Passed Home Row gate with >95% accuracy', earned: true, date: 'Oct 13, 2026', icon: '👑' },
    { id: 'b3', title: 'Five-Day Streak', desc: 'Practised 5 consecutive days', earned: true, date: 'Today', icon: '🔥' },
    { id: 'b4', title: 'Speed Demon', desc: 'Reach 60 Net WPM on a timed test', earned: false, criteria: 'Achieve 60+ Net WPM', icon: '⚡' },
    { id: 'b5', title: 'Flawless Run', desc: 'Complete a 100+ character passage with 100% raw accuracy', earned: false, criteria: 'Zero mistyped characters', icon: '🎯' },
    { id: 'b6', title: 'Century Club', desc: 'Complete 100 total learning sessions', earned: false, criteria: '14 / 100 completed', icon: '💯' },
  ];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <h1 className="text-heading-page" style={{ marginBottom: '8px' }}>
        Achievements & Milestones
      </h1>
      <p className="text-body-default" style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
        Reward your consistency, accuracy gates passed, and speed milestones.
      </p>

      {/* Level & XP Progress Card */}
      <div className="surface-card" style={{ marginBottom: '32px', padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-reward-text)' }}>CURRENT RANK</span>
            <div className="text-heading-page" style={{ fontSize: '28px' }}>Level 3 Typist</div>
          </div>
          <div className="text-metric-large" style={{ color: 'var(--color-learning-strong)' }}>
            1,420 / 2,000 XP
          </div>
        </div>

        <div style={{ height: '12px', backgroundColor: 'var(--color-bg-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ width: '71%', height: '100%', backgroundColor: 'var(--color-reward-accent)', borderRadius: '6px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          <span>Level 3</span>
          <span>580 XP until Level 4</span>
        </div>
      </div>

      {/* Badges Grid */}
      <h2 className="text-heading-section" style={{ fontSize: '20px', marginBottom: '16px' }}>
        Earned & Available Badges
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {badges.map((b) => (
          <div
            key={b.id}
            className="surface-card"
            style={{
              opacity: b.earned ? 1 : 0.65,
              border: b.earned ? '2px solid var(--color-success-accent)' : '1px solid var(--color-border-subtle)',
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: b.earned ? 'var(--color-success-soft)' : 'var(--color-bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                flexShrink: 0,
              }}
            >
              {b.icon}
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '2px' }}>{b.title}</div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '6px', lineHeight: '18px' }}>
                {b.desc}
              </p>
              {b.earned ? (
                <span style={{ fontSize: '12px', color: 'var(--color-success-text)', fontWeight: 700 }}>
                  ✓ Earned on {b.date}
                </span>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                  Criteria: {b.criteria}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
