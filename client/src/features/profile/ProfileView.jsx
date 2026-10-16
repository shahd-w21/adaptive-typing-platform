import { useState } from 'react';
import { usePreferences } from '../../context/preferences.js';
import { useTranslation } from '../../i18n/useTranslation.js';
import { SunIcon, MoonIcon, MonitorIcon, AlertCircleIcon } from '../../components/ui/Icons.jsx';

export function ProfileView() {
  const {
    themePreference,
    setThemePreference,
    uiLocale,
    setUiLocale,
    largeText,
    setLargeText,
    reducedPressure,
    setReducedPressure,
  } = usePreferences();
  const { t } = useTranslation();

  const [targetWpm, setTargetWpm] = useState(60);
  const [displayName, setDisplayName] = useState('Layla M.');
  const [consentCertName, setConsentCertName] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="max-w-195 my-0 mx-auto">
      <h1 className="font-display rtl:font-arabic text-[32px] leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px] mb-2">
        Profile & Learning Preferences
      </h1>
      <p className="text-[16px] leading-[26px] font-normal text-muted mb-8">
        Manage account details, presentation theme, language, and accessibility options.
      </p>

      {/* Account Info Card */}
      <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] mb-6">
        <h2 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold mb-4">Account Information</h2>
        <div className="grid grid-cols-[1fr_1fr] gap-4">
          <div>
            <label className="block text-[13px] font-bold mb-1.5">Display Name</label>
            <input type="text" className="w-full h-12 py-0 px-4 font-body rtl:font-arabic text-[16px] text-ink bg-surface border-2 border-border-control rounded-control [transition:border-color_var(--motion-fast),_box-shadow_var(--motion-fast)] focus:outline-none focus:border-focus-ring focus:shadow-[0_0_0_3px_rgba(6,_102,_223,_0.2)]" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div>
            <label className="block text-[13px] font-bold mb-1.5">Email Address</label>
            <input type="email" disabled className="w-full h-12 py-0 px-4 font-body rtl:font-arabic text-[16px] text-ink bg-surface border-2 border-border-control rounded-control [transition:border-color_var(--motion-fast),_box-shadow_var(--motion-fast)] focus:outline-none focus:border-focus-ring focus:shadow-[0_0_0_3px_rgba(6,_102,_223,_0.2)] opacity-70" value="layla@example.com"  />
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-2 text-[13px] cursor-pointer">
            <input type="checkbox" checked={consentCertName} onChange={(e) => setConsentCertName(e.target.checked)} />
            <span>Show my display name on public verification records for certificates</span>
          </label>
        </div>
      </div>

      {/* Appearance & Language Card */}
      <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] mb-6">
        <h2 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold mb-4">Appearance & Interface Language</h2>

        {/* Theme Radios */}
        <div className="mb-5">
          <span className="text-[14px] font-bold block mb-2">
            Color Mode
          </span>
          <div className="grid grid-cols-[repeat(3,_1fr)] gap-3">
            {[
              { id: 'light', label: 'Light', icon: SunIcon },
              { id: 'dark', label: 'Dark', icon: MoonIcon },
              { id: 'system', label: 'System', icon: MonitorIcon },
            ].map((theme) => {
              const Icon = theme.icon;
              const isSelected = themePreference === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setThemePreference(theme.id)}
                  className={[
                    "flex flex-col items-center gap-2 p-4 rounded-control border-2 cursor-pointer",
                    isSelected ? 'border-learning-accent bg-learning-soft text-learning-strong font-bold' : 'border-border-subtle bg-surface text-ink font-medium',
                  ].filter(Boolean).join(' ')}
                >
                  <Icon size={24} />
                  <span>{theme.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <span className="text-[14px] font-bold block mb-2">
            Interface Language (لغة الواجهة)
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setUiLocale('en')}
              className={[
                "flex-1 p-3 rounded-control border-2 font-bold cursor-pointer",
                uiLocale === 'en' ? 'border-learning-accent bg-learning-soft text-learning-strong' : 'border-border-subtle bg-surface text-ink',
              ].filter(Boolean).join(' ')}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setUiLocale('ar')}
              className={[
                "flex-1 p-3 rounded-control border-2 font-bold cursor-pointer",
                uiLocale === 'ar' ? 'border-learning-accent bg-learning-soft text-learning-strong' : 'border-border-subtle bg-surface text-ink',
              ].filter(Boolean).join(' ')}
            >
              العربية
            </button>
          </div>
          <p className="text-[12px] text-muted mt-2">
            {t('preferences.langHelper')}
          </p>
        </div>
      </div>

      {/* Typing & Accessibility Settings Card */}
      <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] mb-6">
        <h2 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold mb-4">Typing Target & Accessibility</h2>

        <div className="mb-5">
          <div className="flex justify-between mb-1.5">
            <label className="text-[14px] font-bold">Personal Target Net Speed</label>
            <span className="[direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! font-extrabold text-learning-strong">
              {targetWpm} WPM
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="120"
            step="5"
            value={targetWpm}
            onChange={(e) => setTargetWpm(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-[12px] text-muted mt-1">
            Used to calibrate expected latency targets for upcoming lessons.
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="font-bold text-[14px]">Large Text Mode</div>
              <div className="text-[12px] text-muted">Enlarges exercise font from 28px to 36px</div>
            </div>
            <input type="checkbox" checked={largeText} onChange={(e) => setLargeText(e.target.checked)} />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="font-bold text-[14px]">Reduced Pressure Mode</div>
              <div className="text-[12px] text-muted">Hides live speed and timer emphasis during typing</div>
            </div>
            <input type="checkbox" checked={reducedPressure} onChange={(e) => setReducedPressure(e.target.checked)} />
          </label>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-surface border  rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] border-error-text">
        <h2 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold text-error-text mb-2">
          Danger Zone
        </h2>
        <p className="text-[13px] text-muted mb-4">
          Permanently delete your account. This irreversibly anonymises your personal history, certificates, and forum posts according to SRS SYS-9.
        </p>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center justify-center gap-2 py-0 px-6 font-body rtl:font-arabic font-bold text-action-foreground border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none bg-error-text h-10.5 text-[14px]"
        >
          Delete Account
        </button>
      </div>

      {/* Deletion Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-overlay flex items-center justify-center z-100 p-4"
        >
          <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] max-w-110 text-center">
            <div className="text-error-text mb-3">
              <AlertCircleIcon size={36} />
            </div>
            <h3 className="font-display rtl:font-arabic leading-[34px] font-bold text-[20px] mb-2">
              Confirm Irreversible Deletion
            </h3>
            <p className="text-[14px] text-muted mb-6">
              All private keystroke sessions and account credentials will be erased. Verification records will no longer show your name.
            </p>
            <div className="flex justify-center gap-3">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="inline-flex items-center justify-center gap-2 h-12 py-0 px-6 font-body rtl:font-arabic text-[16px] font-bold text-ink bg-surface border-2 border-border-control rounded-full cursor-pointer no-underline [transition:background-color_var(--motion-fast),_border-color_var(--motion-fast)] enabled:hover:bg-subtle enabled:hover:border-ink disabled:border-border-subtle disabled:text-disabled-text disabled:cursor-not-allowed">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Account deletion request acknowledged.');
                  setShowDeleteModal(false);
                }}
                className="inline-flex items-center justify-center gap-2 h-12 py-0 px-6 font-body rtl:font-arabic text-[16px] font-bold text-action-foreground border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none bg-error-text"
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
