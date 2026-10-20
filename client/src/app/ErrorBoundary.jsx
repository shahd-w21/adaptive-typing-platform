import { Component } from 'react';
import en from '../i18n/dictionaries/en.json';
import ar from '../i18n/dictionaries/ar.json';

const copy = { en, ar };

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error('TypeFlow render error', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    let locale = 'en';
    try { locale = localStorage.getItem('typeflow_locale_pref') === 'ar' ? 'ar' : 'en'; } catch { /* Use English when storage is unavailable. */ }
    const t = copy[locale].auth;

    return (
      <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-page p-6 text-ink">
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 -end-24 -z-10 size-96 rounded-full bg-learning-soft opacity-70 blur-3xl" />
        <section className="w-full max-w-xl rounded-card border border-border-subtle bg-surface p-8 shadow-popover sm:p-10" role="alert">
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-error-soft text-error-text" aria-hidden="true">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h1 className="mb-2 font-display text-2xl font-bold">{t.errorTitle}</h1>
          <p className="mb-7 text-muted">{t.errorDescription}</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => this.setState({ hasError: false })} className="rounded-full bg-action-primary px-6 py-3 font-bold text-action-foreground shadow-primary transition-colors hover:bg-action-hover">
              {t.errorRetry}
            </button>
            <a href="/" className="rounded-full border border-border-control px-6 py-3 font-bold text-ink no-underline transition-colors hover:bg-subtle">
              {locale === 'ar' ? 'الصفحة الرئيسية' : 'Go to home'}
            </a>
          </div>
        </section>
      </main>
    );
  }
}
