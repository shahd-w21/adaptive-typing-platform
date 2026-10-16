import { usePreferences } from '../context/preferences.js';
import en from './dictionaries/en.json';
import ar from './dictionaries/ar.json';

const dictionaries = { en, ar };

export function useTranslation() {
  const { uiLocale, isRTL, dir } = usePreferences();

  const t = (path, params = {}) => {
    const keys = path.split('.');
    let current = dictionaries[uiLocale] || dictionaries.en;
    let fallback = dictionaries.en;

    for (const key of keys) {
      current = current?.[key];
      fallback = fallback?.[key];
    }

    let result = typeof current === 'string' ? current : (typeof fallback === 'string' ? fallback : path);

    // Replace {placeholder} with params
    if (params && typeof result === 'string') {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramVal);
      });
    }

    return result;
  };

  return { t, locale: uiLocale, isRTL, dir };
}
