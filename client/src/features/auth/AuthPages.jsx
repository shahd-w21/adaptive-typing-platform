import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema } from '@typeflow/shared';
import { useTranslation } from '../../i18n/useTranslation.js';
import { ArrowRightIcon, ShieldIcon } from '../../components/ui/Icons.jsx';

export function LandingPage({ onStartLearning, onLogin }) {
  const { isRTL, t } = useTranslation();

  return (
    <div className="landing-page pb-15">
      {/* Hero Section */}
      <section
        className="landing-hero py-16 px-5 text-center max-w-205 my-0 mx-auto"
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
            <span>{t('auth.loginAction')}</span>
          </button>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section
        className="landing-features grid grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))] gap-6 max-w-280 my-0 mx-auto py-0 px-5"
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

function authMessageFor(error, t) {
  const messages = {
    INVALID_CREDENTIALS: 'invalidCredentials',
    EMAIL_NOT_VERIFIED: 'emailNotVerified',
    EMAIL_REGISTERED: 'emailRegistered',
    RATE_LIMITED: 'rateLimited',
    EMAIL_UNAVAILABLE: 'verifyUnavailable',
  };
  return t(`auth.${messages[error?.code] || 'requestFailed'}`);
}

export function AuthModal({ mode = 'login', onClose, onModeChange, onSubmit }) {
  const { t } = useTranslation();
  const isRegister = mode === 'register';
  const [notice, setNotice] = useState('');
  const registrationSchema = registerSchema.refine(values => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: t('auth.passwordMismatch'),
  });
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(isRegister ? registrationSchema : loginSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    const closeOnEscape = event => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const submit = handleSubmit(async values => {
    setNotice('');
    try {
      await onSubmit(isRegister ? values : { email: values.email, password: values.password });
      if (isRegister) {
        setNotice(t('auth.registerSuccess'));
        reset({ email: values.email, password: '', confirmPassword: '' });
      }
    } catch (error) {
      if (error?.code === 'INVALID_REQUEST' && error.details?.field) {
        setError(error.details.field, { type: 'server', message: authMessageFor(error, t) });
      } else {
        setError('root.server', { type: 'server', message: authMessageFor(error, t) });
      }
    }
  });

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-overlay p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="relative my-auto w-full max-w-105 rounded-dialog border border-border-subtle bg-surface p-6 shadow-popover sm:p-8" role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-learning-soft text-learning-strong" aria-hidden="true">
          <ShieldIcon size={23} />
        </div>
        <h2 id="auth-dialog-title" className="font-display rtl:font-arabic text-[24px] leading-[34px] font-bold mb-2 text-center">
          {isRegister ? t('auth.registerTitle') : t('auth.loginTitle')}
        </h2>
        <p className="text-muted text-[14px] text-center mb-6">
          {isRegister ? t('auth.registerDescription') : t('auth.loginDescription')}
        </p>

        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <div>
            <label htmlFor="auth-email" className="block text-[14px] font-bold mb-1.5">
              {t('auth.emailLabel')}
            </label>
            <input
              id="auth-email"
              type="email"
              className="w-full h-12 py-0 px-4 font-body rtl:font-arabic text-[16px] text-ink bg-surface border-2 border-border-control rounded-control [transition:border-color_var(--motion-fast),_box-shadow_var(--motion-fast)] focus:outline-none focus:border-focus-ring focus:shadow-[0_0_0_3px_rgba(6,_102,_223,_0.2)]"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'auth-email-error' : undefined}
              {...register('email')}
              placeholder="name@example.com"
            />
            {errors.email && <p id="auth-email-error" className="mt-1 text-[13px] text-error-text" role="alert">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-[14px] font-bold mb-1.5">
              {t('auth.passwordLabel')}
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className="w-full h-12 py-0 px-4 font-body rtl:font-arabic text-[16px] text-ink bg-surface border-2 border-border-control rounded-control [transition:border-color_var(--motion-fast),_box-shadow_var(--motion-fast)] focus:outline-none focus:border-focus-ring focus:shadow-[0_0_0_3px_rgba(6,_102,_223,_0.2)]"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'auth-password-error' : undefined}
              {...register('password')}
            />
            {errors.password && <p id="auth-password-error" className="mt-1 text-[13px] text-error-text" role="alert">{errors.password.message}</p>}
          </div>

          {isRegister && (
            <div>
              <label htmlFor="auth-confirm-password" className="block text-[14px] font-bold mb-1.5">{t('auth.confirmPasswordLabel')}</label>
              <input id="auth-confirm-password" type="password" autoComplete="new-password" className="w-full h-12 px-4 text-ink bg-surface border-2 border-border-control rounded-control focus:outline-none focus:border-focus-ring" aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'auth-confirm-password-error' : undefined} {...register('confirmPassword')} />
              {errors.confirmPassword && <p id="auth-confirm-password-error" className="mt-1 text-[13px] text-error-text" role="alert">{errors.confirmPassword.message}</p>}
            </div>
          )}

          {errors.root?.server && <p className="rounded-control border border-error-text/25 bg-error-soft px-4 py-3 text-[14px] text-error-text" role="alert">{errors.root.server.message}</p>}
          {notice && <p className="rounded-control border border-success-accent/40 bg-success-soft px-4 py-3 text-[14px] text-success-text" role="status">{notice}</p>}

          <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 py-0 px-6 font-body rtl:font-arabic text-[16px] font-bold text-action-foreground bg-action-primary border-0 rounded-full cursor-pointer no-underline shadow-primary transition-colors hover:bg-action-hover disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-wait h-12 w-full mt-2">
            <span>{isSubmitting ? t('common.loading') : isRegister ? t('auth.registerAction') : t('auth.loginAction')}</span>
          </button>
        </form>

        <div className="mt-5 text-center text-[14px] text-muted">
          <button type="button" onClick={() => { setNotice(''); reset(); onModeChange(isRegister ? 'login' : 'register'); }} className="border-0 bg-transparent font-bold text-action-link">{isRegister ? t('auth.switchToLogin') : t('auth.switchToRegister')}</button>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="absolute top-4 end-4 flex size-10 items-center justify-center rounded-full border-0 bg-transparent cursor-pointer text-[18px] text-muted transition-colors hover:bg-subtle hover:text-ink"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function PublicCertificateVerification({ onBack }) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [lookupResult, setLookupResult] = useState(null);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!code) return;

    setLookupResult({ unavailable: true });
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

        {lookupResult?.code && (
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

            <div className="grid grid-cols-1 gap-3.5 text-[14px] sm:grid-cols-2">
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
        {lookupResult?.unavailable && <p className="rounded-control border border-warning-accent/40 bg-warning-soft p-4 text-start text-sm text-warning-text" role="status">{t('common.certificateUnavailable')}</p>}
      </div>
    </div>
  );
}
