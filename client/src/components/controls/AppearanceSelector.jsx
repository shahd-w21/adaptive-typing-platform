// Appearance selection shares keyboard behavior with language selection.
import { usePreferences } from '../../context/preferences.js';
import { useTranslation } from '../../i18n/useTranslation.js';
import { SunIcon, MoonIcon, MonitorIcon } from '../ui/Icons.jsx';
import { PreferenceMenu } from './PreferenceMenu.jsx';

/** Change presentation through the existing provider without replacing page state. */
export function AppearanceSelector({ compact = false }) {
  const { themePreference, setThemePreference } = usePreferences();
  const { t } = useTranslation();
  const options = [
    { value: 'light', label: t('preferences.light'), icon: SunIcon },
    { value: 'dark', label: t('preferences.dark'), icon: MoonIcon },
    { value: 'system', label: t('preferences.system'), icon: MonitorIcon },
  ];

  return <PreferenceMenu label={t('preferences.appearance')} options={options} value={themePreference} onChange={setThemePreference} compact={compact} />;
}
