// Existing public screens; authentication modal delegates keyboard and focus behavior to Dialog.
import { useState } from 'react';
import { Dialog } from '../../components/ui/Dialog.jsx';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema } from '@typeflow/shared';
import { useTranslation } from '../../i18n/useTranslation.js';
import { BrandLogo } from '../../components/ui/BrandLogo.jsx';
import { ShieldIcon, XIcon } from '../../components/ui/Icons.jsx';

// Preserve the router's existing import while keeping marketing separate from forms.
export { LandingPage } from './LandingPage.jsx';

/** Map server failures to safe, translated messages without exposing response details. */
function authMessageFor(error, t) {
  const messages = {
    INVALID_CREDENTIALS: 'invalidCredentials',
    EMAIL_NOT_VERIFIED: 'emailNotVerified',
    EMAIL_REGISTERED: 'emailRegistered',
    RATE_LIMITED: 'rateLimited',
    EMAIL_UNAVAILABLE: 'verifyUnavailable',
    ACCOUNT_INACTIVE: 'accountInactive',
  };
  return t(`auth.${messages[error?.code] || 'requestFailed'}`);
}

/** Branded account form; Dialog owns focus/scroll and the route owner performs authentication. */
export function AuthModal({ mode = 'login', onClose, onModeChange, onSubmit }) {
  const { t } = useTranslation();
  const isRegister = mode === 'register';
  const [notice, setNotice] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const registrationSchema = registerSchema.refine(
    values => values.password === values.confirmPassword,
    {
      path: ['confirmPassword'],
      message: t('auth.passwordMismatch'),
    },
  );
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isRegister ? registrationSchema : loginSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  /** Keep the existing request shape and verification notice; never store credentials. */
  const submit = handleSubmit(async values => {
    setNotice('');
    try {
      await onSubmit(isRegister ? values : {
        email: values.email,
        password: values.password,
      });
      if (isRegister) {
        setNotice(t('auth.registerSuccess'));
        reset({ email: values.email, password: '', confirmPassword: '' });
        setPasswordVisible(false);
      }
    } catch (error) {
      if (error?.code === 'INVALID_REQUEST' && error.details?.field) {
        setError(error.details.field, {
          type: 'server',
          message: authMessageFor(error, t),
        });
      } else {
        setError('root.server', {
          type: 'server',
          message: authMessageFor(error, t),
        });
      }
    }
  });

  /** Clear notices and secret inputs when switching between the existing account routes. */
  function switchMode() {
    setNotice('');
    setPasswordVisible(false);
    reset();
    onModeChange(isRegister ? 'login' : 'register');
  }

  return (
    <Dialog
      open
      onClose={onClose}
      labelledBy="auth-dialog-title"
      describedBy="auth-dialog-description"
      className="auth-dialog"
    >
      <div className="auth-dialog-brand"><BrandLogo /></div>
      <div className="auth-dialog-body">
        <header className="auth-introduction">
          <h2 id="auth-dialog-title">
            {isRegister ? t('auth.registerTitle') : t('auth.loginTitle')}
          </h2>
          <p id="auth-dialog-description">
            {isRegister ? t('auth.registerDescription') : t('auth.loginDescription')}
          </p>
        </header>

        <form onSubmit={submit} className="auth-form" noValidate>
          <div className="auth-field">
            <label htmlFor="auth-email">{t('auth.emailLabel')}</label>
            <input
              id="auth-email"
              type="email"
              dir="ltr"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'auth-email-error' : undefined}
              {...register('email')}
              placeholder="name@example.com"
            />
            {errors.email && (
              <p id="auth-email-error" className="auth-field-error" role="alert">
                {errors.email.type === 'server' ? errors.email.message : t('auth.invalidEmail')}
              </p>
            )}
          </div>

          <div className="auth-field">
            <div className="auth-field-heading">
              <label htmlFor="auth-password">{t('auth.passwordLabel')}</label>
              <button
                type="button"
                className="auth-password-toggle"
                aria-pressed={passwordVisible}
                aria-controls={isRegister ? 'auth-password auth-confirm-password' : 'auth-password'}
                onClick={() => setPasswordVisible(visible => !visible)}
              >
                {t(passwordVisible ? 'auth.hidePassword' : 'auth.showPassword')}
              </button>
            </div>
            <input
              id="auth-password"
              type={passwordVisible ? 'text' : 'password'}
              dir="ltr"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={[
                isRegister && 'auth-password-help',
                errors.password && 'auth-password-error',
              ].filter(Boolean).join(' ') || undefined}
              {...register('password')}
            />
            {isRegister && <p id="auth-password-help" className="auth-field-help">{t('auth.passwordHelp')}</p>}
            {errors.password && (
              <p id="auth-password-error" className="auth-field-error" role="alert">
                {errors.password.type === 'server'
                  ? errors.password.message
                  : t(isRegister ? 'auth.passwordHelp' : 'auth.passwordRequired')}
              </p>
            )}
          </div>

          {isRegister && (
            <div className="auth-field">
              <label htmlFor="auth-confirm-password">{t('auth.confirmPasswordLabel')}</label>
              <input
                id="auth-confirm-password"
                type={passwordVisible ? 'text' : 'password'}
                dir="ltr"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? 'auth-confirm-password-error' : undefined}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p id="auth-confirm-password-error" className="auth-field-error" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          )}

          {errors.root?.server && (
            <p className="auth-feedback bg-error-soft text-error-text" role="alert">
              {errors.root.server.message}
            </p>
          )}
          {notice && (
            <p className="auth-feedback bg-success-soft text-success-text" role="status">{notice}</p>
          )}

          <button type="submit" disabled={isSubmitting} className="auth-submit" aria-busy={isSubmitting}>
            {isSubmitting
              ? t('common.loading')
              : t(isRegister ? 'auth.registerAction' : 'auth.loginAction')}
          </button>
        </form>

        {isRegister && <p className="auth-verification-note">{t('auth.verificationNote')}</p>}
        <div className="auth-switch">
          <button type="button" onClick={switchMode}>
            {t(isRegister ? 'auth.switchToLogin' : 'auth.switchToRegister')}
          </button>
        </div>
      </div>

      <button type="button" onClick={onClose} aria-label={t('common.close')} className="auth-close">
        <XIcon size={20} />
      </button>
    </Dialog>
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
          <button type="submit" className="inline-flex items-center justify-center gap-2 h-12 font-body rtl:font-arabic text-[16px] font-bold text-action-foreground bg-action-primary border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:active:bg-action-pressed enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none py-0 px-6 shrink-0">
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
