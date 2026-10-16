
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
    <div className="max-w-240 my-0 mx-auto">
      <h1 className="font-display rtl:font-arabic text-[32px] leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px] mb-2">
        Achievements & Milestones
      </h1>
      <p className="text-[16px] leading-[26px] font-normal text-muted mb-8">
        Reward your consistency, accuracy gates passed, and speed milestones.
      </p>

      {/* Level & XP Progress Card */}
      <div className="bg-surface border border-border-subtle rounded-card shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] mb-8 p-7">
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-[13px] font-bold text-reward-text">CURRENT RANK</span>
            <div className="font-display rtl:font-arabic leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px] text-[28px]">Level 3 Typist</div>
          </div>
          <div className="text-[32px] leading-[40px] font-bold [font-variant-numeric:tabular-nums] text-learning-strong">
            1,420 / 2,000 XP
          </div>
        </div>

        <div className="h-3 bg-subtle rounded-md overflow-hidden">
          <div className="w-[71%] h-full bg-reward-accent rounded-md" />
        </div>
        <div className="flex justify-between mt-2 text-[12px] text-muted">
          <span>Level 3</span>
          <span>580 XP until Level 4</span>
        </div>
      </div>

      {/* Badges Grid */}
      <h2 className="font-display rtl:font-arabic leading-[34px] font-bold text-[20px] mb-4">
        Earned & Available Badges
      </h2>

      <div className="grid grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))] gap-5">
        {badges.map((b) => (
          <div
            key={b.id}
            className={[
              "bg-surface rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] flex gap-4 items-center",
              b.earned ? 'opacity-100 border-2 border-success-accent' : 'opacity-65 border border-border-subtle',
            ].filter(Boolean).join(' ')}
          >
            <div
              className={[
                "w-14 h-14 rounded-2xl flex items-center justify-center text-[28px] shrink-0",
                b.earned ? 'bg-success-soft' : 'bg-subtle',
              ].filter(Boolean).join(' ')}
            >
              {b.icon}
            </div>

            <div>
              <div className="font-extrabold text-[16px] mb-0.5">{b.title}</div>
              <p className="text-[13px] text-muted mb-1.5 leading-[18px]">
                {b.desc}
              </p>
              {b.earned ? (
                <span className="text-[12px] text-success-text font-bold">
                  ✓ Earned on {b.date}
                </span>
              ) : (
                <span className="text-[12px] text-muted italic">
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
