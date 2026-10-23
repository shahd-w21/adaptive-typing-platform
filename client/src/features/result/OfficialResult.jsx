// Render saved server results or explicitly labelled fixtures; never calculate rewards here.
import { useTranslation } from '../../i18n/useTranslation.js';
import { formatMetricNumber } from '../../lib/formatMetricNumber.js';
import {
  TrophyIcon,
  FlameIcon,
  ArrowRightIcon,
  CheckIcon,
  RotateCcwIcon,
} from '../../components/ui/Icons.jsx';

export function OfficialResult({
  result,
  isOfficial = false,
  isRecovered = false,
  busy = false,
  onContinue,
  onRetry,
}) {
  const { t, isRTL } = useTranslation();
  const metrics = result.metrics ?? result;

  /** Format a display value/unit without turning absent evidence into zero. */
  function formatMetric(value, suffix = '') {
    const formatted = formatMetricNumber(value);
    if (formatted === null) {
      return t('dashboard.unavailable');
    }
    return `${formatted}${suffix}`;
  }

  return (
    <div className="max-w-210 my-0 mx-auto py-8 px-4">
      {/* Heading */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-success-soft text-success-text text-[14px] font-bold mb-3">
          <CheckIcon size={16} />
          <span>
            {isRecovered
              ? t('results.savedResultFetched')
              : isOfficial
              ? t('results.officialResult')
              : t('results.developmentSample')}
          </span>
        </div>
        <h1 className="font-display rtl:font-arabic text-[32px] leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px]">
          {t('results.sessionCompleted')}
        </h1>
        <p className="text-[16px] leading-[26px] font-normal text-muted mt-1.5">
          {isOfficial
            ? t(
                isRecovered
                  ? 'results.recoveredDescription'
                  : 'results.officialDescription',
              )
            : t('results.fixtureDescription')}
        </p>
      </div>

      {/* Show only the metrics supplied by the saved result. */}
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(170px,_1fr))] gap-4 mb-8">
        {/* Net WPM */}
        <div className="bg-surface border border-border-subtle rounded-card shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] text-center p-5">
          <div className="text-[14px] leading-[22px] text-muted mb-1.5 font-bold">
            {t('typing.netWpm')}
          </div>
          <div className="text-[32px] leading-[40px] font-bold [font-variant-numeric:tabular-nums] text-learning-strong">
            {formatMetric(metrics.netWpm)}
          </div>
        </div>

        {/* Gross WPM */}
        <div className="bg-surface border border-border-subtle rounded-card shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] text-center p-5">
          <div className="text-[14px] leading-[22px] text-muted mb-1.5 font-bold">
            {t('typing.grossWpm')}
          </div>
          <div className="text-[32px] leading-[40px] font-bold [font-variant-numeric:tabular-nums]">
            {formatMetric(metrics.grossWpm)}
          </div>
        </div>

        {/* Raw Accuracy */}
        <div className="bg-surface border border-border-subtle rounded-card shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] text-center p-5">
          <div className="text-[14px] leading-[22px] text-muted mb-1.5 font-bold">
            {t('typing.rawAccuracy')}
          </div>
          <div
            className={[
              'text-[32px] leading-[40px] font-bold [font-variant-numeric:tabular-nums]',
              metrics.rawAccuracy !== null && metrics.rawAccuracy >= 95
                ? 'text-success-text'
                : 'text-warning-text',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {formatMetric(metrics.rawAccuracy, '%')}
          </div>
        </div>

        {/* Final Accuracy */}
        <div className="bg-surface border border-border-subtle rounded-card shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] text-center p-5">
          <div className="text-[14px] leading-[22px] text-muted mb-1.5 font-bold">
            {t('typing.finalAccuracy')}
          </div>
          <div className="text-[32px] leading-[40px] font-bold [font-variant-numeric:tabular-nums]">
            {formatMetric(metrics.finalAccuracy, '%')}
          </div>
        </div>
      </div>

      {/* Explanatory Context Note for Metrics */}
      <div className="border border-border-subtle rounded-card shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] bg-subtle mb-7 py-4 px-5 text-[13px] leading-[20px] text-muted">
        <p>
          <strong>{t('typing.rawAccuracy')}:</strong> {t('results.rawAccuracyHelp')}
        </p>
        <p className="mt-1">
          <strong>{t('typing.finalAccuracy')}:</strong> {t('results.finalAccuracyHelp')}
        </p>
      </div>

      {isOfficial && result.rewards.length > 0 && (
        <div className="mb-8">
          <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3 text-reward-text">
              <TrophyIcon size={20} />
              <span className="font-bold text-[15px]">
                {t('results.rewardsEarned')}
              </span>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 py-2 px-3.5 rounded-full bg-reward-soft text-reward-text font-bold text-[15px]">
                <span>⭐</span>
                <span>{t('results.xpEarned', { count: result.xpEarned })}</span>
              </div>

              <div className="flex items-center gap-2 py-2 px-3.5 rounded-full bg-warning-soft text-streak-text font-bold text-[15px]">
                <FlameIcon size={18} />
                <span>
                  {t('results.streakMaintained', { days: result.streak })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isOfficial && (
        (result.masteredKeys.length > 0 ||
          result.unlockedKeys.length > 0 ||
          result.problemKeys.length > 0) && (
          <section className="mb-8 rounded-card border border-border-subtle bg-surface p-6 shadow-card">
            <h2 className="mb-3 font-bold text-[15px] text-learning-strong">
              {t('results.keyEvidence')}
            </h2>
            {result.masteredKeys.length > 0 && (
              <p className="mb-2">
                <strong>{t('results.masteredKeys')}: </strong>
                {result.masteredKeys.map((key) => (
                  <bdi key={key} dir="ltr" className="mr-2">
                    {key}
                  </bdi>
                ))}
              </p>
            )}
            {result.unlockedKeys.length > 0 && (
              <p className="mb-2">
                <strong>{t('results.unlockedKeys')}: </strong>
                {result.unlockedKeys.map((key) => (
                  <bdi key={key} dir="ltr" className="mr-2">
                    {key}
                  </bdi>
                ))}
              </p>
            )}
            {result.problemKeys.length > 0 && (
              <ul className="space-y-1 text-sm text-muted">
                {result.problemKeys.map((item) => (
                  <li key={item.key}>
                    <bdi dir="ltr" className="font-bold text-ink">
                      {item.key}
                    </bdi>
                    {': '}
                    {t('results.keyErrors', {
                      errors: item.errors,
                      attempts: item.attempts,
                    })}
                    {item.avgMs !== null && (
                      <>
                        {' · '}
                        {t('results.averageKeyTime', {
                          milliseconds: formatMetric(item.avgMs),
                        })}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={onRetry}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 font-body rtl:font-arabic text-[16px] font-bold text-ink bg-surface border-2 border-border-control rounded-full cursor-pointer no-underline [transition:background-color_var(--motion-fast),_border-color_var(--motion-fast)] enabled:hover:bg-subtle enabled:hover:border-ink disabled:border-border-subtle disabled:text-disabled-text disabled:cursor-not-allowed h-12 py-0 px-6"
        >
          <RotateCcwIcon size={18} />
          <span>{t('sessionFlow.practiceAgain')}</span>
        </button>

        <button
          type="button"
          onClick={onContinue}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 font-body rtl:font-arabic text-[16px] font-bold text-action-foreground bg-action-primary border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none h-12 py-0 px-8"
        >
          <span>{t('sessionFlow.returnToDashboard')}</span>
          <ArrowRightIcon
            size={18}
            className={[isRTL ? 'rotate-180' : 'transform-none']
              .filter(Boolean)
              .join(' ')}
          />
        </button>
      </div>
    </div>
  );
}
