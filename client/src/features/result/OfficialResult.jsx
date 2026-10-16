import { useTranslation } from '../../i18n/useTranslation.js';
import { TrophyIcon, FlameIcon, ArrowRightIcon, CheckIcon, RotateCcwIcon } from '../../components/ui/Icons.jsx';

export function OfficialResult({
  result = {
    netWpm: 48,
    grossWpm: 52,
    rawAccuracy: 96.4,
    finalAccuracy: 100,
    durationMs: 45000,
  },
  xpEarned = 75,
  streakDays = 5,
  reason = 'Great consistency! Your next activity focuses on strengthening right-hand pinky reach for P and semicolon.',
  onContinue,
  onRetry,
}) {
  const { t, isRTL } = useTranslation();

  return (
    <div
      className="max-w-210 my-0 mx-auto py-8 px-4"
    >
      {/* Heading */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-success-soft text-success-text text-[14px] font-bold mb-3"
        >
          <CheckIcon size={16} />
          <span>{t('results.officialResult')}</span>
        </div>
        <h1 className="font-display rtl:font-arabic text-[32px] leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px]">Session Completed!</h1>
        <p className="text-[16px] leading-[26px] font-normal text-muted mt-1.5">
          Official server-verified performance metrics
        </p>
      </div>

      {/* 4 Distinct Metrics Row */}
      <div
        className="grid grid-cols-[repeat(auto-fit,_minmax(170px,_1fr))] gap-4 mb-8"
      >
        {/* Net WPM */}
        <div className="bg-surface border border-border-subtle rounded-card shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] text-center p-5">
          <div className="text-[14px] leading-[22px] text-muted mb-1.5 font-bold">
            {t('typing.netWpm')}
          </div>
          <div className="text-[32px] leading-[40px] font-bold [font-variant-numeric:tabular-nums] text-learning-strong">
            {result.netWpm}
          </div>
          <div className="text-[12px] text-muted mt-1">
            words / min
          </div>
        </div>

        {/* Gross WPM */}
        <div className="bg-surface border border-border-subtle rounded-card shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] text-center p-5">
          <div className="text-[14px] leading-[22px] text-muted mb-1.5 font-bold">
            {t('typing.grossWpm')}
          </div>
          <div className="text-[32px] leading-[40px] font-bold [font-variant-numeric:tabular-nums]">{result.grossWpm}</div>
          <div className="text-[12px] text-muted mt-1">
            raw speed
          </div>
        </div>

        {/* Raw Accuracy */}
        <div className="bg-surface border border-border-subtle rounded-card shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] text-center p-5">
          <div className="text-[14px] leading-[22px] text-muted mb-1.5 font-bold">
            {t('typing.rawAccuracy')}
          </div>
          <div
            className={[
              "text-[32px] leading-[40px] font-bold [font-variant-numeric:tabular-nums]",
              result.rawAccuracy >= 95 ? 'text-success-text' : 'text-warning-text',
            ].filter(Boolean).join(' ')}
          >
            {result.rawAccuracy}%
          </div>
          <div className="text-[12px] text-muted mt-1">
            accuracy gate
          </div>
        </div>

        {/* Final Accuracy */}
        <div className="bg-surface border border-border-subtle rounded-card shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] text-center p-5">
          <div className="text-[14px] leading-[22px] text-muted mb-1.5 font-bold">
            {t('typing.finalAccuracy')}
          </div>
          <div className="text-[32px] leading-[40px] font-bold [font-variant-numeric:tabular-nums]">{result.finalAccuracy}%</div>
          <div className="text-[12px] text-muted mt-1">
            final buffer
          </div>
        </div>
      </div>

      {/* Explanatory Context Note for Metrics */}
      <div
        className="border border-border-subtle rounded-card shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] bg-subtle mb-7 py-4 px-5 text-[13px] leading-[20px] text-muted"
      >
        <p><strong>Raw Accuracy:</strong> {t('results.rawAccuracyHelp')}</p>
        <p className="mt-1"><strong>Final Accuracy:</strong> {t('results.finalAccuracyHelp')}</p>
      </div>

      {/* Rewards & Next Steps Grid */}
      <div className="grid grid-cols-[1fr_1fr] gap-5 mb-8">
        {/* Rewards Earned Card */}
        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3 text-reward-text">
            <TrophyIcon size={20} />
            <span className="font-bold text-[15px]">{t('results.rewardsEarned')}</span>
          </div>
          <div className="flex gap-4 items-center">
            <div
              className="flex items-center gap-2 py-2 px-3.5 rounded-full bg-reward-soft text-reward-text font-bold text-[15px]"
            >
              <span>⭐</span>
              <span>{t('results.xpEarned', { count: xpEarned })}</span>
            </div>

            <div
              className="flex items-center gap-2 py-2 px-3.5 rounded-full bg-warning-soft text-streak-text font-bold text-[15px]"
            >
              <FlameIcon size={18} />
              <span>{t('results.streakMaintained', { days: streakDays })}</span>
            </div>
          </div>
        </div>

        {/* Why This Practice / Next Activity Card */}
        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
          <div className="font-bold text-[15px] mb-2 text-learning-strong">
            {t('results.whyPractice')}
          </div>
          <p className="font-normal text-[14px] leading-[22px] text-muted">
            {reason}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 font-body rtl:font-arabic text-[16px] font-bold text-ink bg-surface border-2 border-border-control rounded-full cursor-pointer no-underline [transition:background-color_var(--motion-fast),_border-color_var(--motion-fast)] enabled:hover:bg-subtle enabled:hover:border-ink disabled:border-border-subtle disabled:text-disabled-text disabled:cursor-not-allowed h-12 py-0 px-6"
        >
          <RotateCcwIcon size={18} />
          <span>Practise Again</span>
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center justify-center gap-2 font-body rtl:font-arabic text-[16px] font-bold text-action-foreground bg-action-primary border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none h-12 py-0 px-8"
        >
          <span>{t('results.nextStep')}</span>
          <ArrowRightIcon size={18} className={[
                                      isRTL ? 'rotate-180' : 'transform-none',
                                    ].filter(Boolean).join(' ')} />
        </button>
      </div>
    </div>
  );
}
