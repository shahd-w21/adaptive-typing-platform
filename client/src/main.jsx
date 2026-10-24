import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AppProviders } from './app/providers.jsx';
import { ErrorBoundary } from './app/ErrorBoundary.jsx';
import './index.css';

function applyGuestPreferencesBeforeRender() {
  try {
    const storedTheme = localStorage.getItem('typeflow_theme_pref');
    const theme = ['light', 'dark', 'system'].includes(storedTheme) ? storedTheme : 'system';
    const locale = ['en', 'ar'].includes(localStorage.getItem('typeflow_locale_pref'))
      ? localStorage.getItem('typeflow_locale_pref') : 'en';
    const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    document.documentElement.setAttribute('data-theme', theme === 'system' ? (systemDark ? 'dark' : 'light') : theme);
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
  } catch {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('lang', 'en');
    document.documentElement.setAttribute('dir', 'ltr');
  }
}

applyGuestPreferencesBeforeRender();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <App />
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
);
