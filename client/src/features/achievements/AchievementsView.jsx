// Show server-owned reward totals without inventing badge criteria or progress thresholds.
import { ErrorMessage } from '../../components/ErrorMessage.jsx';
import { Loading } from '../../components/Loading.jsx';
import { useTranslation } from '../../i18n/useTranslation.js';
import { useGamification } from '../gamification/hooks/useGamification.js';

export function AchievementsView() {
  const { t } = useTranslation();
  const rewards = useGamification();

  if (rewards.isPending) {
    return <Loading message={t('achievements.loading')} />;
  }

  if (rewards.isError) {
    return (
      <div className="mx-auto w-full max-w-240">
        <h1 className="mb-2 font-display text-2xl font-bold text-ink">
          {t('achievements.title')}
        </h1>
        <ErrorMessage
          title={t('achievements.errorTitle')}
          message={t('achievements.errorDescription')}
          onRetry={() => rewards.refetch()}
          retrying={rewards.isFetching}
        />
      </div>
    );
  }

  const metrics = [
    { key: 'level', label: t('dashboard.level'), value: rewards.data?.level },
    { key: 'xp', label: t('dashboard.experience'), value: rewards.data?.xp },
    { key: 'streak', label: t('achievements.streak'), value: rewards.data?.streak },
  ];

  return (
    <div className="mx-auto w-full max-w-240">
      <header className="mb-7">
        <h1 className="mb-2 font-display text-[32px] leading-[44px] font-bold text-ink max-md:text-[24px] max-md:leading-[32px]">
          {t('achievements.title')}
        </h1>
        <p className="text-base leading-[26px] text-muted">
          {t('achievements.description')}
        </p>
      </header>

      <section
        aria-label={t('achievements.accountProgress')}
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {metrics.map(metric => (
          <div
            key={metric.key}
            className="min-w-0 border-b border-border-subtle py-4 sm:px-4"
          >
            <h2 className="mb-2 text-sm font-bold text-muted">{metric.label}</h2>
            <p className="font-display text-[28px] leading-9 font-bold text-learning-strong [overflow-wrap:anywhere]">
              {Number.isFinite(metric.value)
                ? metric.value.toLocaleString()
                : t('dashboard.unavailable')}
              {metric.key === 'xp' && Number.isFinite(metric.value) ? ' XP' : ''}
            </p>
          </div>
        ))}
      </section>

      <section
        aria-labelledby="achievement-badges-title"
        className="border-t border-border-subtle pt-6"
      >
        <h2
          id="achievement-badges-title"
          className="mb-2 font-display text-xl font-bold text-ink"
        >
          {t('achievements.badgesTitle')}
        </h2>
        <p className="text-muted" role="status">
          {t('achievements.badgesUnavailable')}
        </p>
      </section>
    </div>
  );
}
