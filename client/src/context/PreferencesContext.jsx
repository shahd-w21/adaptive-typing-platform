import { useState, useEffect, useMemo } from 'react';
import { PreferencesContext } from './preferences.js';

const STORAGE_KEYS = {
  THEME: 'typeflow_theme_pref',
  LOCALE: 'typeflow_locale_pref',
  LARGE_TEXT: 'typeflow_large_text',
  REDUCED_PRESSURE: 'typeflow_reduced_pressure',
};

export function PreferencesProvider({ children }) {
  // Theme state: 'light' | 'dark' | 'system'
  const [themePreference, setThemePreference] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'system';
  });

  // System dark-mode match
  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // UI Locale state: 'en' | 'ar'
  const [uiLocale, setUiLocale] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.LOCALE) || 'en';
  });

  // Accessibility flags
  const [largeText, setLargeText] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.LARGE_TEXT) === 'true';
  });

  const [reducedPressure, setReducedPressure] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.REDUCED_PRESSURE) === 'true';
  });

  // Listen to OS system color-scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Compute active rendered theme
  const resolvedTheme = useMemo(() => {
    if (themePreference === 'system') {
      return systemIsDark ? 'dark' : 'light';
    }
    return themePreference;
  }, [themePreference, systemIsDark]);

  // Apply theme to HTML root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, themePreference);
  }, [resolvedTheme, themePreference]);

  // Apply locale and direction to HTML root
  useEffect(() => {
    const dir = uiLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', uiLocale);
    localStorage.setItem(STORAGE_KEYS.LOCALE, uiLocale);
  }, [uiLocale]);

  // Apply large text to storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LARGE_TEXT, String(largeText));
  }, [largeText]);

  // Apply reduced pressure to storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REDUCED_PRESSURE, String(reducedPressure));
  }, [reducedPressure]);

  const value = {
    themePreference,
    setThemePreference,
    resolvedTheme,
    uiLocale,
    setUiLocale,
    dir: uiLocale === 'ar' ? 'rtl' : 'ltr',
    isRTL: uiLocale === 'ar',
    largeText,
    setLargeText,
    reducedPressure,
    setReducedPressure,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}
