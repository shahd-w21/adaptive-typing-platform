import { useState } from 'react';
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
    <div className="max-w-256 my-0 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display rtl:font-arabic text-[32px] leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px] mb-1">
            Progress & Session Analytics
          </h1>
          <p className="text-[16px] leading-[26px] font-normal text-muted">
            Track speed development and raw accuracy stability over time.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex gap-2">
          {['all', 'adaptive', 'review', 'test'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterMode(f)}
              className={[
                "py-1.5 px-3.5 rounded-full border border-border-subtle font-bold text-[13px] cursor-pointer",
                filterMode === f ? 'bg-action-primary text-action-foreground' : 'bg-surface text-ink',
              ].filter(Boolean).join(' ')}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Speed & Accuracy Trend Overview Cards */}
      <div className="grid grid-cols-[1fr_1fr] gap-5 mb-7">
        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
          <div className="text-[14px] leading-[22px] font-normal text-muted">Average Net Speed</div>
          <div className="font-display rtl:font-arabic text-[48px] leading-[60px] font-extrabold max-md:text-[34px] max-md:leading-[44px] [direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! text-learning-strong my-2 mx-0">
            47.4 <span className="text-[20px] text-muted">WPM</span>
          </div>
          <div className="text-[13px] text-success-text font-bold">
            ↑ +5.4 WPM in the last 7 days
          </div>
        </div>

        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
          <div className="text-[14px] leading-[22px] font-normal text-muted">Average Raw Accuracy</div>
          <div className="font-display rtl:font-arabic text-[48px] leading-[60px] font-extrabold max-md:text-[34px] max-md:leading-[44px] [direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! text-success-text my-2 mx-0">
            95.7%
          </div>
          <div className="text-[13px] text-muted">
            Consistently above the 95% gate
          </div>
        </div>
      </div>

      {/* Historical Sessions Table */}
      <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
        <h2 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold mb-4">
          Session Records
        </h2>

        <table className={[
                 "w-full border-collapse",
                 isRTL ? 'text-right' : 'text-left',
               ].filter(Boolean).join(' ')}>
          <thead>
            <tr className="border-b-2 border-b-border-subtle text-muted text-[13px]">
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Mode</th>
              <th className="py-2.5 px-3">Net WPM</th>
              <th className="py-2.5 px-3">Gross WPM</th>
              <th className="py-2.5 px-3">Raw Accuracy</th>
              <th className="py-2.5 px-3">Final Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((s) => (
              <tr key={s.id} className="border-b border-b-border-subtle text-[14px]">
                <td className="p-3">{s.date}</td>
                <td className="p-3">{s.mode}</td>
                <td className="[direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! p-3 font-bold">{s.netWpm}</td>
                <td className="[direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! p-3">{s.grossWpm}</td>
                <td className="[direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! p-3">{s.rawAccuracy}%</td>
                <td className="[direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! p-3">{s.finalAccuracy}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
