// Existing certificate fixture; responsive card actions use the shared shell without overflow.
import { ShieldIcon } from '../../components/ui/Icons.jsx';

export function CertificatesView({ onVerifyClick }) {

  const certificates = [
    {
      id: 'cert-1',
      code: 'TF-2026-X98B',
      title: 'Intermediate Typing Proficiency',
      issueDate: 'October 14, 2026',
      duration: '3 Minutes',
      netWpm: 52,
      rawAccuracy: '97.2%',
      status: 'Valid',
    },
  ];

  return (
    <div className="max-w-220 my-0 mx-auto">
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="font-display rtl:font-arabic text-[32px] leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px] mb-1">
            My Certificates
          </h1>
          <p className="text-[16px] leading-[26px] font-normal text-muted">
            Unproctored TypeFlow performance certificates earned from qualifying tests.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="bg-surface rounded-card shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] flex min-w-0 flex-col items-stretch justify-between gap-5 p-4 border border-border-control sm:p-6 lg:flex-row lg:items-center"
          >
            <div className="flex min-w-0 items-start gap-3 sm:gap-5">
              <div
                className="w-13 h-13 shrink-0 rounded-2xl bg-success-soft text-success-text flex items-center justify-center"
              >
                <ShieldIcon size={28} />
              </div>

              <div className="min-w-0 wrap-anywhere">
                <div className="font-extrabold text-[18px] mb-1">{cert.title}</div>
                <div className="text-[13px] text-muted">
                  Issued {cert.issueDate} • Code:{' '}
                  <span className="[direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! font-bold text-ink">
                    {cert.code}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 mt-2 text-[13px]">
                  <span>Net Speed: <strong className="[direction:ltr]! text-left! [unicode-bidi:isolate] font-mono!">{cert.netWpm} WPM</strong></span>
                  <span>Raw Accuracy: <strong className="[direction:ltr]! text-left! [unicode-bidi:isolate] font-mono!">{cert.rawAccuracy}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => alert(`Downloading PDF for ${cert.code}...`)}
                className="inline-flex items-center justify-center gap-2 font-body rtl:font-arabic font-bold text-ink bg-surface border-2 border-border-control rounded-full cursor-pointer no-underline [transition:background-color_var(--motion-fast),_border-color_var(--motion-fast)] enabled:hover:bg-subtle enabled:hover:border-ink disabled:border-border-subtle disabled:text-disabled-text disabled:cursor-not-allowed h-10 text-[14px] py-0 px-4"
              >
                Download PDF
              </button>
              <button
                type="button"
                onClick={() => onVerifyClick(cert.code)}
                className="inline-flex items-center justify-center gap-2 font-body rtl:font-arabic font-bold text-action-foreground bg-action-primary border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:active:bg-action-pressed enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none h-10 text-[14px] py-0 px-4.5"
              >
                Verify Link
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
