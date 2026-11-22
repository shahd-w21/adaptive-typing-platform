// One-use password reset form that clears any current client session after success.
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../../api/auth.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { useTranslation } from '../../../i18n/useTranslation.js';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const { clearSession } = useAuth();
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('ready');
  const token = params.get('token') || '';

  async function submit(event) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setStatus('mismatch');
      return;
    }
    setStatus('submitting');
    try {
      await resetPassword({ token, password, confirmPassword });
      await clearSession();
      setStatus('success');
    } catch (error) {
      setStatus(error?.code === 'INVALID_TOKEN' || error?.code === 'INVALID_REQUEST' ? 'invalid' : 'error');
    }
  }

  const message = status === 'success'
    ? t('auth.resetSuccess')
    : status === 'invalid'
      ? t('auth.resetInvalid')
      : status === 'mismatch'
        ? t('auth.passwordMismatch')
        : status === 'error'
          ? t('auth.requestFailed')
          : !token
            ? t('auth.resetMissing')
            : null;

  return (
    <section className="mx-auto my-12 w-full max-w-xl px-5 sm:my-20" aria-labelledby="reset-password-title">
      <div className="rounded-card border border-border-subtle bg-surface p-7 shadow-popover sm:p-10">
        <h1 id="reset-password-title" className="mb-3 font-display text-2xl font-bold">{t('auth.resetPasswordTitle')}</h1>
        <p className="mb-7 text-sm text-muted">{t('auth.resetPasswordDescription')}</p>
        {message && <p className={`mb-5 rounded-control p-3 text-sm ${['invalid', 'mismatch', 'error'].includes(status) ? 'bg-error-soft text-error-text' : 'bg-success-soft text-success-text'}`} role={status === 'success' || ['invalid', 'mismatch', 'error'].includes(status) ? 'alert' : 'status'}>{message}</p>}
        {status !== 'success' && token && (
          <form onSubmit={submit}>
            <label htmlFor="reset-password" className="mb-1.5 block text-sm font-bold">{t('auth.passwordLabel')}</label>
            <input id="reset-password" type="password" required minLength="8" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} className="mb-4 h-12 w-full rounded-control border-2 border-border-control bg-surface px-4 text-ink focus:border-focus-ring focus:outline-none" />
            <label htmlFor="reset-confirm-password" className="mb-1.5 block text-sm font-bold">{t('auth.confirmPasswordLabel')}</label>
            <input id="reset-confirm-password" type="password" required minLength="8" autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="h-12 w-full rounded-control border-2 border-border-control bg-surface px-4 text-ink focus:border-focus-ring focus:outline-none" />
            <button type="submit" disabled={status === 'submitting'} className="mt-4 min-h-12 w-full rounded-full bg-action-primary px-6 font-bold text-action-foreground shadow-primary hover:bg-action-hover disabled:cursor-wait disabled:bg-disabled-bg">
              {status === 'submitting' ? t('common.loading') : t('auth.resetPasswordAction')}
            </button>
          </form>
        )}
        <Link to="/login" className="mt-5 inline-block font-bold text-action-link">{t('auth.toLogin')}</Link>
      </div>
    </section>
  );
}
