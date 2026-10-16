import { useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation.js';
import { ArrowRightIcon, ShieldIcon } from '../../components/ui/Icons.jsx';

export function LandingPage({ onStartLearning, onLogin }) {
  const { isRTL } = useTranslation();

  return (
    <div className="pb-15">
      {/* Hero Section */}
      <section
        className="py-16 px-5 text-center max-w-205 my-0 mx-auto"
      >
        <div
          className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-learning-soft text-learning-strong text-[13px] font-bold mb-5"
        >
          <span>✨ ADAPTIVE ENGLISH TOUCH TYPING</span>
        </div>

        <h1 className="font-display rtl:font-arabic text-[48px] leading-[60px] font-extrabold max-md:text-[34px] max-md:leading-[44px] mb-4.5">
          Build speed. Keep accuracy.
        </h1>

        <p className="text-[18px] leading-[28px] font-normal text-muted mb-8 max-w-155 mx-auto">
          Master English touch typing with real-time weakness detection, spaced review repetition, and unproctored performance certificates.
        </p>

        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={onStartLearning}
            className="inline-flex items-center justify-center gap-2 font-body rtl:font-arabic font-bold text-action-foreground bg-action-primary border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none h-13 py-0 px-8 text-[17px]"
          >
            <span>Start Learning Free</span>
            <ArrowRightIcon size={18} className={[
                                        isRTL ? 'rotate-180' : 'transform-none',
                                      ].filter(Boolean).join(' ')} />
          </button>

          <button
            type="button"
            onClick={onLogin}
            className="inline-flex items-center justify-center gap-2 font-body rtl:font-arabic font-bold text-ink bg-surface border-2 border-border-control rounded-full cursor-pointer no-underline [transition:background-color_var(--motion-fast),_border-color_var(--motion-fast)] enabled:hover:bg-subtle enabled:hover:border-ink disabled:border-border-subtle disabled:text-disabled-text disabled:cursor-not-allowed h-13 py-0 px-6 text-[16px]"
          >
            <span>Sign In</span>
          </button>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section
        className="grid grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))] gap-6 max-w-280 my-0 mx-auto py-0 px-5"
      >
        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
          <div className="text-[32px] mb-3">🎯</div>
          <h2 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold mb-2">Adaptive Practice</h2>
          <p className="text-muted text-[14px] leading-[22px]">
            Measures your per-key latency and error rates on physical QWERTY keyboards, generating drills tailored specifically to your weak letter pairs.
          </p>
        </div>

        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
          <div className="text-[32px] mb-3">🛡️</div>
          <h2 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold mb-2">Strict Raw Accuracy Gate</h2>
          <p className="text-muted text-[14px] leading-[22px]">
            Progression requires a 95% raw accuracy gate. Backspacing corrections do not erase errors from official records, building genuine muscle memory.
          </p>
        </div>

        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
          <div className="text-[32px] mb-3">📜</div>
          <h2 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold mb-2">Verified Certificates</h2>
          <p className="text-muted text-[14px] leading-[22px]">
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
      className="fixed inset-0 bg-overlay flex items-center justify-center z-100 p-4"
    >
      <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] w-full max-w-105 relative">
        <h2 className="font-display rtl:font-arabic text-[24px] leading-[34px] font-bold mb-2 text-center">
          {isRegister ? 'Create Your Account' : 'Welcome Back'}
        </h2>
        <p className="text-muted text-[14px] text-center mb-6">
          {isRegister ? 'Begin your journey to 80+ WPM touch typing' : 'Sign in to sync your progress across devices'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[14px] font-bold mb-1.5">
              {t('auth.emailLabel')}
            </label>
            <input
              type="email"
              required
              className="w-full h-12 py-0 px-4 font-body rtl:font-arabic text-[16px] text-ink bg-surface border-2 border-border-control rounded-control [transition:border-color_var(--motion-fast),_box-shadow_var(--motion-fast)] focus:outline-none focus:border-focus-ring focus:shadow-[0_0_0_3px_rgba(6,_102,_223,_0.2)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-[14px] font-bold mb-1.5">
              {t('auth.passwordLabel')}
            </label>
            <input
              type="password"
              required
              className="w-full h-12 py-0 px-4 font-body rtl:font-arabic text-[16px] text-ink bg-surface border-2 border-border-control rounded-control [transition:border-color_var(--motion-fast),_box-shadow_var(--motion-fast)] focus:outline-none focus:border-focus-ring focus:shadow-[0_0_0_3px_rgba(6,_102,_223,_0.2)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="inline-flex items-center justify-center gap-2 py-0 px-6 font-body rtl:font-arabic text-[16px] font-bold text-action-foreground bg-action-primary border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none h-12 w-full mt-2">
            <span>{isRegister ? 'Register & Verify' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-5 text-center text-[14px] text-muted">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="bg-transparent border-0 text-action-link font-bold cursor-pointer"
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
                className="bg-transparent border-0 text-action-link font-bold cursor-pointer"
              >
                Get Started
              </button>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 bg-transparent border-0 cursor-pointer text-[18px] text-muted"
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
    <div className="max-w-160 my-10 mx-auto py-0 px-5">
      <button
        type="button"
        onClick={onBack}
        className="bg-transparent border-0 cursor-pointer flex items-center gap-1.5 text-action-link font-bold mb-5"
      >
        ← Return Home
      </button>

      <div className="bg-surface border border-border-subtle rounded-card shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] text-center p-8">
        <div className="text-learning-accent mb-4">
          <ShieldIcon size={44} />
        </div>
        <h1 className="font-display rtl:font-arabic leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px] text-[24px] mb-2">
          Certificate Verification
        </h1>
        <p className="text-muted text-[14px] mb-6">
          Enter a unique TypeFlow certificate code to verify authentic performance records.
        </p>

        <form onSubmit={handleVerify} className="flex gap-3 mb-7">
          <input
            type="text"
            required
            className="w-full h-12 py-0 px-4 font-body rtl:font-arabic text-[16px] text-ink bg-surface border-2 border-border-control rounded-control [transition:border-color_var(--motion-fast),_box-shadow_var(--motion-fast)] focus:outline-none focus:border-focus-ring focus:shadow-[0_0_0_3px_rgba(6,_102,_223,_0.2)] [direction:ltr]! [unicode-bidi:isolate] font-mono! text-center font-bold tracking-[1px]"
            placeholder="e.g. TF-2026-X98B"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button type="submit" className="inline-flex items-center justify-center gap-2 h-12 font-body rtl:font-arabic text-[16px] font-bold text-action-foreground bg-action-primary border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none py-0 px-6 shrink-0">
            Verify
          </button>
        </form>

        {lookupResult && (
          <div
            className="p-6 rounded-card bg-subtle border-2 border-success-accent text-left"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[13px] font-bold text-success-text">
                ✓ OFFICIAL VALID RECORD
              </span>
              <span className="[direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! text-[13px] font-bold">
                {lookupResult.code}
              </span>
            </div>

            <div className="grid grid-cols-[1fr_1fr] gap-3.5 text-[14px]">
              <div>
                <span className="text-muted block text-[12px]">Recipient</span>
                <strong>{lookupResult.name}</strong>
              </div>
              <div>
                <span className="text-muted block text-[12px]">Issue Date</span>
                <strong>{lookupResult.issueDate}</strong>
              </div>
              <div>
                <span className="text-muted block text-[12px]">Net Speed</span>
                <strong className="[direction:ltr]! text-left! [unicode-bidi:isolate] font-mono!">{lookupResult.netWpm} WPM</strong>
              </div>
              <div>
                <span className="text-muted block text-[12px]">Raw Accuracy</span>
                <strong className="[direction:ltr]! text-left! [unicode-bidi:isolate] font-mono!">{lookupResult.rawAccuracy}</strong>
              </div>
            </div>

            <p className="mt-4 pt-3 border-t border-t-border-subtle text-[12px] text-muted italic">
              * Unproctored TypeFlow performance certificate issued under self-study conditions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
