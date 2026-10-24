import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PreferencesContext } from './preferences.js';
import { useAuth } from '../hooks/useAuth.js';
import { updateMyProfile } from '../api/users.js';

const STORAGE_KEYS = {
  THEME: 'typeflow_theme_pref',
  LOCALE: 'typeflow_locale_pref',
  LARGE_TEXT: 'typeflow_large_text',
  REDUCED_PRESSURE: 'typeflow_reduced_pressure',
};

function readGuestPreferences() {
  try {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    const locale = localStorage.getItem(STORAGE_KEYS.LOCALE);
    return {
      themePreference: ['light', 'dark', 'system'].includes(theme) ? theme : 'system',
      uiLocale: ['en', 'ar'].includes(locale) ? locale : 'en',
      largeText: localStorage.getItem(STORAGE_KEYS.LARGE_TEXT) === 'true',
      reducedPressure: localStorage.getItem(STORAGE_KEYS.REDUCED_PRESSURE) === 'true',
    };
  } catch {
    return { themePreference: 'system', uiLocale: 'en', largeText: false, reducedPressure: false };
  }
}

function preferencesFromUser(user) {
  return {
    themePreference: ['light', 'dark', 'system'].includes(user?.preferences?.themePreference)
      ? user.preferences.themePreference : 'system',
    uiLocale: ['en', 'ar'].includes(user?.preferences?.uiLocale) ? user.preferences.uiLocale : 'en',
    largeText: user?.largeText === true,
    reducedPressure: user?.reducedPressure === true,
  };
}

function applyProfilePatch(current, patch) {
  return {
    ...current,
    ...(patch.largeText === undefined ? {} : { largeText: patch.largeText }),
    ...(patch.reducedPressure === undefined ? {} : { reducedPressure: patch.reducedPressure }),
    ...(patch.preferences?.themePreference === undefined ? {} : { themePreference: patch.preferences.themePreference }),
    ...(patch.preferences?.uiLocale === undefined ? {} : { uiLocale: patch.preferences.uiLocale }),
  };
}

export function PreferencesProvider({ children }) {
  const { status: authStatus, user, csrfToken, updateUser } = useAuth();
  const [preferences, setPreferences] = useState(readGuestPreferences);
  const [systemIsDark, setSystemIsDark] = useState(() => typeof window !== 'undefined'
    && Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches));
  const [saveStatus, setSaveStatus] = useState('idle');
  const confirmedRef = useRef(preferences);
  const previouslyAuthenticatedRef = useRef(false);
  const appliedAccountIdRef = useRef(null);
  const saveQueueRef = useRef(Promise.resolve());
  const pendingSavesRef = useRef(0);
  const failedPatchRef = useRef(null);
  const preferencesRef = useRef(preferences);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mediaQuery) return undefined;
    const handler = event => setSystemIsDark(event.matches);
    mediaQuery.addEventListener?.('change', handler);
    return () => mediaQuery.removeEventListener?.('change', handler);
  }, []);

  useEffect(() => {
    if (authStatus === 'authenticated' && user) {
      if (appliedAccountIdRef.current === user.id) return;
      appliedAccountIdRef.current = user.id;
      const accountPreferences = preferencesFromUser(user);
      confirmedRef.current = accountPreferences;
      preferencesRef.current = accountPreferences;
      // Auth data is external state; sync it when the account identity changes.
      setPreferences(accountPreferences);
      failedPatchRef.current = null;
      setSaveStatus('idle');
      previouslyAuthenticatedRef.current = true;
      return;
    }

    if (authStatus === 'anonymous' && previouslyAuthenticatedRef.current) {
      const guestPreferences = readGuestPreferences();
      confirmedRef.current = guestPreferences;
      preferencesRef.current = guestPreferences;
      // Restore the visitor's saved preferences after account sign-out.
      setPreferences(guestPreferences);
      failedPatchRef.current = null;
      setSaveStatus('idle');
      previouslyAuthenticatedRef.current = false;
      appliedAccountIdRef.current = null;
    }
  }, [authStatus, user]);

  const enqueueAccountSave = useCallback(patch => {
    if (!csrfToken) return Promise.reject(new Error('Your session needs to be refreshed.'));
    pendingSavesRef.current += 1;
    setSaveStatus('saving');

    const save = async () => {
      try {
        const response = await updateMyProfile(patch, csrfToken);
        const confirmed = preferencesFromUser(response.user);
        confirmedRef.current = confirmed;
        failedPatchRef.current = null;
        updateUser(response.user);
        pendingSavesRef.current -= 1;
        if (pendingSavesRef.current === 0) setSaveStatus('saved');
      } catch (error) {
        const restored = { ...preferencesRef.current };
        if (patch.largeText !== undefined && restored.largeText === patch.largeText) restored.largeText = confirmedRef.current.largeText;
        if (patch.reducedPressure !== undefined && restored.reducedPressure === patch.reducedPressure) restored.reducedPressure = confirmedRef.current.reducedPressure;
        if (patch.preferences?.themePreference !== undefined
          && restored.themePreference === patch.preferences.themePreference) restored.themePreference = confirmedRef.current.themePreference;
        if (patch.preferences?.uiLocale !== undefined
          && restored.uiLocale === patch.preferences.uiLocale) restored.uiLocale = confirmedRef.current.uiLocale;
        failedPatchRef.current = patch;
        preferencesRef.current = restored;
        setPreferences(restored);
        pendingSavesRef.current -= 1;
        if (pendingSavesRef.current === 0) setSaveStatus('error');
        throw error;
      }
    };

    const queuedSave = saveQueueRef.current.catch(() => {}).then(save);
    saveQueueRef.current = queuedSave;
    return queuedSave;
  }, [csrfToken, updateUser]);

  const changePreference = useCallback((localKey, patch, value) => {
    const next = { ...preferencesRef.current, [localKey]: value };
    preferencesRef.current = next;
    setPreferences(next);
    if (authStatus === 'authenticated') {
      enqueueAccountSave(patch).catch(() => {});
    } else {
      confirmedRef.current = next;
      const storageKey = {
        themePreference: STORAGE_KEYS.THEME,
        uiLocale: STORAGE_KEYS.LOCALE,
        largeText: STORAGE_KEYS.LARGE_TEXT,
        reducedPressure: STORAGE_KEYS.REDUCED_PRESSURE,
      }[localKey];
      try {
        localStorage.setItem(storageKey, String(value));
      } catch {
        // Keep the in-memory preference usable when browser storage is blocked.
      }
      setSaveStatus('idle');
    }
  }, [authStatus, enqueueAccountSave]);

  const setThemePreference = useCallback(value => {
    if (['light', 'dark', 'system'].includes(value)) {
      changePreference('themePreference', { preferences: { themePreference: value } }, value);
    }
  }, [changePreference]);

  const setUiLocale = useCallback(value => {
    if (['en', 'ar'].includes(value)) {
      changePreference('uiLocale', { preferences: { uiLocale: value } }, value);
    }
  }, [changePreference]);

  const setLargeText = useCallback(value => {
    changePreference('largeText', { largeText: Boolean(value) }, Boolean(value));
  }, [changePreference]);

  const setReducedPressure = useCallback(value => {
    changePreference('reducedPressure', { reducedPressure: Boolean(value) }, Boolean(value));
  }, [changePreference]);

  const retryPreferenceSave = useCallback(() => {
    const patch = failedPatchRef.current;
    if (!patch) return;
    const restored = applyProfilePatch(confirmedRef.current, patch);
    preferencesRef.current = restored;
    setPreferences(restored);
    enqueueAccountSave(patch).catch(() => {});
  }, [enqueueAccountSave]);

  const resolvedTheme = useMemo(() => preferences.themePreference === 'system'
    ? (systemIsDark ? 'dark' : 'light')
    : preferences.themePreference, [preferences.themePreference, systemIsDark]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.setAttribute('dir', preferences.uiLocale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', preferences.uiLocale);
  }, [resolvedTheme, preferences.uiLocale]);

  const value = useMemo(() => ({
    ...preferences,
    themePreference: preferences.themePreference,
    setThemePreference,
    resolvedTheme,
    setUiLocale,
    dir: preferences.uiLocale === 'ar' ? 'rtl' : 'ltr',
    isRTL: preferences.uiLocale === 'ar',
    setLargeText,
    setReducedPressure,
    saveStatus,
    retryPreferenceSave,
  }), [preferences, setThemePreference, resolvedTheme, setUiLocale, setLargeText, setReducedPressure, saveStatus, retryPreferenceSave]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
