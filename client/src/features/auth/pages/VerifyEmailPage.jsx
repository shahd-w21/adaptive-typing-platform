import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resendVerification, verifyEmail } from '../../../api/auth.js';
import { useTranslation } from '../../../i18n/useTranslation.js';
import { ShieldIcon } from '../../../components/ui/Icons.jsx';

export function VerifyEmailPage({ token, onVerified }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState('ready');
  const [email, setEmail] = useState('');

  const verify = async event => {
    event.preventDefault();
    if (!token || status === 'verifying') return;
    setStatus('verifying');
    try {
      await verifyEmail(token);
      setStatus('success');
      onVerified?.();
    } catch (error) {
      setStatus(error?.code === 'INVALID_TOKEN' || error?.code === 'INVALID_REQUEST' ? 'invalid' : 'unavailable');
    }
  };

  const resend = async event => {
    event.preventDefault();
    setStatus('resending');
    try {
      await resendVerification(email);
      setStatus('resent');
    } catch {
      setStatus('unavailable');
    }
  };

  const message = status === 'success' ? t('auth.verifySuccess')
    : status === 'invalid' ? t('auth.verifyFailure')
      : status === 'unavailable' ? t('auth.verifyUnavailable')
        : !token ? t('auth.verifyMissing') : t('auth.verifyDescription');

  return (
    <section className="mx-auto my-12 w-full max-w-xl px-5 sm:my-20" aria-labelledby="verify-email-title">
      <div className="rounded-card border border-border-subtle bg-surface p-7 text-center shadow-popover sm:p-10">
        <div className={`mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl ${status === 'success' ? 'bg-success-soft text-success-text' : 'bg-learning-soft text-learning-strong'}`} aria-hidden="true">
          <ShieldIcon size={26} />
        </div>
        <h1 id="verify-email-title" className="mb-3 font-display text-2xl font-bold">{t('auth.verifyTitle')}</h1>
        <p className={`mb-7 text-sm ${status === 'invalid' || status === 'unavailable' ? 'text-error-text' : status === 'success' || status === 'resent' ? 'text-success-text' : 'text-muted'}`} role={['invalid', 'unavailable'].includes(status) ? 'alert' : ['success', 'resent'].includes(status) || !token ? 'status' : undefined}>
          {status === 'resent' ? t('auth.resendSuccess') : message}
        </p>

        {status === 'success' ? (
          <Link to="/login" className="inline-flex min-h-12 items-center justify-center rounded-full bg-action-primary px-6 font-bold text-action-foreground shadow-primary hover:bg-action-hover">{t('auth.toLogin')}</Link>
        ) : token && status !== 'resent' ? (
          <form onSubmit={verify}>
            <button type="submit" disabled={status === 'verifying' || status === 'resending'} className="inline-flex min-h-12 items-center justify-center rounded-full bg-action-primary px-6 font-bold text-action-foreground shadow-primary hover:bg-action-hover disabled:cursor-wait disabled:bg-disabled-bg disabled:text-disabled-text">
              {status === 'verifying' ? t('auth.verifyWorking') : t('auth.verifyAction')}
            </button>
          </form>
        ) : null}

        {!['success', 'resent'].includes(status) && (
          <form onSubmit={resend} className="mx-auto mt-7 max-w-sm border-t border-border-subtle pt-5 text-start">
            <label htmlFor="resend-email" className="mb-1.5 block text-sm font-bold">{t('auth.emailLabel')}</label>
            <input id="resend-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} className="h-12 w-full rounded-control border-2 border-border-control bg-surface px-4 text-ink focus:border-focus-ring focus:outline-none" />
            <button type="submit" disabled={status === 'resending'} className="mt-3 w-full rounded-full border border-border-control px-5 py-3 font-bold text-ink transition-colors hover:bg-subtle disabled:cursor-wait" >
              {status === 'resending' ? t('auth.resendWorking') : t('auth.resendAction')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
