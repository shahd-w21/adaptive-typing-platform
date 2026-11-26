import { useMemo, useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation.js';
import { useProgress } from './hooks/useProgress.js';

const EMPTY_SESSIONS = [];

function dateLabel(value, locale) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function TrendChart({ sessions, field, title, suffix, locale, t }) {
  const values = sessions
    .filter(session => Number.isFinite(session[field]))
    .slice()
    .sort((left, right) => new Date(left.completedAt) - new Date(right.completedAt));

  if (values.length === 0) {
    return (
      <section className="rounded-card border border-border-subtle bg-surface p-5">
        <h2 className="mb-2 font-display text-lg font-bold">{title}</h2>
        <p className="text-sm text-muted">{t('progress.chartUnavailable')}</p>
      </section>
    );
  }

  const numbers = values.map(session => session[field]);
  const minimum = Math.min(...numbers);
  const range = Math.max(...numbers) - minimum || 1;
  const coordinates = numbers.map((value, index) => {
    const x = values.length === 1 ? 50 : 4 + (index / (values.length - 1)) * 92;
    const y = 36 - ((value - minimum) / range) * 28;
    return `${x},${y}`;
  });

  return (
    <section className="rounded-card border border-border-subtle bg-surface p-5" aria-labelledby={`${field}-trend-title`}>
      <h2 id={`${field}-trend-title`} className="mb-3 font-display text-lg font-bold">
        {title}
      </h2>
      <figure>
        <div className="h-36 w-full rounded-control bg-page p-3">
          <svg
            viewBox="0 0 100 40"
            className="h-full w-full overflow-visible"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {[8, 22, 36].map(y => (
              <line
                key={y}
                x1="0"
                x2="100"
                y1={y}
                y2={y}
                stroke="var(--tf-color-border-subtle)"
                strokeWidth="0.5"
              />
            ))}
            {coordinates.length > 1 && (
              <polyline
                points={coordinates.join(' ')}
                fill="none"
                stroke="var(--tf-color-learning-accent)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {coordinates.map((point, index) => {
              const [x, y] = point.split(',');
              return (
                <circle
                  key={values[index].id}
                  cx={x}
                  cy={y}
                  r="1.6"
                  fill="var(--tf-color-learning-accent)"
                />
              );
            })}
          </svg>
        </div>
        <figcaption className="mt-2 flex justify-between text-xs text-muted">
          <span>{dateLabel(values[0].completedAt, locale)}</span>
          <span dir="ltr">{numbers[numbers.length - 1]}{suffix}</span>
        </figcaption>
      </figure>
      <details className="mt-3 border-t border-border-subtle pt-3">
        <summary className="min-h-11 cursor-pointer py-2 text-sm font-bold text-action-link">
          {t('progress.chartData')}
        </summary>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-muted">
                <th className="py-2 pe-3">{t('progress.completed')}</th>
                <th className="py-2" dir="ltr">{title}</th>
              </tr>
            </thead>
            <tbody>
              {values.map(session => (
                <tr key={session.id} className="border-b border-border-subtle last:border-0">
                  <td className="py-2 pe-3">{dateLabel(session.completedAt, locale)}</td>
                  <td className="py-2 font-mono" dir="ltr">{session[field]}{suffix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

export function ProgressView() {
  const { isRTL, locale, t } = useTranslation();
  const [filterMode, setFilterMode] = useState('all');
  const { data, isPending, isError, refetch } = useProgress();
  const sessions = data?.sessions ?? EMPTY_SESSIONS;
  const filteredHistory = useMemo(() => filterMode === 'all'
    ? sessions
    : sessions.filter(session => session.mode === filterMode), [filterMode, sessions]);
  const average = field => {
    const values = sessions.map(session => session[field]).filter(value => Number.isFinite(value));
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  };
  const averageNetWpm = average('netWpm');
  const averageRawAccuracy = average('rawAccuracy');
  const trendSessions = filteredHistory;

  if (isPending) return <p className="mx-auto max-w-3xl rounded-card border border-border-subtle bg-surface p-6 text-muted shadow-card" role="status">{t('progress.loading')}</p>;
  if (isError) return (
    <section className="mx-auto max-w-3xl rounded-card border border-error-text/30 bg-error-soft p-6 text-error-text" role="alert">
      <h1 className="mb-2 font-display text-2xl font-bold">{t('progress.errorTitle')}</h1>
      <p className="mb-4">{t('progress.errorDescription')}</p>
      <button type="button" onClick={() => refetch()} className="min-h-11 rounded-full border border-error-text/40 px-5 py-2 font-bold">{t('common.retry')}</button>
    </section>
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 font-display text-[32px] font-bold leading-tight max-md:text-2xl">{t('progress.title')}</h1>
          <p className="text-muted">{t('progress.description')}</p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('progress.filter')}>
          {[["all", t('progress.all')], ["practice", t('progress.practice')]].map(([value, label]) => (
            <button key={value} type="button" aria-pressed={filterMode === value} onClick={() => setFilterMode(value)} className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${filterMode === value ? 'border-action-primary bg-action-primary text-action-foreground' : 'border-border-subtle bg-surface text-ink hover:bg-subtle'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <article className="rounded-card border border-border-subtle bg-surface p-6 shadow-card">
          <p className="text-sm font-semibold text-muted">{t('progress.averageSpeed')}</p>
          <p className="my-2 font-mono text-4xl font-extrabold text-learning-strong" dir="ltr">{averageNetWpm == null ? '—' : averageNetWpm.toFixed(1)} <span className="text-base text-muted">WPM</span></p>
          <p className="text-xs text-muted">{t('progress.sessionsCount', { count: sessions.length })}</p>
        </article>
        <article className="rounded-card border border-border-subtle bg-surface p-6 shadow-card">
          <p className="text-sm font-semibold text-muted">{t('progress.averageAccuracy')}</p>
          <p className="my-2 font-mono text-4xl font-extrabold text-success-text" dir="ltr">{averageRawAccuracy == null ? '—' : `${averageRawAccuracy.toFixed(1)}%`}</p>
          <p className="text-xs text-muted">{t('progress.serverScored')}</p>
        </article>
      </div>

      <section className="mb-7 grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label={t('progress.trends')}>
        <TrendChart
          sessions={trendSessions}
          field="netWpm"
          title={t('progress.speedTrend')}
          suffix=" WPM"
          locale={locale}
          t={t}
        />
        <TrendChart
          sessions={trendSessions}
          field="rawAccuracy"
          title={t('progress.accuracyTrend')}
          suffix="%"
          locale={locale}
          t={t}
        />
      </section>

      <section className="overflow-hidden rounded-card border border-border-subtle bg-surface shadow-card" aria-labelledby="session-records-title">
        <div className="border-b border-border-subtle px-6 py-5"><h2 id="session-records-title" className="font-display text-xl font-bold">{t('progress.records')}</h2></div>
        {filteredHistory.length === 0 ? (
          <p className="p-6 text-sm text-muted">{sessions.length ? t('progress.noMatch') : t('progress.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full min-w-[680px] border-collapse ${isRTL ? 'text-right' : 'text-left'}`}>
              <thead><tr className="border-b border-border-subtle text-xs text-muted"><th className="px-4 py-3">{t('progress.completed')}</th><th className="px-4 py-3">{t('progress.mode')}</th><th className="px-4 py-3">{t('progress.netWpm')}</th><th className="px-4 py-3">{t('progress.grossWpm')}</th><th className="px-4 py-3">{t('progress.rawAccuracy')}</th><th className="px-4 py-3">{t('progress.finalAccuracy')}</th></tr></thead>
              <tbody>{filteredHistory.map(session => (
                <tr key={session.id} className="border-b border-border-subtle text-sm last:border-0">
                  <td className="px-4 py-3">{dateLabel(session.completedAt, locale)}</td>
                  <td className="px-4 py-3 font-semibold">{session.mode}</td>
                  <td className="px-4 py-3 font-mono font-bold" dir="ltr">{session.netWpm ?? '—'}</td>
                  <td className="px-4 py-3 font-mono" dir="ltr">{session.grossWpm ?? '—'}</td>
                  <td className="px-4 py-3 font-mono" dir="ltr">{session.rawAccuracy == null ? '—' : `${session.rawAccuracy}%`}</td>
                  <td className="px-4 py-3 font-mono" dir="ltr">{session.finalAccuracy == null ? '—' : `${session.finalAccuracy}%`}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
