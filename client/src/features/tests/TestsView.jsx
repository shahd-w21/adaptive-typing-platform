import { useState } from 'react';
import { PlayIcon, ShieldIcon } from '../../components/ui/Icons.jsx';
import { useTranslation } from '../../i18n/useTranslation.js';

export function TestsView({ onStartTimed, onStartCertified }) {
  const { t } = useTranslation();
  const [selectedDuration, setSelectedDuration] = useState(3);
  const [consentName, setConsentName] = useState(true);

  return (
    <div className="max-w-220 my-0 mx-auto">
      <h1 className="font-display rtl:font-arabic text-[32px] leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px] mb-2">
        {t('test.title')}
      </h1>
      <p className="text-[16px] leading-[26px] font-normal text-muted mb-8">
        {t('test.description')}
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,_minmax(min(100%,_340px),_1fr))] gap-6">
        {/* Timed Test Card */}
        <div className="bg-surface border border-border-subtle rounded-card p-4 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] sm:p-6">
          <div className="text-[28px] mb-3">⏱️</div>
          <h2 className="font-display rtl:font-arabic leading-[34px] font-bold text-[20px] mb-2">
            {t('test.timedTitle')}
          </h2>
          <p className="text-[14px] text-muted mb-5">
            {t('test.timedDescription')}
          </p>

          <div className="mb-6">
            <span className="text-[13px] font-bold block mb-2">
              {t('test.duration')}
            </span>
            <div className="flex gap-2.5">
              {[1, 3, 5].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDuration(d)}
                  className={[
                    "flex-1 h-10 rounded-control border-2 font-bold cursor-pointer",
                    selectedDuration === d ? 'border-learning-accent bg-learning-soft text-learning-strong' : 'border-border-subtle bg-surface text-ink',
                  ].filter(Boolean).join(' ')}
                >
                  {d} {t(d > 1 ? 'test.minutes' : 'test.minute')}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onStartTimed(selectedDuration)}
            className="inline-flex items-center justify-center gap-2 py-0 px-6 font-body rtl:font-arabic text-[16px] font-bold text-action-foreground bg-action-primary border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none w-full h-12"
          >
            <PlayIcon size={18} />
            <span>{t('test.startTimed', { duration: selectedDuration })}</span>
          </button>
        </div>

        {/* Certified Test Card */}
        <div
          className="rounded-card border-2 border-learning-accent bg-surface p-4 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] sm:p-6"
        >
          <div className="text-learning-strong mb-3">
            <ShieldIcon size={32} />
          </div>
          <h2 className="font-display rtl:font-arabic leading-[34px] font-bold text-[20px] mb-2">
            {t('test.certifiedTitle')}
          </h2>
          <p className="text-[14px] text-muted mb-4">
            {t('test.certifiedDescription')}
          </p>

          <div
            className="p-3.5 rounded-control bg-subtle text-[13px] text-muted mb-5"
          >
            <div className="font-bold text-ink mb-1">
              {t('test.thresholds')}
            </div>
            <div>• {t('test.minimumNet')}</div>
            <div>• {t('test.minimumAccuracy')}</div>
            <div>• {t('test.strictDuration')}</div>
          </div>

          <label className="flex items-center gap-2 text-[13px] mb-5 cursor-pointer">
            <input
              type="checkbox"
              checked={consentName}
              onChange={(e) => setConsentName(e.target.checked)}
            />
            <span>{t('test.consent')}</span>
          </label>

          <button
            type="button"
            onClick={onStartCertified}
            className="inline-flex items-center justify-center gap-2 py-0 px-6 font-body rtl:font-arabic text-[16px] font-bold text-action-foreground border-0 rounded-full cursor-pointer no-underline [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none w-full h-12 bg-learning-accent shadow-node"
          >
            <span>{t('test.beginCertified')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
