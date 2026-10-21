import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePreferences } from '../../context/preferences.js';
import { useTranslation } from '../../i18n/useTranslation.js';
import { SunIcon, MoonIcon, MonitorIcon, AlertCircleIcon } from '../../components/ui/Icons.jsx';
import { changeMyPassword, deleteMyAccount, updateMyProfile } from '../../api/users.js';
import { useAuth } from '../../hooks/useAuth.js';
import { changePasswordSchema } from '@typeflow/shared';
import { queryKeys } from '../../lib/queryKeys.js';

export function ProfileView({ user, onAccountDeleted, onPasswordChanged }) {
  const { csrfToken, updateUser, clearSession } = useAuth();
  const queryClient = useQueryClient();
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

  const [targetWpm, setTargetWpm] = useState(user?.targetWpm ?? 60);
  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [profileStatus, setProfileStatus] = useState('idle');
  const [profileError, setProfileError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('idle');
  const [passwordError, setPasswordError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteStatus, setDeleteStatus] = useState('idle');
  const [deleteError, setDeleteError] = useState('');

  const saveProfile = async () => {
    setProfileStatus('saving');
    setProfileError('');
    try {
      const { user: updatedUser } = await updateMyProfile({ name: displayName.trim() || null, targetWpm }, csrfToken);
      updateUser(updatedUser);
      // Profile targets affect dashboard/reward displays. Refresh only this
      // account's cached summaries after the server confirms the saved values.
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(user.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.gamification(user.id) });
      setDisplayName(updatedUser.name ?? '');
      setTargetWpm(updatedUser.targetWpm);
      setProfileStatus('saved');
    } catch {
      setProfileStatus('error');
      setProfileError(t('profile.saveFailed'));
    }
  };

  const savePassword = async event => {
    event.preventDefault();
    setPasswordError('');
    if (newPassword !== confirmNewPassword) {
      setPasswordStatus('error');
      setPasswordError(t('profile.passwordMismatch'));
      return;
    }
    const parsed = changePasswordSchema.safeParse({ currentPassword, newPassword, confirmPassword: confirmNewPassword });
    if (!parsed.success) {
      setPasswordStatus('error');
      setPasswordError(parsed.error.issues[0]?.message || t('profile.passwordChangeFailed'));
      return;
    }
    setPasswordStatus('saving');
    try {
      await changeMyPassword(parsed.data, csrfToken);
      setPasswordStatus('saved');
      await clearSession();
      onPasswordChanged?.();
    } catch {
      setPasswordStatus('error');
      setPasswordError(t('profile.passwordChangeFailed'));
    }
  };

  const removeAccount = async () => {
    setDeleteStatus('deleting');
    setDeleteError('');
    try {
      await deleteMyAccount(deletePassword, csrfToken);
      onAccountDeleted?.();
      await clearSession();
    } catch {
      setDeleteStatus('error');
      setDeleteError(t('profile.deleteFailed'));
    }
  };

  return (
    <div className="max-w-195 my-0 mx-auto">
      <h1 className="font-display rtl:font-arabic text-[32px] leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px] mb-2">
        {t('profile.title')}
      </h1>
      <p className="text-[16px] leading-[26px] font-normal text-muted mb-8">
        {t('profile.description')}
      </p>

      {/* Account Info Card */}
      <div className="bg-surface border border-border-subtle rounded-card p-4 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] mb-6 sm:p-6">
        <h2 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold mb-4">{t('profile.account')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[13px] font-bold mb-1.5" htmlFor="profile-display-name">{t('profile.displayName')}</label>
            <input id="profile-display-name" type="text" className="w-full h-12 py-0 px-4 font-body rtl:font-arabic text-[16px] text-ink bg-surface border-2 border-border-control rounded-control [transition:border-color_var(--motion-fast),_box-shadow_var(--motion-fast)] focus:outline-none focus:border-focus-ring focus:shadow-[0_0_0_3px_rgba(6,_102,_223,_0.2)]" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div>
            <label className="block text-[13px] font-bold mb-1.5" htmlFor="profile-email">{t('profile.email')}</label>
            <input id="profile-email" type="email" disabled className="w-full h-12 py-0 px-4 font-body rtl:font-arabic text-[16px] text-ink bg-surface border-2 border-border-control rounded-control [transition:border-color_var(--motion-fast),_box-shadow_var(--motion-fast)] focus:outline-none focus:border-focus-ring focus:shadow-[0_0_0_3px_rgba(6,_102,_223,_0.2)] opacity-70" value={user?.email ?? ''} readOnly />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={saveProfile} disabled={profileStatus === 'saving'} className="rounded-full bg-action-primary px-5 py-3 font-bold text-action-foreground disabled:opacity-60">
            {profileStatus === 'saving' ? t('profile.saving') : t('profile.saveAccount')}
          </button>
          {profileStatus === 'saved' && <span role="status" className="text-success-text">{t('profile.saved')}</span>}
          {profileError && <span role="alert" className="text-error-text">{profileError}</span>}
        </div>
      </div>

      <form onSubmit={savePassword} className="mb-6 rounded-card border border-border-subtle bg-surface p-4 shadow-card sm:p-6">
        <h2 className="mb-4 font-display text-xl font-bold">{t('profile.changePassword')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-bold" htmlFor="current-password">{t('profile.currentPassword')}</label>
            <input id="current-password" type="password" autoComplete="current-password" required value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} className="h-12 w-full rounded-control border-2 border-border-control bg-surface px-4 text-ink focus:border-focus-ring focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold" htmlFor="new-password">{t('profile.newPassword')}</label>
            <input id="new-password" type="password" autoComplete="new-password" required value={newPassword} onChange={event => setNewPassword(event.target.value)} className="h-12 w-full rounded-control border-2 border-border-control bg-surface px-4 text-ink focus:border-focus-ring focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold" htmlFor="confirm-new-password">{t('profile.confirmPassword')}</label>
            <input id="confirm-new-password" type="password" autoComplete="new-password" required value={confirmNewPassword} onChange={event => setConfirmNewPassword(event.target.value)} className="h-12 w-full rounded-control border-2 border-border-control bg-surface px-4 text-ink focus:border-focus-ring focus:outline-none" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={passwordStatus === 'saving'} className="rounded-full bg-action-primary px-5 py-3 font-bold text-action-foreground disabled:opacity-60">{passwordStatus === 'saving' ? t('profile.updatingPassword') : t('profile.changePassword')}</button>
          {passwordStatus === 'saved' && <span role="status" className="text-success-text">{t('profile.passwordChanged')}</span>}
          {passwordError && <span role="alert" className="text-error-text">{passwordError}</span>}
        </div>
      </form>

      {/* Appearance & Language Card */}
      <div className="bg-surface border border-border-subtle rounded-card p-4 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] mb-6 sm:p-6">
        <h2 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold mb-4">{t('profile.appearanceLanguage')}</h2>

        {/* Theme Radios */}
        <div className="mb-5">
          <span className="text-[14px] font-bold block mb-2">
            {t('profile.colorMode')}
          </span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { id: 'light', label: t('preferences.light'), icon: SunIcon },
              { id: 'dark', label: t('preferences.dark'), icon: MoonIcon },
              { id: 'system', label: t('preferences.system'), icon: MonitorIcon },
            ].map((theme) => {
              const Icon = theme.icon;
              const isSelected = themePreference === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  aria-pressed={isSelected}
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
            {t('profile.interfaceLanguage')}
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              aria-pressed={uiLocale === 'en'}
              onClick={() => setUiLocale('en')}
              className={[
                "flex-1 p-3 rounded-control border-2 font-bold cursor-pointer",
                uiLocale === 'en' ? 'border-learning-accent bg-learning-soft text-learning-strong' : 'border-border-subtle bg-surface text-ink',
              ].filter(Boolean).join(' ')}
            >
              {t('preferences.langEn')}
            </button>
            <button
              type="button"
              aria-pressed={uiLocale === 'ar'}
              onClick={() => setUiLocale('ar')}
              className={[
                "flex-1 p-3 rounded-control border-2 font-bold cursor-pointer",
                uiLocale === 'ar' ? 'border-learning-accent bg-learning-soft text-learning-strong' : 'border-border-subtle bg-surface text-ink',
              ].filter(Boolean).join(' ')}
            >
              {t('preferences.langAr')}
            </button>
          </div>
          <p className="text-[12px] text-muted mt-2">
            {t('preferences.langHelper')}
          </p>
        </div>
      </div>

      {/* Typing & Accessibility Settings Card */}
      <div className="bg-surface border border-border-subtle rounded-card p-4 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] mb-6 sm:p-6">
        <h2 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold mb-4">{t('profile.typingSettings')}</h2>

        <div className="mb-5">
          <div className="flex justify-between mb-1.5">
            <label className="text-[14px] font-bold" htmlFor="target-wpm">{t('profile.targetWpm')}</label>
            <span className="[direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! font-extrabold text-learning-strong">
              {targetWpm} WPM
            </span>
          </div>
          <input
            type="range"
            id="target-wpm"
            min="20"
            max="120"
            step="5"
            value={targetWpm}
            onChange={(e) => setTargetWpm(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-[12px] text-muted mt-1">
            {t('profile.targetHelp')}
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="font-bold text-[14px]">{t('profile.largeText')}</div>
              <div className="text-[12px] text-muted">{t('profile.largeTextHelp')}</div>
            </div>
            <input type="checkbox" checked={largeText} onChange={(e) => setLargeText(e.target.checked)} />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="font-bold text-[14px]">{t('profile.reducedPressure')}</div>
              <div className="text-[12px] text-muted">{t('profile.reducedPressureHelp')}</div>
            </div>
            <input type="checkbox" checked={reducedPressure} onChange={(e) => setReducedPressure(e.target.checked)} />
          </label>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-surface border rounded-card p-4 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] border-error-text mb-6 sm:p-6">
        <h2 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold text-error-text mb-2">
          {t('profile.danger')}
        </h2>
        <p className="text-[13px] text-muted mb-4">
          {t('profile.deleteDescription')}
        </p>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center justify-center gap-2 py-0 px-6 font-body rtl:font-arabic font-bold text-action-foreground border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none bg-error-text h-10.5 text-[14px]"
        >
          {t('profile.deleteAccount')}
        </button>
      </div>

      {/* Deletion Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-overlay p-4 sm:p-6"
        >
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-account-title" className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-110 overflow-y-auto rounded-card border border-border-subtle bg-surface p-5 text-center shadow-card sm:p-6">
            <div className="text-error-text mb-3">
              <AlertCircleIcon size={36} />
            </div>
            <h3 id="delete-account-title" className="font-display rtl:font-arabic leading-[34px] font-bold text-[20px] mb-2">
              {t('profile.confirmDelete')}
            </h3>
            <p className="text-[14px] text-muted mb-6">
              {t('profile.deletePrompt')}
            </p>
            <label className="mb-4 block text-start text-sm font-bold" htmlFor="delete-account-password">{t('profile.password')}</label>
            <input id="delete-account-password" type="password" autoComplete="current-password" value={deletePassword} onChange={event => setDeletePassword(event.target.value)} className="mb-4 h-12 w-full rounded-control border-2 border-border-control bg-surface px-4 text-ink focus:border-focus-ring focus:outline-none" />
            {deleteError && <p className="mb-4 text-start text-sm text-error-text" role="alert">{deleteError}</p>}
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="inline-flex items-center justify-center gap-2 h-12 py-0 px-6 font-body rtl:font-arabic text-[16px] font-bold text-ink bg-surface border-2 border-border-control rounded-full cursor-pointer no-underline [transition:background-color_var(--motion-fast),_border-color_var(--motion-fast)] enabled:hover:bg-subtle enabled:hover:border-ink disabled:border-border-subtle disabled:text-disabled-text disabled:cursor-not-allowed">
                {t('common.cancel')}
              </button>
              <button
                type="button"
                  onClick={removeAccount}
                  disabled={!deletePassword || deleteStatus === 'deleting'}
                className="inline-flex items-center justify-center gap-2 h-12 py-0 px-6 font-body rtl:font-arabic text-[16px] font-bold text-action-foreground border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none bg-error-text"
              >
                {deleteStatus === 'deleting' ? t('profile.deleting') : t('profile.deleteAction')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
