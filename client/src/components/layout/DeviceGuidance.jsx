import { useTranslation } from '../../i18n/useTranslation.js';
import { MonitorIcon, KeyboardIcon, ArrowLeftIcon } from '../ui/Icons.jsx';

export function DeviceGuidance({ onBack }) {
  const { t, isRTL } = useTranslation();

  return (
    <div
      className="flex flex-col items-center justify-center py-8 px-5 max-w-135 my-10 mx-auto text-center"
    >
      <div
        className="w-18 h-18 rounded-3xl bg-warning-soft text-warning-text flex items-center justify-center mb-5 shadow-card"
      >
        <KeyboardIcon size={36} />
      </div>

      <h2 className="font-display rtl:font-arabic text-[24px] leading-[34px] font-bold mb-3">
        {t('typing.deviceGuidanceTitle')}
      </h2>

      <p className="text-[16px] leading-[26px] font-normal text-muted mb-6 max-w-105">
        {t('typing.deviceGuidanceDesc')}
      </p>

      <div
        className={[
          "border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] w-full mb-6 bg-subtle text-[14px] leading-[22px]",
          isRTL ? 'text-right' : 'text-left',
        ].filter(Boolean).join(' ')}
      >
        <div className="flex items-center gap-2.5 mb-2 font-bold">
          <MonitorIcon size={18} />
          <span>Minimum Requirements:</span>
        </div>
        <ul className="ps-5 m-0 text-muted">
          <li>Desktop or Laptop computer</li>
          <li>Physical English QWERTY keyboard</li>
          <li>Viewport width of at least 1024 CSS pixels</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="justify-center h-12 py-0 px-6 font-body rtl:font-arabic text-[16px] font-bold text-action-foreground bg-action-primary border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
      >
        <ArrowLeftIcon size={18} className={[
                                   isRTL ? 'rotate-180' : 'transform-none',
                                 ].filter(Boolean).join(' ')} />
        <span>Back to Dashboard</span>
      </button>
    </div>
  );
}
