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
  xpEarned,
  streakDays,
  reason,
  assignedText = '',
  typedText = '',
  isOfficial = true,
  busy = false,
  onContinue,
  onRetry,
  onViewProgress,
}) {
  const { t, isRTL } = useTranslation();
  const expectedCharacters = Array.from(assignedText);
  const typedCharacters = Array.from(typedText);

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
            {isOfficial
              ? t('results.officialResult')
              : t('results.developmentSampleLabel')}
          </span>
        </div>
        <h1 className="font-display rtl:font-arabic text-[32px] leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px]">
          {t('results.completedTitle')}
        </h1>
        <p className="text-[16px] leading-[26px] font-normal text-muted mt-1.5">
          {isOfficial
            ? t('results.officialDescription')
            : t('results.developmentSampleDescription')}
        </p>
      </div>

      {/* 4 Distinct Metrics Row */}
      <div className="mb-8 grid grid-cols-2 overflow-hidden rounded-card border border-border-subtle bg-surface sm:grid-cols-4">
        {/* Net WPM */}
        <div className="border-e border-b border-border-subtle p-4 text-center sm:border-b-0 sm:p-5">
          <div className="text-[14px] leading-[22px] text-muted mb-1.5 font-bold">
            {t('typing.netWpm')}
          </div>
          <div className="text-[32px] leading-[40px] font-bold [font-variant-numeric:tabular-nums] text-learning-strong">
            {formatMetric(result.netWpm)}
          </div>
        </div>

        {/* Gross WPM */}
        <div className="border-b border-border-subtle p-4 text-center sm:border-e sm:border-b-0 sm:p-5">
          <div className="text-[14px] leading-[22px] text-muted mb-1.5 font-bold">
            {t('typing.grossWpm')}
          </div>
          <div className="text-[32px] leading-[40px] font-bold [font-variant-numeric:tabular-nums]">
            {formatMetric(result.grossWpm)}
          </div>
        </div>

        {/* Raw Accuracy */}
        <div className="border-e border-border-subtle p-4 text-center sm:p-5">
          <div className="text-[14px] leading-[22px] text-muted mb-1.5 font-bold">
            {t('typing.rawAccuracy')}
          </div>
          <div
            className={[
              'text-[32px] leading-[40px] font-bold [font-variant-numeric:tabular-nums]',
              result.rawAccuracy == null ? 'text-muted' : 'text-learning-strong',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {formatMetric(result.rawAccuracy, '%')}
          </div>
        </div>

        {/* Final Accuracy */}
        <div className="p-4 text-center sm:p-5">
          <div className="text-[14px] leading-[22px] text-muted mb-1.5 font-bold">
            {t('typing.finalAccuracy')}
          </div>
          <div className="text-[32px] leading-[40px] font-bold [font-variant-numeric:tabular-nums]">
            {formatMetric(result.finalAccuracy, '%')}
          </div>
        </div>
      </div>

      {/* Explanatory Context Note for Metrics */}
      <div className="border border-border-subtle rounded-card shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] bg-subtle mb-7 py-4 px-5 text-[13px] leading-[20px] text-muted">
        <p>
          <strong>{t('typing.rawAccuracy')}:</strong>{' '}
          {t('results.rawAccuracyHelp')}
        </p>
        <p className="mt-1">
          <strong>{t('typing.finalAccuracy')}:</strong>{' '}
          {t('results.finalAccuracyHelp')}
        </p>
      </div>

      {(expectedCharacters.length > 0 || typedCharacters.length > 0) && (
        <section
          className="mb-7 rounded-card border border-border-subtle bg-surface p-5 sm:p-6"
          aria-labelledby="session-evidence-title"
        >
          <h2
            id="session-evidence-title"
            className="mb-3 font-display text-xl font-bold"
          >
            {t('results.sessionEvidence')}
          </h2>
          <p className="mb-4 text-sm text-muted">
            {t('results.sessionEvidenceHelp')}
          </p>
          <p
            className="wrap-anywhere rounded-control bg-page p-4 font-mono text-lg leading-9 [font-variant-ligatures:none]"
            lang="en"
            dir="ltr"
            aria-label={t('results.sessionEvidence')}
          >
            {expectedCharacters.map((expected, index) => {
              const entered = typedCharacters[index];
              if (entered === undefined) {
                return (
                  <span key={index} className="text-muted">
                    {expected === ' ' ? ' ' : expected}
                  </span>
                );
              }
              const isMistake = entered !== expected;
              return (
                <span
                  key={index}
                  className={isMistake
                    ? 'rounded-sm bg-error-soft text-error-text underline decoration-double decoration-2 underline-offset-4'
                    : 'text-ink'}
                  aria-label={isMistake
                    ? t('results.typedInsteadOf', {
                        typed:
                          entered === ' ' ? t('typing.spaceKey') : entered,
                        expected:
                          expected === ' ' ? t('typing.spaceKey') : expected,
                      })
                    : undefined}
                >
                  {entered === ' ' && isMistake ? '␣' : entered}
                </span>
              );
            })}
          </p>
        </section>
      )}

      {/* Confirmed rewards and the evidence-based next step follow the session evidence. */}
      {isOfficial && (
        <div className="mb-8 flex flex-col gap-5">
          {/* Rewards Earned Card */}
          {(Number.isFinite(xpEarned) ||
            Number.isFinite(streakDays) ||
            reason) && (
            <div className="rounded-card border border-border-subtle bg-surface p-5 sm:p-6">
              {(Number.isFinite(xpEarned) ||
                Number.isFinite(streakDays)) && (
                <>
                  <div className="flex items-center gap-2 mb-3 text-reward-text">
                    <TrophyIcon size={20} />
                    <span className="font-bold text-[15px]">
                      {t('results.rewardsEarned')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center">
                    {Number.isFinite(xpEarned) && (
                      <div className="flex items-center gap-2 py-2 px-3.5 rounded-full bg-reward-soft text-reward-text font-bold text-[15px]">
                        <span aria-hidden="true">⭐</span>
                        <span>{t('results.xpEarned', { count: xpEarned })}</span>
                      </div>
                    )}
                    {Number.isFinite(streakDays) && (
                      <div className="flex items-center gap-2 py-2 px-3.5 rounded-full bg-warning-soft text-streak-text font-bold text-[15px]">
                        <FlameIcon size={18} />
                        <span>
                          {t('results.streakMaintained', { days: streakDays })}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
              {reason && (
                <div className="mt-4 rounded-control bg-subtle p-4">
                  <div className="mb-2 font-bold text-[15px]">
                    {t('results.whyPractice')}
                  </div>
                  <p className="text-[14px] leading-[22px] text-muted">
                    {reason}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 font-body rtl:font-arabic text-[16px] font-bold text-ink bg-surface border-2 border-border-control rounded-full cursor-pointer no-underline [transition:background-color_var(--motion-fast),_border-color_var(--motion-fast)] enabled:hover:bg-subtle enabled:hover:border-ink disabled:border-border-subtle disabled:text-disabled-text disabled:cursor-not-allowed h-12 py-0 px-6"
        >
          <RotateCcwIcon size={18} />
          <span>{t('sessionFlow.practiceAgain')}</span>
        </button>

        {onViewProgress && (
          <button
            type="button"
            onClick={onViewProgress}
            disabled={busy}
            className="inline-flex min-h-12 items-center justify-center rounded-control border border-border-control bg-surface px-6 font-bold text-ink hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t('results.viewProgress')}
          </button>
        )}

        <button
          type="button"
          onClick={onContinue}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 font-body rtl:font-arabic text-[16px] font-bold text-action-foreground bg-action-primary border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:active:bg-action-pressed enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none h-12 py-0 px-8"
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
