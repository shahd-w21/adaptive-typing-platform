import { ShieldIcon } from '../../components/ui/Icons.jsx';
import { useTranslation } from '../../i18n/useTranslation.js';

export function TestsView() {
  const { t } = useTranslation();

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

          <p role="note" className="mb-5 rounded-control bg-warning-soft p-3 text-sm text-warning-text">
            {t('test.unavailable')}
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
                  disabled
                  className={[
                    "min-h-11 flex-1 rounded-control border-2 font-bold",
                    'border-border-subtle bg-disabled-bg text-disabled-text',
                  ].filter(Boolean).join(' ')}
                >
                  {d} {t(d > 1 ? 'test.minutes' : 'test.minute')}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled
            className="inline-flex min-h-12 w-full items-center justify-center rounded-control bg-disabled-bg px-6 font-bold text-disabled-text"
          >
            <span>{t('test.unavailableAction')}</span>
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

          <p role="note" className="mb-5 rounded-control bg-warning-soft p-3 text-sm text-warning-text">
            {t('test.unavailable')}
          </p>

          <button
            type="button"
            disabled
            className="inline-flex min-h-12 w-full items-center justify-center rounded-control bg-disabled-bg px-6 font-bold text-disabled-text"
          >
            <span>{t('test.unavailableAction')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
