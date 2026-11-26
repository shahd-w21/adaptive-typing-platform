import { useState } from 'react';
import { PlayIcon, CheckIcon, LockIcon } from '../../components/ui/Icons.jsx';
import { useTranslation } from '../../i18n/useTranslation.js';
import { KeyboardGuide } from '../typing/components/KeyboardGuide.jsx';
import { useLearningPath } from './useLearningPath.js';

export function LearningPath({ onStartExercise }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('path'); // 'path' | 'map'
  const [selectedKey, setSelectedKey] = useState('f');

  const pathQuery = useLearningPath();
  const data = pathQuery.data;
  if (pathQuery.isPending) return (
    <p
      className="mx-auto max-w-3xl rounded-card border border-border-subtle bg-surface p-6 text-muted shadow-card"
      role="status"
    >
      {t('learningPath.loading')}
    </p>
  );
  if (pathQuery.isError) return (
    <section className="mx-auto max-w-3xl rounded-card border border-error-text/30 bg-error-soft p-6 text-error-text" role="alert">
      <h1 className="mb-2 font-display text-2xl font-bold">{t('learningPath.errorTitle')}</h1>
      <p className="mb-4">{t('learningPath.errorDescription')}</p>
      <button
        type="button"
        onClick={() => pathQuery.refetch()}
        className="rounded-full border border-error-text/40 px-5 py-2 font-bold"
      >
        {t('learningPath.retry')}
      </button>
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
      const status = stat?.status === 'mastered' ? 'mastered'
        : stat?.status === 'locked' ? 'locked'
          : !stat ? 'unknown'
            : recommended ? 'recommended'
              : stat.status === 'in_progress' ? 'inProgress' : 'available';
      return {
        id: group.id + '-' + key,
        title: t('learningPath.keyTitle', { key: key.toUpperCase() }),
        status,
        keys: key,
        prerequisite: group.prerequisiteId
          ? t('learningPath.prerequisite', {
            group: groupNames.get(group.prerequisiteId) ?? t('learningPath.previousGroup'),
          })
          : undefined,
      };
    }),
  }));
  const currentKeyStats = (() => {
    const stat = stats.find(item => item.key.toLowerCase() === selectedKey.toLowerCase());
    return {
      key: selectedKey.toUpperCase(),
      status: t(`learningPath.state_${stat?.status ?? 'unknown'}`),
      accuracy: Number.isFinite(stat?.accuracy)
        ? stat.accuracy.toFixed(1) + '%'
        : t('dashboard.unavailable'),
      samples: Number.isFinite(stat?.attempts)
        ? stat.attempts
        : t('dashboard.unavailable'),
      latency: Number.isFinite(stat?.avgMs)
        ? Math.round(stat.avgMs) + ' ms'
        : t('dashboard.unavailable'),
    };
  })();
  return (
    <div className="max-w-240 my-0 mx-auto">
      {/* View Switcher Tabs */}
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="font-display rtl:font-arabic text-[32px] leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px] mb-1">
            {t('learningPath.title')}
          </h1>
          <p className="text-[16px] leading-[26px] font-normal text-muted">
            {t('learningPath.description')}
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
            {t('learningPath.guidedPath')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={[
                "py-2 px-4.5 rounded-full border-0 cursor-pointer font-bold text-[14px]",
              activeTab === 'map' ? 'bg-surface text-ink shadow-card' : 'bg-transparent text-muted shadow-none',
            ].filter(Boolean).join(' ')}
          >
            {t('learningPath.keyboardMap')}
          </button>
        </div>
      </div>

      {activeTab === 'path' ? (
        /* Duolingo-style Vertical Learning Path */
        <div className="flex flex-col gap-8">
          {groups.length === 0 && (
            <p className="rounded-card border border-border-subtle bg-surface p-6 text-muted shadow-card">
              {t('dashboard.noGroups')}
            </p>
          )}
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
              <div className="relative flex flex-col items-center gap-5 before:absolute before:inset-y-8 before:start-[27px] before:border-s-2 before:border-dashed before:border-border-control">
                {group.nodes.map((node, nIdx) => {
                  const isRec = node.status === 'recommended';
                  const isMastered = node.status === "mastered";
                  const isLocked = node.status === 'locked';
                  const isUnknown = node.status === 'unknown';

                  return (
                    <div
                      key={node.id}
                      className="flex w-full max-w-105 items-center gap-5"
                    >
                      {/* Node Circle */}
                      <button
                        type="button"
                        aria-label={`${node.title}: ${t(`learningPath.state_${node.status}`)}`}
                        disabled={isLocked || isMastered || isUnknown}
                        onClick={() => onStartExercise(node)}
                        className={[
                          "relative z-10 flex h-[72px] w-[82px] shrink-0 items-center justify-center rounded-[7px] border-2 border-b-4",
                          isRec ? 'border-learning-lip bg-learning-accent' : isMastered ? "border-success-accent bg-success-soft" : isLocked || isUnknown ? "border-border-control bg-disabled-bg" : "border-border-control bg-surface",
                          isRec ? "text-learning-foreground shadow-node" : isMastered ? "text-success-text" : isLocked || isUnknown ? "text-disabled-text" : "text-ink",
                          isLocked || isUnknown ? 'cursor-not-allowed' : 'cursor-pointer',
                        ].filter(Boolean).join(' ')}
                      >
                        {isMastered && <CheckIcon size={24} />}
                        {isRec && <PlayIcon size={26} />}
                        {isLocked && <LockIcon size={20} />}
                        {isUnknown && <span className="font-bold" aria-hidden="true">?</span>}
                        {!isMastered && !isRec && !isLocked && !isUnknown && <span className="font-bold">{nIdx + 1}</span>}
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
                            {t('learningPath.state_recommended')}
                          </span>
                        )}
                        {isLocked && (
                          <span className="text-[12px] text-muted">
                            {node.prerequisite ?? t('learningPath.state_locked')}
                          </span>
                        )}
                        {isMastered && (
                          <span className="text-[12px] text-success-text">
                            {t('learningPath.masteredPassed')}
                          </span>
                        )}
                        {!isRec && !isLocked && !isMastered && (
                          <span className="text-[12px] text-muted">
                            {t(`learningPath.state_${node.status}`)}
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
              {t('learningPath.mapTitle')}
            </h2>
            <p className="text-[14px] text-muted mb-4">
              {t('learningPath.mapDescription')}
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
                  {t('learningPath.selectKey', { key: k.toUpperCase() })}
                </button>
              ); })}
            </div>
          </div>

          {/* Selected Key Evidence Inspector Card */}
          <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] grid grid-cols-[repeat(auto-fit,_minmax(180px,_1fr))] gap-4">
            <div>
              <div className="text-[14px] leading-[22px] font-normal text-muted">{t('learningPath.selectedKey')}</div>
              <div className="font-display rtl:font-arabic text-[32px] leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px] [direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! text-learning-strong">
                {currentKeyStats.key}
              </div>
              <div className="text-[13px] font-bold text-muted mt-1">
                {currentKeyStats.status}
              </div>
            </div>

            <div>
              <div className="text-[14px] leading-[22px] font-normal text-muted">{t('dashboard.rawAccuracy')}</div>
              <div className="font-display rtl:font-arabic text-[24px] leading-[34px] font-bold [direction:ltr]! text-left! [unicode-bidi:isolate] font-mono!">{currentKeyStats.accuracy}</div>
              <div className="text-[12px] text-muted mt-1">{t('learningPath.acrossAttempts')}</div>
            </div>

            <div>
              <div className="text-[14px] leading-[22px] font-normal text-muted">{t('learningPath.samplesRecorded')}</div>
              <div className="font-display rtl:font-arabic text-[24px] leading-[34px] font-bold [direction:ltr]! text-left! [unicode-bidi:isolate] font-mono!">{currentKeyStats.samples}</div>
              <div className="text-[12px] text-muted mt-1">{t('learningPath.serverEvidence')}</div>
            </div>

            <div>
              <div className="text-[14px] leading-[22px] font-normal text-muted">{t('learningPath.averageLatency')}</div>
              <div className="font-display rtl:font-arabic text-[24px] leading-[34px] font-bold [direction:ltr]! text-left! [unicode-bidi:isolate] font-mono!">{currentKeyStats.latency}</div>
              <div className="text-[12px] text-muted mt-1">{t('learningPath.serverTiming')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
