import { useState } from 'react';
import { PlayIcon, CheckIcon, LockIcon } from '../../components/ui/Icons.jsx';
import { KeyboardGuide } from '../typing/components/KeyboardGuide.jsx';
import { useLearningPath } from './useLearningPath.js';

export function LearningPath({ onStartExercise }) {
  const [activeTab, setActiveTab] = useState('path'); // 'path' | 'map'
  const [selectedKey, setSelectedKey] = useState('f');

  const pathQuery = useLearningPath();
  const data = pathQuery.data;
  if (pathQuery.isPending) return <p className="mx-auto max-w-3xl rounded-card border border-border-subtle bg-surface p-6 text-muted shadow-card" role="status">Loading your learning path...</p>;
  if (pathQuery.isError) return (
    <section className="mx-auto max-w-3xl rounded-card border border-error-text/30 bg-error-soft p-6 text-error-text" role="alert">
      <h1 className="mb-2 font-display text-2xl font-bold">Learning path could not load</h1>
      <p className="mb-4">Your saved progress remains on the server. Check your connection and retry.</p>
      <button type="button" onClick={() => pathQuery.refetch()} className="rounded-full border border-error-text/40 px-5 py-2 font-bold">Retry</button>
    </section>
  );
  const stats = data?.keys ?? [];
  const weakestKey = data?.recommendation?.weakestKey?.toLowerCase();
  const activeKey = stats.find(stat => stat.key.toLowerCase() === weakestKey)?.key
    ?? stats.find(stat => stat.status === 'in_progress')?.key;
  const groupNames = new Map((data?.groups ?? []).map(group => [group.id, group.name]));
  const groups = (data?.groups ?? []).map(group => ({
    id: String(group.id),
    title: group.name,
    description: [...(group.keys ?? '')].join(' / '),
    nodes: [...(group.keys ?? '')].map(key => {
      const stat = stats.find(item => item.key === key);
      const recommended = key.toLowerCase() === activeKey?.toLowerCase();
      return {
        id: group.id + '-' + key,
        title: 'Key ' + key.toUpperCase(),
        status: stat?.status === 'mastered' ? 'mastered'
          : stat?.status === 'locked' || !stat ? 'locked'
            : recommended ? 'recommended' : 'available',
        keys: key,
        prerequisite: group.prerequisiteId ? 'Complete ' + (groupNames.get(group.prerequisiteId) ?? 'the previous group') : undefined,
      };
    }),
  }));
  const currentKeyStats = (() => {
    const stat = stats.find(item => item.key.toLowerCase() === selectedKey.toLowerCase());
    return {
      key: selectedKey.toUpperCase(),
      status: stat?.status === 'mastered' ? 'Mastered' : stat?.status === 'in_progress' ? 'In progress' : stat?.status === 'locked' ? 'Locked' : 'No evidence yet',
      accuracy: Number.isFinite(stat?.accuracy) ? stat.accuracy.toFixed(1) + '%' : 'Not available',
      samples: stat?.attempts ?? 0,
      latency: Number.isFinite(stat?.avgMs) ? Math.round(stat.avgMs) + ' ms' : 'Not available',
    };
  })();
  return (
    <div className="max-w-240 my-0 mx-auto">
      {/* View Switcher Tabs */}
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="font-display rtl:font-arabic text-[32px] leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px] mb-1">
            Curriculum & Mastery Map
          </h1>
          <p className="text-[16px] leading-[26px] font-normal text-muted">
            Sequential touch-typing progression driven by your measured evidence.
          </p>
        </div>

        <div
          className="flex bg-subtle p-1 rounded-full border border-border-subtle"
        >
          <button
            type="button"
            onClick={() => setActiveTab('path')}
            className={[
              "py-2 px-4.5 rounded-full border-0 cursor-pointer font-bold text-[14px]",
              activeTab === 'path' ? 'bg-surface text-ink shadow-card' : 'bg-transparent text-muted shadow-none',
            ].filter(Boolean).join(' ')}
          >
            Guided Path
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={[
              "py-2 px-4.5 rounded-full border-0 cursor-pointer font-bold text-[14px]",
              activeTab === 'map' ? 'bg-surface text-ink shadow-card' : 'bg-transparent text-muted shadow-none',
            ].filter(Boolean).join(' ')}
          >
            Keyboard Map
          </button>
        </div>
      </div>

      {activeTab === 'path' ? (
        /* Duolingo-style Vertical Learning Path */
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <div key={group.id} className="bg-surface border border-border-subtle rounded-card shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] p-7">
              <div className="mb-6">
                <h2 className="font-display rtl:font-arabic leading-[34px] font-bold text-[20px] mb-1">
                  {group.title}
                </h2>
                <p className="text-muted text-[14px]">
                  {group.description}
                </p>
              </div>

              {/* Node Sequence */}
              <div className="flex flex-col items-center gap-5">
                {group.nodes.map((node, nIdx) => {
                  const isRec = node.status === 'recommended';
                  const isMastered = node.status === "mastered";
                  const isLocked = node.status === 'locked';

                  return (
                    <div
                      key={node.id}
                      className="flex items-center gap-5 w-full max-w-105"
                    >
                      {/* Node Circle */}
                      <button
                        type="button"
                        disabled={isLocked || isMastered}
                        onClick={() => onStartExercise(node)}
                        className={[
                          "rounded-full flex items-center justify-center shrink-0",
                          isRec ? 'w-17 h-17 border-0' : 'w-14 h-14 border-2 border-border-control',
                          isRec ? "bg-learning-accent" : isMastered ? "bg-success-soft" : isLocked ? "bg-disabled-bg" : "bg-surface",
                          isRec ? "text-learning-foreground" : isMastered ? "text-success-text" : isLocked ? "text-disabled-text" : "text-ink",
                          isRec ? "shadow-node" : isLocked ? "shadow-none" : "shadow-[0_2px_0_var(--tf-color-border-control)]",
                          isLocked ? 'cursor-not-allowed' : 'cursor-pointer',
                        ].filter(Boolean).join(' ')}
                      >
                        {isMastered && <CheckIcon size={24} />}
                        {isRec && <PlayIcon size={26} />}
                        {isLocked && <LockIcon size={20} />}
                        {!isMastered && !isRec && !isLocked && <span className="font-bold">{nIdx + 1}</span>}
                      </button>

                      {/* Node Label / Info */}
                      <div className="flex-1">
                        <div className={[
                               "font-bold text-[15px]",
                               isRec ? 'text-learning-strong' : 'text-ink',
                             ].filter(Boolean).join(' ')}>
                          {node.title}
                        </div>
                        {isRec && (
                          <span className="text-[12px] text-learning-accent font-bold">
                            Recommended Next
                          </span>
                        )}
                        {isLocked && (
                          <span className="text-[12px] text-muted">
                            {node.prerequisite}
                          </span>
                        )}
                        {isMastered && (
                          <span className="text-[12px] text-success-text">
                            Mastered (Gate Passed)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Keyboard Map & Key Analytics Tab */
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
            <h2 className="font-display rtl:font-arabic leading-[34px] font-bold text-[18px] mb-2">
              QWERTY Performance Overview
            </h2>
            <p className="text-[14px] text-muted mb-4">
              Select any key on the physical keyboard guide to inspect recorded evidence and latency.
            </p>

            <KeyboardGuide nextChar={selectedKey} masteredKeys={new Set(stats.filter(stat => stat.status === 'mastered').map(stat => stat.key.toLowerCase()))} />

            {/* Quick Key Selection Palette */}
            <div className="flex justify-center gap-2 mt-5">
              {stats.slice(0, 8).map((stat) => { const k = stat.key.toLowerCase(); return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSelectedKey(k)}
                  className={[
                    "[direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! py-1.5 px-3.5 rounded-full border border-border-subtle font-bold cursor-pointer",
                    selectedKey === k ? 'bg-learning-soft text-learning-strong' : 'bg-surface text-ink',
                  ].filter(Boolean).join(' ')}
                >
                  Key: {k.toUpperCase()}
                </button>
              ); })}
            </div>
          </div>

          {/* Selected Key Evidence Inspector Card */}
          <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] grid grid-cols-[repeat(auto-fit,_minmax(180px,_1fr))] gap-4">
            <div>
              <div className="text-[14px] leading-[22px] font-normal text-muted">Selected Key</div>
              <div className="font-display rtl:font-arabic text-[32px] leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px] [direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! text-learning-strong">
                {currentKeyStats.key}
              </div>
              <div className="text-[13px] font-bold text-muted mt-1">
                {currentKeyStats.status}
              </div>
            </div>

            <div>
              <div className="text-[14px] leading-[22px] font-normal text-muted">Raw Accuracy</div>
              <div className="font-display rtl:font-arabic text-[24px] leading-[34px] font-bold [direction:ltr]! text-left! [unicode-bidi:isolate] font-mono!">{currentKeyStats.accuracy}</div>
              <div className="text-[12px] text-muted mt-1">Across all attempts</div>
            </div>

            <div>
              <div className="text-[14px] leading-[22px] font-normal text-muted">Samples Recorded</div>
              <div className="font-display rtl:font-arabic text-[24px] leading-[34px] font-bold [direction:ltr]! text-left! [unicode-bidi:isolate] font-mono!">{currentKeyStats.samples}</div>
              <div className="text-[12px] text-muted mt-1">Evidence stored by the server</div>
            </div>

            <div>
              <div className="text-[14px] leading-[22px] font-normal text-muted">Average Latency</div>
              <div className="font-display rtl:font-arabic text-[24px] leading-[34px] font-bold [direction:ltr]! text-left! [unicode-bidi:isolate] font-mono!">{currentKeyStats.latency}</div>
              <div className="text-[12px] text-muted mt-1">Server-recorded timing data</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
