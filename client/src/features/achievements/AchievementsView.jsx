// Achievements & Milestones view: renders real server-owned XP, level,
// daily goal (in minutes), streak (with timezone context), and explicit
// unavailable state when server badge policy is not yet implemented.
import { useAuth } from '../../hooks/useAuth.js';
import { useTranslation } from '../../i18n/useTranslation.js';
import { Loading } from '../../components/Loading.jsx';
import { ErrorMessage } from '../../components/ErrorMessage.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { CheckIcon, FlameIcon, LockIcon, TrophyIcon } from '../../components/ui/Icons.jsx';
import { formatMetricNumber } from '../../lib/formatMetricNumber.js';
import {
  computeDailyGoalProgress,
  computeLevelProgress,
  useGamification,
} from '../gamification/hooks/useGamification.js';

export function AchievementsView() {
  const { t, locale } = useTranslation();
  const { user } = useAuth();
  const gamificationQuery = useGamification(true);
  const { data, isPending, isError, error, isFetching, refetch } =
    gamificationQuery;

  if (isPending) {
    return <Loading labelKey="achievements.loading" />;
  }

  if (isError && !data) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 font-display text-3xl font-bold">
          {t('achievements.title')}
        </h1>
        <ErrorMessage
          error={error}
          title={t('achievements.errorTitle')}
          message={t('achievements.errorDescription')}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      </div>
    );
  }

  const levelProgress = computeLevelProgress(
    data.xp,
    data.level,
    data.xpPerLevel,
  );
  const goalProgress = computeDailyGoalProgress(data.dailyGoal);
  const timezone = data.timezone || user?.timezone || null;
  const hasBadges = Array.isArray(data.badges);
  const minutesTodayLabel = formatMetricNumber(goalProgress.minutesToday) ?? '0';
  const goalMinutesLabel = formatMetricNumber(goalProgress.goalMinutes) ?? '0';
  const remainingMinutesLabel =
    formatMetricNumber(goalProgress.remainingMinutes) ?? '0';

  const formatEarnedDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? null
      : new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-7">
      {isError && (
        <div>
          <p role="status" className="mb-2 text-sm text-muted">
            {t('achievements.refreshFailed')}
          </p>
          <ErrorMessage
            error={error}
            onRetry={() => refetch()}
            retrying={isFetching}
          />
        </div>
      )}

      <header>
        <h1 className="mb-1.5 font-display text-[32px] font-bold leading-[44px] max-md:text-[24px] max-md:leading-[32px]">
          {t('achievements.title')}
        </h1>
        <p className="text-muted">{t('achievements.description')}</p>
      </header>

      {/* Level & XP Progress Card */}
      <section
        aria-labelledby="level-progress-heading"
        className="rounded-card border border-border-subtle bg-surface p-7 shadow-card"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-reward-text">
              {t('achievements.currentRank')}
            </span>
            <h2
              id="level-progress-heading"
              className="font-display text-[28px] font-bold leading-tight max-md:text-2xl"
            >
              {t('achievements.levelLabel', { level: levelProgress.level })}
            </h2>
          </div>
          <div className="text-end">
            <div
              dir="ltr"
              className="text-[28px] font-bold leading-tight [font-variant-numeric:tabular-nums] text-learning-strong max-md:text-2xl"
            >
              {levelProgress.xpIntoLevel} / {levelProgress.xpPerLevel} XP
            </div>
            <div className="text-xs text-muted">
              {t('achievements.totalXp', { xp: levelProgress.xp })}
            </div>
          </div>
        </div>

        <div
          role="progressbar"
          aria-valuenow={levelProgress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('achievements.levelProgressLabel')}
          className="h-3 overflow-hidden rounded-md bg-subtle"
        >
          <div
            className="h-full rounded-md bg-reward-accent transition-[width] duration-200 motion-reduce:transition-none"
            style={{ width: `${levelProgress.percent}%` }}
          />
        </div>

        <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted">
          <span>
            {t('achievements.levelLabel', { level: levelProgress.level })}
          </span>
          <span>
            {t('achievements.xpUntilNextLevel', {
              xp: levelProgress.xpToNextLevel,
              nextLevel: levelProgress.nextLevel,
            })}
          </span>
        </div>
        {!data.xpPerLevel && (
          <p className="mt-2 text-xs text-muted">
            {t('achievements.policyXpNote', {
              xpPerLevel: levelProgress.xpPerLevel,
            })}
          </p>
        )}
      </section>

      {/* Daily Goal & Streak Summary */}
      <section
        aria-labelledby="goal-streak-heading"
        className="grid grid-cols-1 gap-5 md:grid-cols-2"
      >
        <div className="rounded-card border border-border-subtle bg-surface p-6 shadow-card">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2
              id="goal-streak-heading"
              className="font-display text-lg font-bold"
            >
              {t('achievements.dailyGoalTitle')}
            </h2>
            <span
              className={[
                'rounded-full px-3 py-1 text-xs font-bold',
                goalProgress.done
                  ? 'bg-success-soft text-success-text'
                  : 'bg-subtle text-muted',
              ].join(' ')}
            >
              {goalProgress.done
                ? t('achievements.goalDone')
                : t('achievements.goalInProgress')}
            </span>
          </div>

          <div
            dir="ltr"
            className="mb-2 text-2xl font-bold [font-variant-numeric:tabular-nums]"
          >
            {minutesTodayLabel} / {goalMinutesLabel} {t('achievements.minutesUnit')}
          </div>

          <div
            role="progressbar"
            aria-valuenow={goalProgress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('achievements.dailyGoalTitle')}
            className="h-2.5 overflow-hidden rounded-md bg-subtle"
          >
            <div
              className="h-full rounded-md bg-success-accent transition-[width] duration-200 motion-reduce:transition-none"
              style={{ width: `${goalProgress.percent}%` }}
            />
          </div>

          <p className="mt-2 text-sm text-muted">
            {goalProgress.done
              ? t('dashboard.goalComplete')
              : t('dashboard.minutesRemaining', {
                  minutes: remainingMinutesLabel,
                })}
          </p>
          <p className="mt-1 text-xs text-muted">
            {timezone
              ? t('achievements.timezoneLabel', { timezone })
              : t('achievements.timezoneUnavailable')}
          </p>
        </div>

        <div className="rounded-card border border-border-subtle bg-surface p-6 shadow-card">
          <div className="mb-2 flex items-center gap-2">
            <FlameIcon size={20} className="text-streak-text" />
            <h2 className="font-display text-lg font-bold">
              {t('achievements.streakTitle')}
            </h2>
          </div>

          <div className="text-2xl font-bold [font-variant-numeric:tabular-nums]">
            {t('achievements.streakDays', { count: data.streak })}
          </div>
          <p className="mt-2 text-sm text-muted">
            {data.streak > 0
              ? t('achievements.streakActiveNote')
              : t('achievements.streakZeroNote')}
          </p>
          <p className="mt-1 text-xs text-muted">
            {timezone
              ? t('achievements.timezoneLabel', { timezone })
              : t('achievements.timezoneUnavailable')}
          </p>
        </div>
      </section>

      {/* Badges Section */}
      <section aria-labelledby="badges-heading">
        <h2
          id="badges-heading"
          className="mb-4 font-display text-xl font-bold"
        >
          {t('achievements.badgesTitle')}
        </h2>

        {!hasBadges ? (
          <EmptyState
            title={t('achievements.badgesUnavailableTitle')}
            description={t('achievements.badgesUnavailableDescription')}
          />
        ) : data.badges.length === 0 ? (
          <EmptyState
            title={t('achievements.badgesEmptyTitle')}
            description={t('achievements.badgesEmptyDescription')}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.badges.map((badge) => {
              const earnedDate = formatEarnedDate(badge.earnedAt);
              return (
                <article
                  key={badge.id}
                  className={[
                    'flex items-start gap-4 rounded-card bg-surface p-5 shadow-card',
                    badge.earned
                      ? 'border-2 border-success-accent'
                      : 'border border-border-subtle opacity-80',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                      badge.earned
                        ? 'bg-success-soft text-success-text'
                        : 'bg-subtle text-muted',
                    ].join(' ')}
                  >
                    {badge.earned ? (
                      <TrophyIcon size={22} />
                    ) : (
                      <LockIcon size={20} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="mb-0.5 flex items-center gap-1.5 font-bold">
                      <span>{badge.title}</span>
                      {badge.earned && (
                        <CheckIcon
                          size={16}
                          className="shrink-0 text-success-text"
                        />
                      )}
                    </div>
                    <p className="mb-1.5 text-sm text-muted">
                      {badge.description}
                    </p>
                    {badge.earned ? (
                      <span className="text-xs font-bold text-success-text">
                        {earnedDate
                          ? t('achievements.earnedOn', { date: earnedDate })
                          : t('achievements.earned')}
                      </span>
                    ) : (
                      <span className="text-xs italic text-muted">
                        {badge.criteria
                          ? t('achievements.criteriaLabel', {
                              criteria: badge.criteria,
                            })
                          : t('achievements.unearned')}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
