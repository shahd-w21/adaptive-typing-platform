// Interface locale selection preserves the provider's save feedback and retry path.
import { usePreferences } from '../../context/preferences.js';
import { useTranslation } from '../../i18n/useTranslation.js';
import { GlobeIcon } from '../ui/Icons.jsx';
import { PreferenceMenu } from './PreferenceMenu.jsx';

/** Keep English exercise content independent of the interface language. */
export function LanguageSelector({ compact = false }) {
  const { uiLocale, setUiLocale, saveStatus, retryPreferenceSave } = usePreferences();
  const { t } = useTranslation();
  const options = [
    { value: 'en', label: t('preferences.langEn'), icon: GlobeIcon, lang: 'en' },
    { value: 'ar', label: t('preferences.langAr'), icon: GlobeIcon, lang: 'ar' },
  ];

  return (
    <>
      <PreferenceMenu label={t('preferences.language')} options={options} value={uiLocale} onChange={setUiLocale} compact={compact} helper={t('preferences.langHelper')} />
      {(saveStatus === 'saving' || saveStatus === 'error') && (
        <div className="fixed end-3 top-[calc(var(--header-height)+0.5rem)] z-100 flex w-[min(22rem,calc(100vw_-_1.5rem))] items-center gap-3 rounded-control border border-border-subtle bg-surface p-3 text-sm shadow-popover" role={saveStatus === 'error' ? 'alert' : 'status'}>
          <span className="min-w-0 flex-1 text-ink">{t(saveStatus === 'saving' ? 'preferences.saving' : 'preferences.saveFailed')}</span>
          {saveStatus === 'error' && <button type="button" onClick={retryPreferenceSave} className="min-h-11 shrink-0 rounded-full px-3 py-2 font-bold text-action-link hover:bg-learning-soft">{t('preferences.saveRetry')}</button>}
        </div>
      )}
    </>
  );
}
