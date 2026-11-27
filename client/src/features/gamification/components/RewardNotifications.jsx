// Accessible, deduplicated official reward notifications rendered outside active
// typing. Respects prefers-reduced-motion and the student's reducedPressure setting.
import { useAuth } from '../../../hooks/useAuth.js';
import { useRewards } from '../../../hooks/useRewards.js';
import { useTranslation } from '../../../i18n/useTranslation.js';
import { FlameIcon, TrophyIcon, XIcon } from '../../../components/ui/Icons.jsx';

export function RewardNotifications() {
  const { notifications, dismissNotification, clearNotifications } =
    useRewards();
  const { user } = useAuth();
  const { t } = useTranslation();

  if (notifications.length === 0) {
    return null;
  }

  const reducedMotion = Boolean(user?.reducedPressure);

  const labelFor = (event) => {
    if (event.type === 'xp') {
      return t('achievements.notifyXp', { count: event.amount ?? 0 });
    }
    if (event.type === 'level') {
      return t('achievements.notifyLevel', { level: event.level ?? 1 });
    }
    if (event.type === 'streak') {
      return t('achievements.notifyStreak', { days: event.streak ?? 0 });
    }
    if (event.type === 'goal') {
      return t('achievements.notifyGoal');
    }
    if (event.type === 'badge') {
      return t('achievements.notifyBadge', { title: event.badgeTitle ?? '' });
    }
    return '';
  };

  return (
    <section
      aria-label={t('achievements.notificationsLabel')}
      aria-live="polite"
      className="mx-auto mb-6 max-w-6xl rounded-card border border-reward-accent/40 bg-reward-soft p-4 text-reward-text shadow-card"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-bold">
          <TrophyIcon size={18} />
          <span>{t('achievements.notificationsTitle')}</span>
        </div>
        {notifications.length > 1 && (
          <button
            type="button"
            onClick={clearNotifications}
            className="min-h-11 rounded-control border border-border-control bg-surface px-3 py-1.5 text-xs font-bold text-ink hover:bg-subtle"
          >
            {t('achievements.dismissAll')}
          </button>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {notifications.map((event) => (
          <li
            key={event.id}
            className={[
              'flex items-center justify-between gap-3 rounded-control border border-border-subtle bg-surface px-3.5 py-2 text-sm text-ink',
              reducedMotion
                ? 'transition-none'
                : 'transition-opacity duration-200 motion-reduce:transition-none',
            ].join(' ')}
          >
            <div className="flex min-w-0 items-center gap-2 font-semibold">
              {event.type === 'streak' ? (
                <FlameIcon size={16} className="shrink-0 text-streak-text" />
              ) : (
                <TrophyIcon size={16} className="shrink-0 text-reward-text" />
              )}
              <span className="wrap-anywhere">{labelFor(event)}</span>
            </div>
            <button
              type="button"
              onClick={() => dismissNotification(event.id)}
              aria-label={t('achievements.dismissNotification')}
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-control border border-transparent text-muted hover:border-border-control hover:bg-subtle hover:text-ink"
            >
              <XIcon size={16} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
