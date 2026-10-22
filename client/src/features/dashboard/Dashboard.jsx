// Existing server-backed dashboard reuses shared request and empty states.
import { Loading } from '../../components/Loading.jsx';
import { ErrorMessage } from '../../components/ErrorMessage.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { useTranslation } from '../../i18n/useTranslation.js';
import {
  PlayIcon,
  FlameIcon,
  ArrowRightIcon,
  CheckIcon,
  LockIcon,
} from '../../components/ui/Icons.jsx';
import { useDashboard } from './hooks/useDashboard.js';
import { useLearningPath } from '../learning-path/useLearningPath.js';
import { formatMetricNumber } from '../../lib/formatMetricNumber.js';

/** Display current request state without replacing the dashboard's data ownership. */
function RequestState({ error, onRetry, loading = false, retrying = false }) {
  if (loading) {
    return <Loading compact />;
  }
  return error ? (
    <ErrorMessage error={error} onRetry={onRetry} retrying={retrying} />
  ) : null;
}

function formatSessionDate(value, locale) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
}

/** Localize activity labels only; the server owns the actual adaptive reason. */
function getRecommendationCopy(recommendation, t) {
  const titles = {
    placement: 'dashboard.placementTitle',
    timed: 'dashboard.timedTitle',
    practice: 'dashboard.nextPractice',
  };
  return {
    title: t(titles[recommendation.activity]),
    reason: recommendation.reason,
  };
}

export function Dashboard({
  onStartPractice,
  onNavigate,
  launchPending = false,
  hasActiveSession = false,
}) {
  const { isRTL, locale, t } = useTranslation();
  const dashboardQuery = useDashboard();
  const pathQuery = useLearningPath();

  if (dashboardQuery.isPending) {
    return <Loading labelKey="dashboard.loading" />;
  }
  if (dashboardQuery.isError && !dashboardQuery.data) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 font-display text-3xl font-bold">
          {t('dashboard.title')}
        </h1>
        <RequestState
          error={dashboardQuery.error}
          onRetry={() => dashboardQuery.refetch()}
          retrying={dashboardQuery.isFetching}
        />
      </div>
    );
  }

  const data = dashboardQuery.data;
  const user = data.user;
  const dailyGoal = data.dailyGoal;
  const goal = dailyGoal.goalMinutes;
  const minutes = dailyGoal.minutesToday;
  const goalPercent =
    goal > 0 ? Math.min(100, Math.round((minutes / goal) * 100)) : 0;
  const recentSessions = data.recentSessions;
  const recommendation = data.recommendation;
  const pathGroups = pathQuery.data?.groups ?? [];
  const keyStats = pathQuery.data?.keys ?? [];
  const recommendationCopy = getRecommendationCopy(recommendation, t);

  return (
    <div className="grid grid-cols-[minmax(0,_1fr)_280px] gap-6 max-xl:grid-cols-1">
      <div className="flex min-w-0 flex-col gap-6">
        {dashboardQuery.isError && (
          <div>
            <p role="status" className="mb-2 text-muted">
              {t('dashboard.refreshFailed')}
            </p>
            <RequestState
              error={dashboardQuery.error}
              onRetry={() => dashboardQuery.refetch()}
              retrying={dashboardQuery.isFetching}
            />
          </div>
        )}
        <header>
          <h1 className="mb-1.5 font-display text-[32px] font-bold leading-[44px] max-md:text-[24px] max-md:leading-[32px]">
            {t('dashboard.welcome', {
              suffix: user.name ? `${isRTL ? '، ' : ', '}${user.name}` : '',
            })}
          </h1>
          <p className="text-muted">{t('dashboard.syncedActivity')}</p>
        </header>

        <section
          className="relative overflow-hidden rounded-card border-2 border-learning-accent bg-surface p-5 shadow-card sm:p-8"
          aria-labelledby="recommendation-title"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-learning-soft px-3 py-1 text-xs font-bold text-learning-strong">
            <span
              className="size-2 rounded-full bg-learning-accent"
              aria-hidden="true"
            />
            {t('dashboard.serverRecommendation')}
          </div>
          <h2
            id="recommendation-title"
            className="mb-2 font-display text-2xl font-bold"
          >
            {recommendationCopy.title}
          </h2>
          {/* NOTE FOR DEVS ? BE-06/BE-07: replace English prose with reviewed
              reason codes/parameters when available; do not infer or translate policy. */}
          <p className="mb-6 max-w-2xl text-muted" lang="en" dir="ltr">
            {recommendationCopy.reason}
          </p>
          {recommendation.activity !== 'practice' && (
            <p className="mb-4 text-sm text-muted">
              {t('dashboard.modeUnavailable')}
            </p>
          )}
          {recommendation?.weakestKey && (
            <div className="mb-6 flex items-center gap-2 text-sm font-bold text-muted">
              {t('dashboard.focusKey')}{' '}
              <kbd
                className="inline-flex size-9 items-center justify-center rounded-lg border border-border-control bg-subtle font-mono text-base text-ink"
                dir="ltr"
              >
                {recommendation.weakestKey.toUpperCase()}
              </kbd>
            </div>
          )}
          <button
            type="button"
            onClick={onStartPractice}
            disabled={launchPending}
            aria-busy={launchPending}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-learning-accent px-7 font-bold text-learning-foreground shadow-node transition hover:-translate-y-0.5 hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring"
          >
            <PlayIcon size={18} />
            <span>
              {t(
                launchPending
                  ? 'common.loading'
                  : hasActiveSession
                    ? 'sessionFlow.returnToSession'
                    : recommendation.activity !== 'practice'
                      ? 'dashboard.practiceAlternative'
                      : 'dashboard.startPractice',
              )}
            </span>
          </button>
        </section>

        <section
          className="rounded-card border border-border-subtle bg-surface p-4 shadow-card sm:p-6"
          aria-labelledby="path-preview-title"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2
                id="path-preview-title"
                className="font-display text-xl font-bold"
              >
                {t('dashboard.learningPath')}
              </h2>
              <p className="text-sm text-muted">{t('dashboard.keyProgress')}</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('path')}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 font-bold text-action-link hover:bg-learning-soft"
            >
              {t('dashboard.viewPath')}{' '}
              <ArrowRightIcon size={16} className={isRTL ? 'rotate-180' : ''} />
            </button>
          </div>
          <RequestState
            loading={pathQuery.isPending}
            error={pathQuery.error}
            onRetry={() => pathQuery.refetch()}
            retrying={pathQuery.isFetching}
          />
          {!pathQuery.isPending &&
            !pathQuery.isError &&
            pathGroups.length === 0 && (
              <p className="rounded-control bg-subtle p-4 text-sm text-muted">
                {t('dashboard.noGroups')}
              </p>
            )}
          {pathGroups.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {pathGroups.map((group) => {
                const keys = [...(group.keys ?? '')];
                const states = keys.map(
                  (key) =>
                    keyStats.find((stat) => stat.key === key)?.status ??
                    'unknown',
                );
                const mastered =
                  states.length > 0 &&
                  states.every((status) => status === 'mastered');
                const active = states.some(
                  (status) => status === 'in_progress',
                );
                return (
                  <div
                    key={group.id}
                    className="rounded-control border border-border-subtle bg-page p-3"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`grid size-7 place-items-center rounded-full ${mastered ? 'bg-success-soft text-success-text' : active ? 'bg-learning-soft text-learning-strong' : 'bg-subtle text-muted'}`}
                        aria-hidden="true"
                      >
                        {mastered ? (
                          <CheckIcon size={16} />
                        ) : active ? (
                          <PlayIcon size={13} />
                        ) : states.every((status) => status === 'locked') ? (
                          <LockIcon size={14} />
                        ) : (
                          '?'
                        )}
                      </span>
                      <span className="truncate text-xs font-bold">
                        {group.name}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1" dir="ltr">
                      {keys.map((key) => {
                        const status =
                          keyStats.find((stat) => stat.key === key)?.status ??
                          'unknown';
                        return (
                          <span
                            key={key}
                            className={`rounded px-1.5 py-0.5 font-mono text-[11px] ${status === 'mastered' ? 'bg-success-soft text-success-text' : status === 'in_progress' ? 'bg-learning-soft text-learning-strong' : 'bg-subtle text-muted'}`}
                          >
                            {key}
                            <span className="sr-only">
                              {' '}
                              {t(`dashboard.keyState_${status}`)}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section
          className="overflow-hidden rounded-card border border-border-subtle bg-surface shadow-card"
          aria-labelledby="recent-sessions-title"
        >
          <div className="border-b border-border-subtle px-4 py-4 sm:px-6 sm:py-5">
            <h2
              id="recent-sessions-title"
              className="font-display text-xl font-bold"
            >
              {t('dashboard.recentSessions')}
            </h2>
          </div>
          {recentSessions.length === 0 ? (
            <EmptyState description={t('dashboard.emptySessions')} />
          ) : (
            <div
              className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-focus-ring"
              tabIndex={0}
              role="region"
              aria-labelledby="recent-sessions-title"
            >
              <table
                className={`w-full min-w-[520px] border-collapse ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <thead>
                  <tr className="border-b border-border-subtle text-xs text-muted">
                    <th className="px-5 py-3">{t('dashboard.activity')}</th>
                    <th className="px-5 py-3">{t('dashboard.netSpeed')}</th>
                    <th className="px-5 py-3">{t('dashboard.rawAccuracy')}</th>
                    <th className="px-5 py-3">{t('dashboard.completed')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((session) => (
                    <tr
                      key={session.id}
                      className="border-b border-border-subtle text-sm last:border-0"
                    >
                      <td className="px-5 py-3 font-semibold">
                        {t('dashboard.practiceLabel')}
                      </td>
                      <td className="px-5 py-3 font-mono font-bold" dir="ltr">
                        {session.netWpm == null
                          ? t('dashboard.unavailable')
                          : `${formatMetricNumber(session.netWpm)} WPM`}
                      </td>
                      <td className="px-5 py-3 font-mono" dir="ltr">
                        {session.rawAccuracy == null
                          ? t('dashboard.unavailable')
                          : `${formatMetricNumber(session.rawAccuracy)}%`}
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {formatSessionDate(session.completedAt, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <aside className="flex min-w-0 flex-col gap-5">
        {import.meta.env.DEV && (
          <section
            className="rounded-card border border-border-subtle bg-surface p-5"
            aria-labelledby="sample-course-title"
          >
            {/* NOTE FOR DEVS ? FE-07/FE-12: development-only preview, not an
                enrollment DTO. Replace only after course owners review the API.
                No mastery percentage, lesson ID, URL or resume target is invented. */}
            <h2 id="sample-course-title" className="mb-2 font-bold">
              {t('dashboard.sampleCourseTitle')}
            </h2>
            <p role="note" className="mb-3 text-sm text-muted">
              {t('dashboard.sampleCourseNotice')}
            </p>
            <p lang="en" dir="ltr" className="font-semibold">
              Home Row Basics
            </p>
            <p className="mb-3 text-sm text-muted">
              {t('dashboard.sampleLesson')}
            </p>
            <button
              type="button"
              disabled
              className="min-h-11 rounded-full border border-border-control px-4 opacity-60"
            >
              {t('dashboard.courseResumeUnavailable')}
            </button>
          </section>
        )}
        <section
          className="rounded-card border border-border-subtle bg-surface p-4 shadow-card sm:p-6"
          aria-labelledby="daily-goal-title"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 id="daily-goal-title" className="font-bold">
              {t('dashboard.dailyGoal')}
            </h2>
            <span className="text-sm tabular-nums text-muted" dir="ltr">
              {minutes.toFixed(1)} / {goal} min
            </span>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-full bg-subtle"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax={goal || 1}
            aria-valuenow={Math.min(minutes, goal)}
            aria-label={t('dashboard.dailyGoal')}
          >
            <div
              className="h-full rounded-full bg-success-accent transition-[width] duration-300"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-muted">
            {dailyGoal.done
              ? t('dashboard.goalComplete')
              : goal > 0
                ? t('dashboard.minutesRemaining', {
                    minutes: Math.max(0, goal - minutes).toFixed(1),
                  })
                : t('dashboard.setGoal')}
          </p>
        </section>

        <section
          className="rounded-card border border-border-subtle bg-surface p-4 shadow-card sm:p-6"
          aria-labelledby="account-level-title"
        >
          <h2 id="account-level-title" className="mb-4 font-bold">
            {t('dashboard.accountProgress')}
          </h2>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-muted">{t('dashboard.level')}</span>
            <span className="text-2xl font-extrabold text-learning-strong">
              {user.level}
            </span>
          </div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-muted">
              {t('dashboard.experience')}
            </span>
            <span className="font-mono font-bold">{user.xp} XP</span>
          </div>
          <div className="flex items-center gap-2 rounded-control bg-warning-soft p-3 text-sm font-bold text-streak-text">
            <FlameIcon size={18} />
            <span>{t('dashboard.dayStreak', { days: data.streak })}</span>
          </div>
        </section>

        <button
          type="button"
          onClick={() => onNavigate('progress')}
          className="flex min-h-12 items-center justify-center rounded-full border-2 border-border-control bg-surface px-5 font-bold text-ink transition hover:border-learning-accent hover:bg-learning-soft"
        >
          {t('dashboard.viewProgress')}
        </button>
      </aside>
    </div>
  );
}
