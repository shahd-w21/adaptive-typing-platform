// The server does not expose an owned certificate list yet; never display sample credentials as real.
import { useTranslation } from '../../i18n/useTranslation.js';
import { ShieldIcon } from '../../components/ui/Icons.jsx';

export function CertificatesView({ onVerifyClick }) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-220">
      <header className="mb-7">
        <h1 className="mb-2 font-display text-[32px] leading-[44px] font-bold text-ink max-md:text-[24px] max-md:leading-[32px]">
          {t('certificates.title')}
        </h1>
        <p className="text-base leading-[26px] text-muted">
          {t('certificates.description')}
        </p>
      </header>

      <section
        aria-labelledby="certificates-unavailable-title"
        className="flex flex-col items-start gap-4 border-y border-border-subtle py-8"
        role="status"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-subtle text-muted">
          <ShieldIcon size={24} aria-hidden="true" />
        </div>
        <div>
          <h2
            id="certificates-unavailable-title"
            className="mb-2 font-display text-xl font-bold text-ink"
          >
            {t('certificates.unavailableTitle')}
          </h2>
          <p className="max-w-prose text-muted">
            {t('certificates.unavailableDescription')}
          </p>
        </div>
        <button
          type="button"
          onClick={onVerifyClick}
          className="inline-flex min-h-11 items-center justify-center rounded-control bg-action-primary px-5 py-2 font-bold text-action-foreground hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text"
          disabled={!onVerifyClick}
        >
          {t('certificates.verifyAction')}
        </button>
      </section>
    </div>
  );
}
