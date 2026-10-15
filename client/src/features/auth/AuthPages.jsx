import { useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation.js';
import { ArrowRightIcon, ShieldIcon } from '../../components/ui/Icons.jsx';

export function LandingPage({ onStartLearning, onLogin }) {
  const { isRTL } = useTranslation();

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '64px 20px',
          textAlign: 'center',
          maxWidth: '820px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--color-learning-soft)',
            color: 'var(--color-learning-strong)',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '20px',
          }}
        >
          <span>✨ ADAPTIVE ENGLISH TOUCH TYPING</span>
        </div>

        <h1 className="text-display-lg" style={{ marginBottom: '18px' }}>
          Build speed. Keep accuracy.
        </h1>

        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', maxWidth: '620px', marginInline: 'auto' }}>
          Master English touch typing with real-time weakness detection, spaced review repetition, and unproctored performance certificates.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button
            type="button"
            onClick={onStartLearning}
            className="btn-primary"
            style={{ height: '52px', padding: '0 32px', fontSize: '17px' }}
          >
            <span>Start Learning Free</span>
            <ArrowRightIcon size={18} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
          </button>

          <button
            type="button"
            onClick={onLogin}
            className="btn-secondary"
            style={{ height: '52px', padding: '0 24px', fontSize: '16px' }}
          >
            <span>Sign In</span>
          </button>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '0 20px',
        }}
      >
        <div className="surface-card">
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
          <h2 className="text-heading-card" style={{ marginBottom: '8px' }}>Adaptive Practice</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: '22px' }}>
            Measures your per-key latency and error rates on physical QWERTY keyboards, generating drills tailored specifically to your weak letter pairs.
          </p>
        </div>

        <div className="surface-card">
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛡️</div>
          <h2 className="text-heading-card" style={{ marginBottom: '8px' }}>Strict Raw Accuracy Gate</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: '22px' }}>
            Progression requires a 95% raw accuracy gate. Backspacing corrections do not erase errors from official records, building genuine muscle memory.
          </p>
        </div>

        <div className="surface-card">
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📜</div>
          <h2 className="text-heading-card" style={{ marginBottom: '8px' }}>Verified Certificates</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: '22px' }}>
            Earn unproctored TypeFlow performance certificates with unique verification codes and downloadable PDF credentials.
          </p>
        </div>
      </section>
    </div>
  );
}

export function AuthModal({ mode = 'login', onClose, onSuccess }) {
  const { t } = useTranslation();
  const [isRegister, setIsRegister] = useState(mode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSuccess({ email, name: email.split('@')[0] || 'Learner', role: 'Student' });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--color-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px',
      }}
    >
      <div className="surface-card" style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        <h2 className="text-heading-section" style={{ marginBottom: '8px', textAlign: 'center' }}>
          {isRegister ? 'Create Your Account' : 'Welcome Back'}
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
          {isRegister ? 'Begin your journey to 80+ WPM touch typing' : 'Sign in to sync your progress across devices'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>
              {t('auth.emailLabel')}
            </label>
            <input
              type="email"
              required
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>
              {t('auth.passwordLabel')}
            </label>
            <input
              type="password"
              required
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-primary" style={{ height: '48px', width: '100%', marginTop: '8px' }}>
            <span>{isRegister ? 'Register & Verify' : 'Sign In'}</span>
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-action-link)', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                style={{ background: 'none', border: 'none', color: 'var(--color-action-link)', fontWeight: 700, cursor: 'pointer' }}
              >
                Get Started
              </button>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            insetInlineEnd: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: 'var(--color-text-secondary)',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function PublicCertificateVerification({ onBack }) {
  const [code, setCode] = useState('');
  const [lookupResult, setLookupResult] = useState(null);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!code) return;

    // Simulated verified certificate lookup
    setLookupResult({
      code: code.toUpperCase(),
      name: 'Layla M.',
      issueDate: 'October 14, 2026',
      duration: '3 Minutes',
      netWpm: 52,
      rawAccuracy: '97.2%',
      status: 'Valid',
      isUnproctored: true,
    });
  };

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px' }}>
      <button
        type="button"
        onClick={onBack}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-action-link)', fontWeight: 700, marginBottom: '20px' }}
      >
        ← Return Home
      </button>

      <div className="surface-card" style={{ textAlign: 'center', padding: '32px' }}>
        <div style={{ color: 'var(--color-learning-accent)', marginBottom: '16px' }}>
          <ShieldIcon size={44} />
        </div>
        <h1 className="text-heading-page" style={{ fontSize: '24px', marginBottom: '8px' }}>
          Certificate Verification
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          Enter a unique TypeFlow certificate code to verify authentic performance records.
        </p>

        <form onSubmit={handleVerify} style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
          <input
            type="text"
            required
            className="form-input english-island"
            placeholder="e.g. TF-2026-X98B"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ textAlign: 'center', fontWeight: 700, letterSpacing: '1px' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 24px', flexShrink: 0 }}>
            Verify
          </button>
        </form>

        {lookupResult && (
          <div
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-card)',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '2px solid var(--color-success-accent)',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-success-text)' }}>
                ✓ OFFICIAL VALID RECORD
              </span>
              <span className="english-island" style={{ fontSize: '13px', fontWeight: 700 }}>
                {lookupResult.code}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '14px' }}>
              <div>
                <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '12px' }}>Recipient</span>
                <strong>{lookupResult.name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '12px' }}>Issue Date</span>
                <strong>{lookupResult.issueDate}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '12px' }}>Net Speed</span>
                <strong className="english-island">{lookupResult.netWpm} WPM</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '12px' }}>Raw Accuracy</span>
                <strong className="english-island">{lookupResult.rawAccuracy}</strong>
              </div>
            </div>

            <p style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border-subtle)', fontSize: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
              * Unproctored TypeFlow performance certificate issued under self-study conditions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
