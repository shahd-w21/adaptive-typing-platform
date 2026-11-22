// Public password-recovery request form backed by the real authentication API.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../../api/auth.js';
import { useTranslation } from '../../../i18n/useTranslation.js';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('ready');

  async function submit(event) {
    event.preventDefault();
    setStatus('submitting');
    try {
      await forgotPassword(email);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  const message = status === 'success'
    ? t('auth.resetRequestSuccess')
    : status === 'error'
      ? t('auth.requestFailed')
      : null;

  return (
    <section className="mx-auto my-12 w-full max-w-xl px-5 sm:my-20" aria-labelledby="forgot-password-title">
      <div className="rounded-card border border-border-subtle bg-surface p-7 shadow-popover sm:p-10">
        <h1 id="forgot-password-title" className="mb-3 font-display text-2xl font-bold">{t('auth.forgotPasswordTitle')}</h1>
        <p className="mb-7 text-sm text-muted">{t('auth.forgotPasswordDescription')}</p>
        {message && <p className={`mb-5 rounded-control p-3 text-sm ${status === 'error' ? 'bg-error-soft text-error-text' : 'bg-success-soft text-success-text'}`} role={status === 'error' ? 'alert' : 'status'}>{message}</p>}
        {status !== 'success' && (
          <form onSubmit={submit}>
            <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-bold">{t('auth.emailLabel')}</label>
            <input id="forgot-email" type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="h-12 w-full rounded-control border-2 border-border-control bg-surface px-4 text-ink focus:border-focus-ring focus:outline-none" />
            <button type="submit" disabled={status === 'submitting'} className="mt-4 min-h-12 w-full rounded-full bg-action-primary px-6 font-bold text-action-foreground shadow-primary hover:bg-action-hover disabled:cursor-wait disabled:bg-disabled-bg">
              {status === 'submitting' ? t('common.loading') : t('auth.sendResetLink')}
            </button>
          </form>
        )}
        <Link to="/login" className="mt-5 inline-block font-bold text-action-link">{t('auth.toLogin')}</Link>
      </div>
    </section>
  );
}
