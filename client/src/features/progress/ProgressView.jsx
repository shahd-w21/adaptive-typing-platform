// Progress & Session Analytics view: real server-scored history, separated
// learning vs. assessment trends, QWERTY key-evidence heat map, and draft filters.
import { useMemo, useState } from 'react';
import { isAssessmentMode, isLearningMode } from '@typeflow/shared';
import { Loading } from '../../components/Loading.jsx';
import { ErrorMessage } from '../../components/ErrorMessage.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { CheckIcon, LockIcon } from '../../components/ui/Icons.jsx';
import { useTranslation } from '../../i18n/useTranslation.js';
import { formatMetricNumber } from '../../lib/formatMetricNumber.js';
import {
  filterProgressSessions,
  paginateProgressSessions,
  summarizeModeGroup,
  useProgress,
} from './hooks/useProgress.js';

const EMPTY_SESSIONS = [];
const EMPTY_KEYS = [];

const QWERTY_HEATMAP_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

const DEFAULT_FILTERS = {
  mode: 'all',
  difficulty: 'all',
  timeRange: 'all',
  page: 1,
  pageSize: 10,
};

function dateLabel(value, locale) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
}

function durationLabel(durationMs) {
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    return '—';
  }
  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function formatMetric(value, suffix = '') {
  const formatted = formatMetricNumber(value);
  return formatted == null ? null : `${formatted}${suffix}`;
}

/** Chronological SVG polyline trend for a single mode group (never mixed). */
function TrendChart({ sessions, field, colorClass, label, unit }) {
  const ordered = useMemo(
    () =>
      [...sessions]
        .reverse()
        .filter((session) => Number.isFinite(session[field])),
    [sessions, field],
  );

  if (ordered.length === 0) {
    return null;
  }

  const values = ordered.map((session) => session[field]);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const span = maxVal - minVal || 1;
  const width = 280;
  const height = 64;
  const pad = 6;

  const points = ordered
    .map((session, idx) => {
      const x =
        ordered.length === 1
          ? width / 2
          : pad + (idx / (ordered.length - 1)) * (width - pad * 2);
      const y =
        height -
        pad -
        ((session[field] - minVal) / span) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="mt-3" dir="ltr">
      <div className="mb-1 flex items-center justify-between text-xs text-muted">
        <span>{label}</span>
        <span>
          {formatMetric(minVal, unit)} – {formatMetric(maxVal, unit)}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={`h-16 w-full rounded-lg border border-border-subtle bg-subtle/40 ${colorClass}`}
        role="img"
        aria-label={`${label}: ${ordered.length} points`}
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
}

/** Resolve non-color and semantic token styling for one keycap in the heat map. */
function keyVisualState(stat) {
  if (!stat || stat.status === 'locked') {
    return {
      kind: 'locked',
      classes:
        'border-border-subtle bg-disabled-bg text-disabled-text',
    };
  }
  if (stat.status === 'mastered') {
    return {
      kind: 'mastered',
      classes:
        'border-success-accent bg-success-soft text-success-text',
    };
  }
  if (stat.attempts === 0 || stat.accuracy == null) {
    return {
      kind: 'unknown',
      classes:
        'border-border-control bg-surface text-muted',
    };
  }
  return {
    kind: 'in_progress',
    classes:
      'border-learning-accent bg-learning-soft text-learning-strong',
  };
}

export function ProgressView() {
  const { isRTL, locale, t } = useTranslation();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedKey, setSelectedKey] = useState(null);
  const [showTrendTable, setShowTrendTable] = useState(false);
  const [showKeyTable, setShowKeyTable] = useState(false);

  const { data, isPending, isError, error, isFetching, refetch } =
    useProgress();

  const sessions = data?.sessions ?? EMPTY_SESSIONS;
  const keys = data?.keys ?? EMPTY_KEYS;

  const keyMap = useMemo(() => {
    const map = new Map();
    for (const item of keys) {
      map.set(item.key, item);
    }
    return map;
  }, [keys]);

  const activeKeyChar =
    selectedKey && keyMap.has(selectedKey)
      ? selectedKey
      : (keys[0]?.key ?? 'f');
  const activeKeyStat = keyMap.get(activeKeyChar) ?? null;

  // Separate learning vs. assessment sessions so trends never mix incompatible modes.
  const learningSessions = useMemo(
    () => sessions.filter((session) => isLearningMode(session.mode)),
    [sessions],
  );
  const assessmentSessions = useMemo(
    () => sessions.filter((session) => isAssessmentMode(session.mode)),
    [sessions],
  );

  const learningSummary = useMemo(
    () => summarizeModeGroup(learningSessions),
    [learningSessions],
  );
  const assessmentSummary = useMemo(
    () => summarizeModeGroup(assessmentSessions),
    [assessmentSessions],
  );

  const filteredHistory = useMemo(
    () => filterProgressSessions(sessions, filters),
    [sessions, filters],
  );
  const pagedHistory = useMemo(
    () =>
      paginateProgressSessions(
        filteredHistory,
        filters.page,
        filters.pageSize,
      ),
    [filteredHistory, filters.page, filters.pageSize],
  );

  const hasActiveFilters =
    filters.mode !== 'all' ||
    filters.difficulty !== 'all' ||
    filters.timeRange !== 'all';

  const updateFilter = (patch) => {
    setFilters((prev) => ({
      ...prev,
      ...patch,
      page: patch.page ?? 1,
    }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  if (isPending) {
    return <Loading labelKey="progress.loading" />;
  }

  if (isError && !data) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 font-display text-3xl font-bold">
          {t('progress.title')}
        </h1>
        <ErrorMessage
          error={error}
          title={t('progress.errorTitle')}
          message={t('progress.errorDescription')}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      </div>
    );
  }

  const modeLabel = (mode) => {
    const map = {
      practice: t('progress.practice'),
      lesson: t('progress.lesson'),
      review: t('progress.review'),
      placement: t('progress.placement'),
      timed: t('progress.timed'),
      certified: t('progress.certified'),
    };
    return map[mode] ?? mode;
  };

  const keyStatusLabel = (stat) => {
    const visual = keyVisualState(stat);
    if (visual.kind === 'mastered') return t('progress.legendMastered');
    if (visual.kind === 'locked') return t('progress.legendLocked');
    if (visual.kind === 'unknown') return t('progress.legendUnknown');
    return t('progress.legendInProgress');
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-7">
      {isError && (
        <div>
          <p role="status" className="mb-2 text-sm text-muted">
            {t('progress.refreshFailed')}
          </p>
          <ErrorMessage
            error={error}
            onRetry={() => refetch()}
            retrying={isFetching}
          />
        </div>
      )}

      <header>
        <h1 className="mb-1 font-display text-[32px] font-bold leading-tight max-md:text-2xl">
          {t('progress.title')}
        </h1>
        <p className="text-muted">{t('progress.description')}</p>
      </header>

      {/* Separated Learning vs. Assessment Trends */}
      <section aria-labelledby="trends-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="trends-heading" className="font-display text-xl font-bold">
              {t('progress.trendsTitle')}
            </h2>
            <p className="text-sm text-muted">
              {t('progress.trendSeparationNote')}
            </p>
          </div>
          {sessions.length > 0 && (
            <button
              type="button"
              aria-expanded={showTrendTable}
              onClick={() => setShowTrendTable((prev) => !prev)}
              className="min-h-11 rounded-control border border-border-control bg-surface px-4 py-2 text-sm font-bold text-ink hover:bg-subtle"
            >
              {showTrendTable
                ? t('progress.hideTrendTable')
                : t('progress.showTrendTable')}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          {/* Learning group card */}
          <article className="rounded-card border border-border-subtle bg-surface p-6 shadow-card">
            <h3 className="font-display text-lg font-bold text-learning-strong">
              {t('progress.learningTrendTitle')}
            </h3>
            <p className="mt-1 text-xs text-muted">
              {t('progress.sessionsCount', { count: learningSummary.count })}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              <div>
                <p className="text-xs font-semibold text-muted">
                  {t('progress.averageSpeed')}
                </p>
                <p
                  className="mt-1 font-mono text-3xl font-extrabold text-learning-strong"
                  dir="ltr"
                >
                  {formatMetric(learningSummary.averageNetWpm) ?? '—'}{' '}
                  <span className="text-sm text-muted">WPM</span>
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted">
                  {t('progress.averageAccuracy')}
                </p>
                <p
                  className="mt-1 font-mono text-3xl font-extrabold text-success-text"
                  dir="ltr"
                >
                  {formatMetric(learningSummary.averageRawAccuracy, '%') ?? '—'}
                </p>
              </div>
            </div>
            <TrendChart
              sessions={learningSessions}
              field="netWpm"
              colorClass="text-learning-strong"
              label={t('progress.netWpm')}
              unit=" WPM"
            />
            <TrendChart
              sessions={learningSessions}
              field="rawAccuracy"
              colorClass="text-success-text"
              label={t('progress.rawAccuracy')}
              unit="%"
            />
          </article>

          {/* Assessment group card */}
          <article className="rounded-card border border-border-subtle bg-surface p-6 shadow-card">
            <h3 className="font-display text-lg font-bold text-ink">
              {t('progress.assessmentTrendTitle')}
            </h3>
            <p className="mt-1 text-xs text-muted">
              {t('progress.sessionsCount', { count: assessmentSummary.count })}
            </p>
            {assessmentSummary.count === 0 ? (
              <p className="mt-4 text-sm text-muted">
                {t('progress.noAssessmentSessions')}
              </p>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                  <div>
                    <p className="text-xs font-semibold text-muted">
                      {t('progress.averageSpeed')}
                    </p>
                    <p
                      className="mt-1 font-mono text-3xl font-extrabold text-learning-strong"
                      dir="ltr"
                    >
                      {formatMetric(assessmentSummary.averageNetWpm) ?? '—'}{' '}
                      <span className="text-sm text-muted">WPM</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted">
                      {t('progress.averageAccuracy')}
                    </p>
                    <p
                      className="mt-1 font-mono text-3xl font-extrabold text-success-text"
                      dir="ltr"
                    >
                      {formatMetric(assessmentSummary.averageRawAccuracy, '%') ??
                        '—'}
                    </p>
                  </div>
                </div>
                <TrendChart
                  sessions={assessmentSessions}
                  field="netWpm"
                  colorClass="text-learning-strong"
                  label={t('progress.netWpm')}
                  unit=" WPM"
                />
                <TrendChart
                  sessions={assessmentSessions}
                  field="rawAccuracy"
                  colorClass="text-success-text"
                  label={t('progress.rawAccuracy')}
                  unit="%"
                />
              </>
            )}
          </article>
        </div>

        {showTrendTable && sessions.length > 0 && (
          <div className="overflow-x-auto rounded-card border border-border-subtle bg-surface shadow-card">
            <table
              className={`w-full min-w-[540px] border-collapse ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            >
              <caption className="sr-only">
                {t('progress.trendsTitle')}
              </caption>
              <thead>
                <tr className="border-b border-border-subtle bg-subtle/50 text-xs text-muted">
                  <th className="px-4 py-3">{t('progress.completed')}</th>
                  <th className="px-4 py-3">{t('progress.modeCategory')}</th>
                  <th className="px-4 py-3">{t('progress.mode')}</th>
                  <th className="px-4 py-3">{t('progress.netWpm')}</th>
                  <th className="px-4 py-3">{t('progress.rawAccuracy')}</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="border-b border-border-subtle text-sm last:border-0"
                  >
                    <td className="px-4 py-2.5">
                      {dateLabel(session.completedAt, locale)}
                    </td>
                    <td className="px-4 py-2.5">
                      {isAssessmentMode(session.mode)
                        ? t('progress.categoryAssessment')
                        : t('progress.categoryLearning')}
                    </td>
                    <td className="px-4 py-2.5 font-semibold">
                      {modeLabel(session.mode)}
                    </td>
                    <td className="px-4 py-2.5 font-mono" dir="ltr">
                      {formatMetric(session.netWpm) ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 font-mono" dir="ltr">
                      {formatMetric(session.rawAccuracy, '%') ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* QWERTY Key Evidence Heat Map + Accessible Table Alternative */}
      <section
        aria-labelledby="heatmap-heading"
        className="rounded-card border border-border-subtle bg-surface p-6 shadow-card"
      >
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="heatmap-heading" className="font-display text-xl font-bold">
              {t('progress.heatmapTitle')}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {t('progress.heatmapDescription')}
            </p>
          </div>
          {keys.length > 0 && (
            <button
              type="button"
              aria-expanded={showKeyTable}
              onClick={() => setShowKeyTable((prev) => !prev)}
              className="min-h-11 rounded-control border border-border-control bg-surface px-4 py-2 text-sm font-bold text-ink hover:bg-subtle"
            >
              {showKeyTable
                ? t('progress.hideKeyTable')
                : t('progress.showKeyTable')}
            </button>
          )}
        </div>

        {/* Non-colour + colour legend */}
        <div className="mb-4 flex flex-wrap gap-3 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success-accent bg-success-soft px-3 py-1 text-success-text">
            <CheckIcon size={12} aria-hidden="true" />
            {t('progress.legendMastered')}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-learning-accent bg-learning-soft px-3 py-1 text-learning-strong">
            <span aria-hidden="true">•</span>
            {t('progress.legendInProgress')}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border-control bg-surface px-3 py-1 text-muted">
            <span aria-hidden="true">?</span>
            {t('progress.legendUnknown')}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-disabled-bg px-3 py-1 text-disabled-text">
            <LockIcon size={12} aria-hidden="true" />
            {t('progress.legendLocked')}
          </span>
        </div>

        {keys.length === 0 ? (
          <p className="text-sm text-muted">{t('progress.unavailable')}</p>
        ) : (
          <>
            <div
              className="overflow-x-auto rounded-card border border-border-subtle bg-subtle/40 p-4 [direction:ltr]! [unicode-bidi:isolate]"
              lang="en"
              dir="ltr"
            >
              <div className="flex min-w-[520px] flex-col items-center gap-2">
                {QWERTY_HEATMAP_ROWS.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex justify-center gap-1.5"
                    style={{ paddingLeft: `${rowIndex * 14}px` }}
                  >
                    {row.map((keyChar) => {
                      const stat = keyMap.get(keyChar) ?? null;
                      const visual = keyVisualState(stat);
                      const isSelected = activeKeyChar === keyChar;
                      const accuracyText =
                        formatMetric(stat?.accuracy, '%') ??
                        t('progress.unavailable');
                      const latencyText =
                        stat?.avgMs == null
                          ? t('progress.unavailable')
                          : t('progress.msUnit', {
                              value: Math.round(stat.avgMs),
                            });

                      return (
                        <button
                          key={keyChar}
                          type="button"
                          aria-pressed={isSelected}
                          aria-label={`${keyChar.toUpperCase()} — ${keyStatusLabel(
                            stat,
                          )}, ${t('progress.keyAccuracy')}: ${accuracyText}, ${t(
                            'progress.keyLatency',
                          )}: ${latencyText}`}
                          onClick={() => setSelectedKey(keyChar)}
                          className={`flex min-h-11 min-w-11 flex-col items-center justify-center rounded-control border-2 px-2 py-1 font-mono text-sm font-bold transition-colors ${
                            visual.classes
                          } ${
                            isSelected
                              ? 'ring-2 ring-focus-ring ring-offset-2'
                              : ''
                          }`}
                        >
                          <span>{keyChar.toUpperCase()}</span>
                          <span className="text-[10px] leading-none">
                            {visual.kind === 'mastered'
                              ? '✓'
                              : visual.kind === 'locked'
                                ? '🔒'
                                : visual.kind === 'unknown'
                                  ? '?'
                                  : '•'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Selected key evidence detail */}
            <div
              className="mt-4 rounded-card border border-border-subtle bg-subtle/30 p-4"
              aria-live="polite"
            >
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span
                  className="inline-flex size-10 items-center justify-center rounded-control border-2 border-learning-accent bg-learning-soft font-mono text-lg font-bold text-learning-strong"
                  dir="ltr"
                  lang="en"
                >
                  {activeKeyChar.toUpperCase()}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold">
                    {t('progress.selectedKeyTitle')}
                  </h3>
                  <p className="text-xs text-muted">
                    {t('progress.keyStatus')}: {keyStatusLabel(activeKeyStat)}
                  </p>
                </div>
              </div>
              <dl className="grid grid-cols-5 gap-3 text-sm max-md:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted">
                    {t('progress.keyAccuracy')}
                  </dt>
                  <dd className="font-mono font-bold" dir="ltr">
                    {formatMetric(activeKeyStat?.accuracy, '%') ??
                      t('progress.unavailable')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">
                    {t('progress.keyLatency')}
                  </dt>
                  <dd className="font-mono font-bold" dir="ltr">
                    {activeKeyStat?.avgMs == null
                      ? t('progress.unavailable')
                      : t('progress.msUnit', {
                          value: Math.round(activeKeyStat.avgMs),
                        })}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">
                    {t('progress.keyAttempts')}
                  </dt>
                  <dd className="font-mono font-bold" dir="ltr">
                    {activeKeyStat?.attempts ?? 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">
                    {t('progress.keyLatencySamples')}
                  </dt>
                  <dd className="font-mono font-bold" dir="ltr">
                    {activeKeyStat?.latencySamples ?? 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">
                    {t('progress.keySessions')}
                  </dt>
                  <dd className="font-mono font-bold" dir="ltr">
                    {activeKeyStat?.sessions ?? 0}
                  </dd>
                </div>
              </dl>
            </div>

            {showKeyTable && (
              <div className="mt-4 overflow-x-auto rounded-card border border-border-subtle">
                <table
                  className={`w-full min-w-[600px] border-collapse ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                >
                  <caption className="sr-only">
                    {t('progress.keyTableTitle')}
                  </caption>
                  <thead>
                    <tr className="border-b border-border-subtle bg-subtle/50 text-xs text-muted">
                      <th className="px-4 py-3">{t('progress.keyColumn')}</th>
                      <th className="px-4 py-3">{t('progress.keyStatus')}</th>
                      <th className="px-4 py-3">{t('progress.keyAccuracy')}</th>
                      <th className="px-4 py-3">{t('progress.keyLatency')}</th>
                      <th className="px-4 py-3">{t('progress.keyAttempts')}</th>
                      <th className="px-4 py-3">
                        {t('progress.keyLatencySamples')}
                      </th>
                      <th className="px-4 py-3">{t('progress.keySessions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((item) => (
                      <tr
                        key={item.key}
                        className="border-b border-border-subtle text-sm last:border-0"
                      >
                        <td
                          className="px-4 py-2.5 font-mono font-bold"
                          dir="ltr"
                          lang="en"
                        >
                          {item.key.toUpperCase()}
                        </td>
                        <td className="px-4 py-2.5">{keyStatusLabel(item)}</td>
                        <td className="px-4 py-2.5 font-mono" dir="ltr">
                          {formatMetric(item.accuracy, '%') ??
                            t('progress.unavailable')}
                        </td>
                        <td className="px-4 py-2.5 font-mono" dir="ltr">
                          {item.avgMs == null
                            ? t('progress.unavailable')
                            : t('progress.msUnit', {
                                value: Math.round(item.avgMs),
                              })}
                        </td>
                        <td className="px-4 py-2.5 font-mono" dir="ltr">
                          {item.attempts}
                        </td>
                        <td className="px-4 py-2.5 font-mono" dir="ltr">
                          {item.latencySamples}
                        </td>
                        <td className="px-4 py-2.5 font-mono" dir="ltr">
                          {item.sessions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      {/* Session Records + Draft Filters + Pagination */}
      <section
        className="overflow-hidden rounded-card border border-border-subtle bg-surface shadow-card"
        aria-labelledby="session-records-title"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border-subtle px-6 py-5">
          <h2 id="session-records-title" className="font-display text-xl font-bold">
            {t('progress.records')}
          </h2>

          <div
            className="flex flex-wrap items-end gap-3"
            role="group"
            aria-label={t('progress.filter')}
          >
            <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
              <span>{t('progress.modeFilter')}</span>
              <select
                value={filters.mode}
                onChange={(event) => updateFilter({ mode: event.target.value })}
                className="min-h-11 rounded-control border border-border-control bg-surface px-3 py-2 text-sm font-semibold text-ink"
              >
                <option value="all">{t('progress.all')}</option>
                <option value="learning">{t('progress.learningGroup')}</option>
                <option value="assessment">
                  {t('progress.assessmentGroup')}
                </option>
                <option value="practice">{t('progress.practice')}</option>
                <option value="lesson">{t('progress.lesson')}</option>
                <option value="review">{t('progress.review')}</option>
                <option value="placement">{t('progress.placement')}</option>
                <option value="timed">{t('progress.timed')}</option>
                <option value="certified">{t('progress.certified')}</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
              <span>{t('progress.difficultyFilter')}</span>
              <select
                value={filters.difficulty}
                onChange={(event) =>
                  updateFilter({ difficulty: event.target.value })
                }
                className="min-h-11 rounded-control border border-border-control bg-surface px-3 py-2 text-sm font-semibold text-ink"
              >
                <option value="all">{t('progress.allDifficulties')}</option>
                <option value="1">{t('progress.difficulty1')}</option>
                <option value="2">{t('progress.difficulty2')}</option>
                <option value="3">{t('progress.difficulty3')}</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
              <span>{t('progress.timeFilter')}</span>
              <select
                value={filters.timeRange}
                onChange={(event) =>
                  updateFilter({ timeRange: event.target.value })
                }
                className="min-h-11 rounded-control border border-border-control bg-surface px-3 py-2 text-sm font-semibold text-ink"
              >
                <option value="all">{t('progress.allTime')}</option>
                <option value="7d">{t('progress.last7Days')}</option>
                <option value="30d">{t('progress.last30Days')}</option>
                <option value="90d">{t('progress.last90Days')}</option>
              </select>
            </label>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="min-h-11 rounded-control border border-border-control bg-surface px-4 py-2 text-sm font-bold text-ink hover:bg-subtle"
              >
                {t('progress.clearFilters')}
              </button>
            )}
          </div>
        </div>

        {pagedHistory.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={t('progress.records')}
              description={
                sessions.length ? t('progress.noMatch') : t('progress.empty')
              }
              actionLabel={
                hasActiveFilters ? t('progress.clearFilters') : undefined
              }
              onAction={hasActiveFilters ? resetFilters : undefined}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table
                className={`w-full min-w-[760px] border-collapse ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
              >
                <thead>
                  <tr className="border-b border-border-subtle text-xs text-muted">
                    <th className="px-4 py-3">{t('progress.completed')}</th>
                    <th className="px-4 py-3">{t('progress.modeCategory')}</th>
                    <th className="px-4 py-3">{t('progress.mode')}</th>
                    <th className="px-4 py-3">{t('progress.netWpm')}</th>
                    <th className="px-4 py-3">{t('progress.grossWpm')}</th>
                    <th className="px-4 py-3">{t('progress.rawAccuracy')}</th>
                    <th className="px-4 py-3">{t('progress.finalAccuracy')}</th>
                    <th className="px-4 py-3">{t('progress.duration')}</th>
                    <th className="px-4 py-3">{t('progress.xpEarned')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedHistory.items.map((session) => (
                    <tr
                      key={session.id}
                      className="border-b border-border-subtle text-sm last:border-0"
                    >
                      <td className="px-4 py-3">
                        {dateLabel(session.completedAt, locale)}
                      </td>
                      <td className="px-4 py-3">
                        {isAssessmentMode(session.mode)
                          ? t('progress.categoryAssessment')
                          : t('progress.categoryLearning')}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {modeLabel(session.mode)}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold" dir="ltr">
                        {formatMetric(session.netWpm) ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-mono" dir="ltr">
                        {formatMetric(session.grossWpm) ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-mono" dir="ltr">
                        {formatMetric(session.rawAccuracy, '%') ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-mono" dir="ltr">
                        {formatMetric(session.finalAccuracy, '%') ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-mono" dir="ltr">
                        {durationLabel(session.durationMs)}
                      </td>
                      <td className="px-4 py-3 font-mono" dir="ltr">
                        {session.xpEarned}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagedHistory.totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle px-6 py-4 text-sm">
                <p className="text-muted">
                  {t('progress.pageSummary', {
                    page: pagedHistory.page,
                    totalPages: pagedHistory.totalPages,
                    totalItems: pagedHistory.totalItems,
                  })}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pagedHistory.page <= 1}
                    onClick={() =>
                      updateFilter({ page: pagedHistory.page - 1 })
                    }
                    className="min-h-11 rounded-control border border-border-control bg-surface px-4 py-2 font-bold text-ink hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t('progress.previousPage')}
                  </button>
                  <button
                    type="button"
                    disabled={pagedHistory.page >= pagedHistory.totalPages}
                    onClick={() =>
                      updateFilter({ page: pagedHistory.page + 1 })
                    }
                    className="min-h-11 rounded-control border border-border-control bg-surface px-4 py-2 font-bold text-ink hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t('progress.nextPage')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
