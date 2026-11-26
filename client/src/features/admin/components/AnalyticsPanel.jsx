// Admin analytics panel — platform-wide usage, speed/accuracy, problem keys and
// generation stats for the reporting window selected by the admin.
//
// Rules enforced here (SYS-44 / task FE-21):
//   - Zero denominators are shown as "Not available", never 0 % or 0 wpm.
//   - Learning and assessment modes are shown in separate breakdowns.
//   - Private raw keystroke logs are never displayed.
//   - Data labeled as "Development fixture" when the real endpoint is not deployed.
//   - Report window boundaries (start/end dates) are always visible.
import { useState } from 'react';
import { useTranslation } from '../../../i18n/useTranslation.js';
import { useAnalytics } from '../hooks/useAdmin.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format a nullable percentage for display.
 * Returns "Not available" when the rate is null (zero denominator).
 *
 * @param {number|null} rate - Decimal 0–1 or null.
 * @returns {string}
 */
function formatRate(rate) {
  if (rate === null || rate === undefined) return 'Not available';
  return `${(rate * 100).toFixed(1)} %`;
}

/**
 * Format a nullable WPM value for display.
 * Returns "Not available" when missing (no sessions with valid data).
 *
 * @param {number|null} wpm
 * @returns {string}
 */
function formatWpm(wpm) {
  if (wpm === null || wpm === undefined) return 'Not available';
  return `${Math.round(wpm)} wpm`;
}

/**
 * Format a nullable accuracy value for display.
 * Returns "Not available" when missing (zero denominator).
 *
 * @param {number|null} accuracy - 0–100 scale.
 * @returns {string}
 */
function formatAccuracy(accuracy) {
  if (accuracy === null || accuracy === undefined) return 'Not available';
  return `${accuracy.toFixed(1)} %`;
}

/**
 * Human-readable date string for a window boundary ISO timestamp.
 *
 * @param {string} isoString
 * @returns {string}
 */
function formatWindowDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Shared card wrapper to keep surface/shadow styling consistent.
 *
 * @param {{ title: string, children: React.ReactNode, className?: string }} props
 */
function AnalyticsCard({ title, children, className = '' }) {
  return (
    <section
      className={[
        'bg-surface border border-border-subtle rounded-card p-6 shadow-card',
        '[transition:border-color_var(--motion-fast),_box-shadow_var(--motion-fast)]',
        className,
      ].filter(Boolean).join(' ')}
    >
      <h3 className="font-display rtl:font-arabic text-[16px] leading-[24px] font-bold text-muted mb-4">
        {title}
      </h3>
      {children}
    </section>
  );
}

/**
 * One statistic value inside a card — label + big number + optional denominator note.
 *
 * @param {{ label: string, value: string, note?: string, valueClass?: string }} props
 */
function StatRow({ label, value, note, valueClass = '' }) {
  return (
    <div className="flex flex-col gap-0.5 mb-4 last:mb-0">
      <div className="text-[13px] text-muted">{label}</div>
      <div
        className={[
          'font-mono text-[26px] leading-[34px] font-bold [direction:ltr]! text-left! [unicode-bidi:isolate]',
          valueClass || (value === 'Not available' ? 'text-muted' : 'text-ink'),
        ].filter(Boolean).join(' ')}
      >
        {value}
      </div>
      {note && <div className="text-[11px] text-muted">{note}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Window filter
// ---------------------------------------------------------------------------

/** @param {{ value: string, onChange: (w:string)=>void, t: Function }} props */
function WindowFilter({ value, onChange, t }) {
  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="analytics-window"
        className="text-[13px] font-bold text-muted whitespace-nowrap"
      >
        {t('analytics.windowLabel')}
      </label>
      <select
        id="analytics-window"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          'h-9 py-0 px-3 font-body rtl:font-arabic text-[14px] text-ink bg-surface',
          'border border-border-control rounded-control',
          '[transition:border-color_var(--motion-fast)] focus:outline-none focus:border-focus-ring',
        ].join(' ')}
      >
        <option value="7d">{t('analytics.window7d')}</option>
        <option value="30d">{t('analytics.window30d')}</option>
        <option value="90d">{t('analytics.window90d')}</option>
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Speed/accuracy per mode
// ---------------------------------------------------------------------------

/**
 * Renders one mode's speed and accuracy metrics side-by-side.
 * Mode label is always shown so the category is never unlabeled.
 *
 * @param {{ entry: object, t: Function }} props
 */
function ModeBreakdownCard({ entry, t }) {
  const modeLabel = t(`analytics.mode_${entry.mode}`) || entry.mode;
  return (
    <AnalyticsCard title={modeLabel}>
      <div className="text-[11px] text-muted mb-3">
        {t('analytics.sessionCount')}: {entry.sessionCount}
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-0">
        <StatRow
          label={t('analytics.avgNetWpm')}
          value={formatWpm(entry.avgNetWpm)}
        />
        <StatRow
          label={t('analytics.avgGrossWpm')}
          value={formatWpm(entry.avgGrossWpm)}
        />
        <StatRow
          label={t('analytics.avgRawAccuracy')}
          value={formatAccuracy(entry.avgRawAccuracy)}
        />
        <StatRow
          label={t('analytics.avgFinalAccuracy')}
          value={formatAccuracy(entry.avgFinalAccuracy)}
        />
      </div>
    </AnalyticsCard>
  );
}

// ---------------------------------------------------------------------------
// Problem keys table
// ---------------------------------------------------------------------------

/** Pagination controls for the problem-key table. */
function PaginationControls({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Problem key pages"
      className="flex items-center gap-3 mt-4 text-[13px]"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1 rounded-control border border-border-control disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ←
      </button>
      <span className="text-muted">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1 rounded-control border border-border-control disabled:opacity-40 disabled:cursor-not-allowed"
      >
        →
      </button>
    </nav>
  );
}

/**
 * Accessible table of the most-errored keys in the reporting window.
 *
 * @param {{ problemKeys: object[], pagination: object, page: number,
 *           onPageChange: (p:number)=>void, t: Function }} props
 */
function ProblemKeysTable({ problemKeys, pagination, page, onPageChange, t }) {
  if (!problemKeys || problemKeys.length === 0) {
    return (
      <p className="text-[14px] text-muted">
        {t('analytics.problemKeysEmpty')}
      </p>
    );
  }

  return (
    <>
      <div
        role="region"
        aria-label={t('analytics.problemKeysRegion')}
        tabIndex={0}
        className="max-w-full overflow-x-auto rounded-control"
      >
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-b-border-subtle text-muted text-[12px]">
              <th className="py-2 px-3">{t('analytics.colKey')}</th>
              <th className="py-2 px-3 text-right">{t('analytics.colErrors')}</th>
              <th className="py-2 px-3 text-right">{t('analytics.colAttempts')}</th>
              <th className="py-2 px-3 text-right">{t('analytics.colErrorRate')}</th>
            </tr>
          </thead>
          <tbody>
            {problemKeys.map((entry) => (
              <tr
                key={entry.key}
                className="border-b border-b-border-subtle text-[14px]"
              >
                <td className="py-2 px-3 font-mono font-bold">{entry.key}</td>
                <td className="py-2 px-3 text-right">{entry.errorCount}</td>
                <td className="py-2 px-3 text-right">{entry.attemptCount}</td>
                <td className="py-2 px-3 text-right">
                  {formatRate(entry.errorRate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationControls
        page={page}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onPageChange={onPageChange}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main AnalyticsPanel component
// ---------------------------------------------------------------------------

/**
 * Platform analytics panel rendered on the admin Overview tab.
 *
 * Data comes from GET /admin/analytics (draft contract, BE-22 pending).
 * When the endpoint is not deployed the panel shows validated fixture data
 * clearly marked as "Development fixture — not real data".
 *
 * Zero denominators are always shown as "Not available" (SYS-44).
 * Learning and assessment modes are shown in separate breakdowns (SYS-23).
 * Private keystroke logs are never displayed.
 */
export function AnalyticsPanel() {
  const { t, isRTL } = useTranslation();
  const [window, setWindow] = useState('7d');
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error, refetch } = useAnalytics({
    window,
    page,
    pageSize: 20,
  });

  // Reset to page 1 when the reporting window changes.
  function handleWindowChange(newWindow) {
    setWindow(newWindow);
    setPage(1);
  }

  // Loading state
  if (isPending) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
        <div className="flex items-center gap-3">
          <span className="size-2 rounded-full animate-pulse bg-warning-accent" aria-hidden="true" />
          <span className="text-[14px] text-muted">{t('analytics.loading')}</span>
        </div>
      </div>
    );
  }

  // Hard error state
  if (isError) {
    const msg = error?.message || t('interfaceStates.errorDescription');
    return (
      <div
        role="alert"
        className="bg-error-soft border border-error-border rounded-card p-6 text-[14px] text-error-text flex flex-col gap-3"
      >
        <p className="font-bold">{t('analytics.errorTitle')}</p>
        <p>{msg}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className={[
            'self-start inline-flex items-center justify-center gap-2 h-10 py-0 px-5',
            'font-body rtl:font-arabic text-[14px] font-bold text-action-foreground',
            'bg-action-primary border-0 rounded-full cursor-pointer no-underline shadow-primary',
            '[transition:background-color_var(--motion-fast)] enabled:hover:bg-action-hover',
          ].join(' ')}
        >
          {t('analytics.retry')}
        </button>
      </div>
    );
  }

  // No data should never happen after a successful fetch, but guard anyway.
  if (!data) return null;

  return (
    <div className={['flex flex-col gap-6', isRTL ? 'text-right' : ''].filter(Boolean).join(' ')}>

      {/* Fixture notice — only shown when endpoint is not yet deployed */}
      {data._fixture && (
        <div
          role="status"
          className="bg-warning-soft border border-warning-border rounded-card p-4 text-[13px] text-warning-text"
        >
          <span className="font-bold">{t('analytics.fixtureBadge')}</span>
          {' '}{t('analytics.fixtureNotice')}
        </div>
      )}

      {/* Window selector + reporting dates */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <WindowFilter value={window} onChange={handleWindowChange} t={t} />
        <span className="text-[12px] text-muted" aria-live="polite">
          {t('analytics.windowRange')}{' '}
          {formatWindowDate(data.windowStart)} – {formatWindowDate(data.windowEnd)}
        </span>
      </div>

      {/* Key metric cards */}
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(min(100%,_220px),_1fr))] gap-4">

        {/* Active users */}
        <AnalyticsCard title={t('analytics.activeUsers')}>
          <StatRow
            label={t('analytics.activeUsersCount')}
            value={String(data.activeUsers.count)}
            note={`${t('analytics.windowDenominator')} ${data.activeUsers.windowDays}d`}
            valueClass="text-learning-strong"
          />
        </AnalyticsCard>

        {/* Session totals */}
        <AnalyticsCard title={t('analytics.sessions')}>
          <StatRow
            label={t('analytics.totalSessions')}
            value={String(data.sessions.total)}
          />
          <StatRow
            label={t('analytics.completionRate')}
            value={formatRate(data.sessions.completionRate)}
            note={t('analytics.completionRateNote')}
          />
        </AnalyticsCard>

        {/* Generation / fallback outcomes */}
        <AnalyticsCard title={t('analytics.generation')}>
          <StatRow
            label={t('analytics.totalAssignments')}
            value={String(data.generation.totalAssignments)}
          />
          <StatRow
            label={t('analytics.aiPassRate')}
            value={formatRate(data.generation.aiPassRate)}
            note={`${t('analytics.aiPassCount')}: ${data.generation.aiPassCount}`}
          />
          <StatRow
            label={t('analytics.fallbackRate')}
            value={formatRate(data.generation.fallbackRate)}
            note={`${t('analytics.fallbackCount')}: ${data.generation.fallbackCount}`}
          />
        </AnalyticsCard>
      </div>

      {/* Session breakdown by mode */}
      {data.sessions.total > 0 && Object.keys(data.sessions.byMode).length > 0 && (
        <section aria-labelledby="sessions-by-mode-heading">
          <h3
            id="sessions-by-mode-heading"
            className="font-display rtl:font-arabic text-[16px] leading-[24px] font-bold mb-3"
          >
            {t('analytics.sessionsByMode')}
          </h3>
          <div className="flex flex-wrap gap-3 text-[13px]">
            {Object.entries(data.sessions.byMode).map(([mode, count]) => (
              <span
                key={mode}
                className="bg-subtle border border-border-subtle rounded-full py-1 px-3"
              >
                {t(`analytics.mode_${mode}`) || mode}: {count}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Speed/accuracy breakdown — one card per mode; never combined */}
      {data.speedByMode.length > 0 && (
        <section aria-labelledby="speed-accuracy-heading">
          <h3
            id="speed-accuracy-heading"
            className="font-display rtl:font-arabic text-[16px] leading-[24px] font-bold mb-3"
          >
            {t('analytics.speedAccuracyBreakdown')}
          </h3>
          <p className="text-[12px] text-muted mb-4">{t('analytics.speedAccuracyNote')}</p>
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(min(100%,_280px),_1fr))] gap-4">
            {data.speedByMode.map((entry) => (
              <ModeBreakdownCard key={entry.mode} entry={entry} t={t} />
            ))}
          </div>
        </section>
      )}

      {/* Empty speed/accuracy state */}
      {data.speedByMode.length === 0 && (
        <AnalyticsCard title={t('analytics.speedAccuracyBreakdown')}>
          <p className="text-[14px] text-muted">{t('analytics.noSpeedData')}</p>
        </AnalyticsCard>
      )}

      {/* Problem keys table */}
      <section aria-labelledby="problem-keys-heading">
        <h3
          id="problem-keys-heading"
          className="font-display rtl:font-arabic text-[16px] leading-[24px] font-bold mb-3"
        >
          {t('analytics.problemKeys')}
        </h3>
        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card">
          <ProblemKeysTable
            problemKeys={data.problemKeys}
            pagination={data.pagination}
            page={page}
            onPageChange={setPage}
            t={t}
          />
        </div>
      </section>
    </div>
  );
}
