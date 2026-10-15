import { useTranslation } from '../../i18n/useTranslation.js';
import { PlayIcon, FlameIcon, ArrowRightIcon, CheckIcon } from '../../components/ui/Icons.jsx';

export function Dashboard({ onStartPractice, onNavigate }) {
  const { isRTL } = useTranslation();

  const recentSessions = [
    { id: 's1', mode: 'Adaptive Practice', netWpm: 48, rawAccuracy: 96, date: 'Today, 2:30 PM' },
    { id: 's2', mode: 'Spaced Review', netWpm: 52, rawAccuracy: 98, date: 'Yesterday' },
    { id: 's3', mode: 'Timed Test (3m)', netWpm: 46, rawAccuracy: 94, date: '2 days ago' },
  ];

  return (
    <div className="max-xl:grid-cols-1 grid grid-cols-[minmax(0,_1fr)_280px] gap-6">
      {/* Main Primary Content Column */}
      <div className="flex flex-col gap-6">
        {/* Welcome Banner */}
        <div>
          <h1 className="font-display rtl:font-arabic text-[32px] leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px] mb-1.5">
            Welcome back, Layla!
          </h1>
          <p className="text-[16px] leading-[26px] font-normal text-muted">
            Let's keep building your touch typing accuracy and speed.
          </p>
        </div>

        {/* Large Hero Recommendation Card */}
        <div
          className="rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] border-2 border-learning-accent bg-surface relative overflow-hidden"
        >
          <div
            className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-learning-soft text-learning-strong text-[12px] font-bold mb-3.5"
          >
            <span>🎯 RECOMMENDED NEXT ACTIVITY</span>
          </div>

          <h2 className="font-display rtl:font-arabic text-[24px] leading-[34px] font-bold mb-2">
            Home Row Mastery & Upper Reach
          </h2>

          <p className="text-[16px] leading-[26px] font-normal text-muted mb-5 max-w-160">
            <strong>Why this practice?</strong> You have less evidence for these keys. Practise them to strengthen finger agility before advancing to the next group.
          </p>

          {/* Focus Keys Chips */}
          <div className="flex items-center gap-2.5 mb-6">
            <span className="text-[14px] font-bold text-muted">Focus keys:</span>
            {['p', ';', '/', 'e'].map((k) => (
              <span
                key={k}
                className="[direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! inline-flex items-center justify-center w-8 h-8 rounded-md border-2 border-border-control bg-subtle font-bold text-[14px]"
              >
                {k}
              </span>
            ))}
          </div>

          {/* Start CTA with 4px node lip */}
          <button
            type="button"
            onClick={onStartPractice}
            className="inline-flex items-center justify-center gap-2 font-body rtl:font-arabic font-bold border-0 rounded-full cursor-pointer no-underline [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none h-13 py-0 px-8 text-[17px] shadow-node bg-learning-accent text-learning-foreground"
          >
            <PlayIcon size={20} />
            <span>Start Practice (2 mins)</span>
          </button>
        </div>

        {/* Compact Path Preview */}
        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold">Your Learning Path</h3>
            <button
              type="button"
              onClick={() => onNavigate('path')}
              className="bg-transparent border-0 cursor-pointer text-action-link font-bold text-[14px] flex items-center gap-1"
            >
              <span>View Full Map</span>
              <ArrowRightIcon size={16} className={[
                                          isRTL ? 'rotate-180' : 'transform-none',
                                        ].filter(Boolean).join(' ')} />
            </button>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto py-3 px-0">
            {/* Step 1: Mastered */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-14 h-14 rounded-full bg-success-soft border-2 border-success-accent text-success-text flex items-center justify-center"
              >
                <CheckIcon size={24} />
              </div>
              <span className="text-[12px] font-bold">Home Row</span>
            </div>

            <div className="w-10 h-0.5 bg-success-accent" />

            {/* Step 2: Current Node */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 rounded-full bg-learning-accent text-learning-foreground flex items-center justify-center shadow-node cursor-pointer"
                onClick={onStartPractice}
              >
                <PlayIcon size={24} />
              </div>
              <span className="text-[13px] font-extrabold text-learning-strong">Top Row</span>
            </div>

            <div className="w-10 h-0.5 bg-border-subtle" />

            {/* Step 3: Locked */}
            <div className="flex flex-col items-center gap-2 opacity-60">
              <div
                className="w-14 h-14 rounded-full bg-disabled-bg border border-border-subtle text-disabled-text flex items-center justify-center"
              >
                🔒
              </div>
              <span className="text-[12px]">Bottom Row</span>
            </div>
          </div>
        </div>

        {/* Recent Sessions Table */}
        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
          <h3 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold mb-4">
            Recent Sessions
          </h3>

          <table className={[
                   "w-full border-collapse",
                   isRTL ? 'text-right' : 'text-left',
                 ].filter(Boolean).join(' ')}>
            <thead>
              <tr className="border-b border-b-border-subtle text-muted text-[13px]">
                <th className="py-2 px-3">Activity</th>
                <th className="py-2 px-3">Net Speed</th>
                <th className="py-2 px-3">Raw Accuracy</th>
                <th className="py-2 px-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((session) => (
                <tr key={session.id} className="border-b border-b-border-subtle text-[14px]">
                  <td className="p-3">{session.mode}</td>
                  <td className="[direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! p-3 font-bold">{session.netWpm} WPM</td>
                  <td className="[direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! p-3">{session.rawAccuracy}%</td>
                  <td className="p-3 text-muted">{session.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Desktop Right Rail (280px wide) */}
      <div className="flex flex-col gap-5">
        {/* Daily Goal Card */}
        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-[15px]">Daily Goal</span>
            <span className="text-[13px] text-muted">15 / 20 mins</span>
          </div>
          <div className="h-2 bg-border-subtle rounded overflow-hidden">
            <div className="w-[75%] h-full bg-success-accent rounded" />
          </div>
          <p className="text-[12px] text-muted mt-2">
            5 more minutes to reach today's target!
          </p>
        </div>

        {/* Due Review Card */}
        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-[15px]">Spaced Review</span>
            <span className="py-0.5 px-2 rounded-full bg-learning-soft text-learning-strong text-[11px] font-bold">
              3 Keys Due
            </span>
          </div>
          <p className="text-[13px] text-muted mb-3.5">
            Keys <strong>E, R, T</strong> are scheduled for memory consolidation.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('review')}
            className="inline-flex items-center justify-center gap-2 py-0 px-6 font-body rtl:font-arabic font-bold text-ink bg-surface border-2 border-border-control rounded-full cursor-pointer no-underline [transition:background-color_var(--motion-fast),_border-color_var(--motion-fast)] enabled:hover:bg-subtle enabled:hover:border-ink disabled:border-border-subtle disabled:text-disabled-text disabled:cursor-not-allowed w-full h-10 text-[14px]"
          >
            Start Review
          </button>
        </div>

        {/* Current Streak Card */}
        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-xl bg-warning-soft text-streak-text flex items-center justify-center"
          >
            <FlameIcon size={24} />
          </div>
          <div>
            <div className="font-extrabold text-[18px]">5 Day Streak!</div>
            <div className="text-[12px] text-muted">Practised today</div>
          </div>
        </div>
      </div>
    </div>
  );
}
