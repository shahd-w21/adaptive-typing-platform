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
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 className="text-heading-page" style={{ marginBottom: '4px' }}>
            My Certificates
          </h1>
          <p className="text-body-default" style={{ color: 'var(--color-text-secondary)' }}>
            Unproctored TypeFlow performance certificates earned from qualifying tests.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="surface-card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px',
              border: '1px solid var(--color-border-control)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--color-success-soft)',
                  color: 'var(--color-success-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldIcon size={28} />
              </div>

              <div>
                <div style={{ fontWeight: 800, fontSize: '18px', marginBottom: '4px' }}>{cert.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Issued {cert.issueDate} • Code:{' '}
                  <span className="english-island" style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {cert.code}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '13px' }}>
                  <span>Net Speed: <strong className="english-island">{cert.netWpm} WPM</strong></span>
                  <span>Raw Accuracy: <strong className="english-island">{cert.rawAccuracy}</strong></span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => alert(`Downloading PDF for ${cert.code}...`)}
                className="btn-secondary"
                style={{ height: '40px', fontSize: '14px', padding: '0 16px' }}
              >
                Download PDF
              </button>
              <button
                type="button"
                onClick={() => onVerifyClick(cert.code)}
                className="btn-primary"
                style={{ height: '40px', fontSize: '14px', padding: '0 18px' }}
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
