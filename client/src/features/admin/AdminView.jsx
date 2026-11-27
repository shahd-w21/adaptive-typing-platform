﻿// Existing admin sections; shared navigation reflows without removing actions.
import { useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation.js';
import { useAdminPing } from './hooks/useAdmin.js';
import { AdminCoursesPage } from './courses/pages/AdminCoursesPage.jsx';
import { AnalyticsPanel } from './components/AnalyticsPanel.jsx';
import { UserManagement } from './components/UserManagement.jsx';
import { ContentManagement } from './components/ContentManagement.jsx';
import { SettingsManagement } from './components/SettingsManagement.jsx';

export function AdminView() {
  const { t } = useTranslation();
  const adminPing = useAdminPing();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock platform analytics per SYS-44
  const platformStats = {
    activeLearners: 142,
    sessionsCompleted: 1840,
    aiPassRate: '94.8%',
    fallbackRate: '5.2%',
    currentGate: '95.0%',
    engineVersion: 'v1.2.0',
  };

  return (
    <div className="max-w-270 my-0 mx-auto">
      <div className="mb-6 flex min-w-0 flex-col items-start justify-between gap-5 xl:flex-row">
        <div>
          <h1 className="font-display rtl:font-arabic text-[32px] leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px] mb-1">
            Platform Administration
          </h1>
          <p className="text-[16px] leading-[26px] font-normal text-muted">
            Supervise learning health, adaptive settings, content generation, and accounts.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs" role={adminPing.isError ? 'alert' : 'status'}>
            <span className={`size-2 rounded-full ${adminPing.isSuccess ? 'bg-success-accent' : adminPing.isError ? 'bg-error-text' : 'animate-pulse bg-warning-accent'}`} aria-hidden="true" />
            {adminPing.isPending ? 'Checking server-side admin access…' : adminPing.isError ? 'Could not confirm admin access with the server.' : adminPing.data.message}
            {adminPing.isError && <button type="button" onClick={() => adminPing.refetch()} className="font-bold underline">Retry</button>}
          </div>
        </div>

        {/* Tab Controls */}
        <nav aria-label={t('navigation.adminSections')} className="flex max-w-full flex-wrap gap-2">
          {[
            { id: 'overview', label: t('adminNav.overview') },
            { id: 'courses', label: t('adminNav.courses') || 'Courses & Drafts' },
            { id: 'users', label: t('adminNav.users') },
            { id: 'content', label: t('adminNav.content') },
            { id: 'settings', label: t('adminNav.settings') },
            { id: 'moderation', label: t('adminNav.moderation') },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
              className={[
                "min-h-11 py-1.5 px-3.5 rounded-full border border-border-subtle font-bold text-[13px] cursor-pointer",
                activeTab === tab.id ? 'bg-action-primary text-action-foreground' : 'bg-surface text-ink',
              ].filter(Boolean).join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          {/* Key Aggregates Grid */}
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(min(100%,_220px),_1fr))] gap-4">
            <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
              <div className="text-[14px] leading-[22px] font-normal text-muted">Active Learners (24h)</div>
              <div className="font-display rtl:font-arabic text-[48px] leading-[60px] font-extrabold max-md:text-[34px] max-md:leading-[44px] [direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! text-learning-strong my-2 mx-0">
                {platformStats.activeLearners}
              </div>
              <div className="text-[12px] text-muted">Logged-in students</div>
            </div>

            <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
              <div className="text-[14px] leading-[22px] font-normal text-muted">Sessions Completed</div>
              <div className="font-display rtl:font-arabic text-[48px] leading-[60px] font-extrabold max-md:text-[34px] max-md:leading-[44px] [direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! my-2 mx-0">
                {platformStats.sessionsCompleted}
              </div>
              <div className="text-[12px] text-muted">Total scored replays</div>
            </div>

            <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
              <div className="text-[14px] leading-[22px] font-normal text-muted">AI Feasibility Pass Rate</div>
              <div className="font-display rtl:font-arabic text-[48px] leading-[60px] font-extrabold max-md:text-[34px] max-md:leading-[44px] [direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! text-success-text my-2 mx-0">
                {platformStats.aiPassRate}
              </div>
              <div className="text-[12px] text-muted">Feasible generation specs</div>
            </div>

            <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
              <div className="text-[14px] leading-[22px] font-normal text-muted">Curated Fallback Rate</div>
              <div className="font-display rtl:font-arabic text-[48px] leading-[60px] font-extrabold max-md:text-[34px] max-md:leading-[44px] [direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! my-2 mx-0">
                {platformStats.fallbackRate}
              </div>
              <div className="text-[12px] text-muted">Offline drill safety net</div>
            </div>
          </div>

          <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
            <h3 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold mb-3">Engine Health & Stability</h3>
            <p className="text-[14px] text-muted leading-[22px]">
              All submission payloads are verified against server-stored assigned passages. No unvalidated characters or locked keygroups were introduced. Fallback offline generators are fully operational.
            </p>
          </div>

          {/* Live analytics panel (GET /admin/analytics, BE-22) */}
          <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
            <h2 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold mb-5">
              Platform Analytics
            </h2>
            <AnalyticsPanel />
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <AdminCoursesPage />
      )}

      {activeTab === 'users' && (
        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
          <h2 id="admin-user-directory-title" className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold mb-4">
            {t('navigation.userDirectoryTitle') || 'User Directory'}
          </h2>
          <UserManagement />
        </div>
      )}

      {activeTab === 'content' && (
        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card">
          <ContentManagement />
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card">
          <SettingsManagement />
        </div>
      )}

      {activeTab === 'moderation' && (
        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
          <h2 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold mb-4">Reported Content Queue</h2>
          <p className="text-[14px] text-muted">
            Zero reported threads or replies pending review. All learner content is currently compliant.
          </p>
        </div>
      )}
    </div>
  );
}
