import { useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation.js';

export function AdminView() {
  const { isRTL } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'settings' | 'moderation'

  // Mock platform analytics per SYS-44
  const platformStats = {
    activeLearners: 142,
    sessionsCompleted: 1840,
    aiPassRate: '94.8%',
    fallbackRate: '5.2%',
    currentGate: '95.0%',
    engineVersion: 'v1.2.0',
  };

  const users = [
    { id: 'u1', name: 'Omar S.', email: 'omar@example.com', role: 'Admin', status: 'Active', isLastAdmin: false },
    { id: 'u2', name: 'Layla M.', email: 'layla@example.com', role: 'Student', status: 'Active', isLastAdmin: false },
    { id: 'u3', name: 'Karim D.', email: 'karim@example.com', role: 'Student', status: 'Active', isLastAdmin: false },
    { id: 'u4', name: 'System Root', email: 'admin@typeflow.edu', role: 'Admin', status: 'Active', isLastAdmin: true },
  ];

  return (
    <div className="max-w-270 my-0 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display rtl:font-arabic text-[32px] leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px] mb-1">
            Platform Administration
          </h1>
          <p className="text-[16px] leading-[26px] font-normal text-muted">
            Supervise learning health, adaptive settings, content generation, and accounts.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2">
          {[
            { id: 'overview', label: 'Analytics' },
            { id: 'users', label: 'Users' },
            { id: 'settings', label: 'Learning Settings' },
            { id: 'moderation', label: 'Moderation' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "py-1.5 px-3.5 rounded-full border border-border-subtle font-bold text-[13px] cursor-pointer",
                activeTab === tab.id ? 'bg-action-primary text-action-foreground' : 'bg-surface text-ink',
              ].filter(Boolean).join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          {/* Key Aggregates Grid */}
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(220px,_1fr))] gap-4">
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
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)]">
          <h2 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold mb-4">User Directory</h2>

          <table className={[
                   "w-full border-collapse",
                   isRTL ? 'text-right' : 'text-left',
                 ].filter(Boolean).join(' ')}>
            <thead>
              <tr className="border-b-2 border-b-border-subtle text-muted text-[13px]">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-b-border-subtle text-[14px]">
                  <td className="p-3 font-bold">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <span
                      className={[
                        "py-0.5 px-2 rounded-full text-[12px] font-bold",
                        u.role === 'Admin' ? 'bg-learning-soft text-learning-strong' : 'bg-subtle text-ink',
                      ].filter(Boolean).join(' ')}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-success-text">{u.status}</td>
                  <td className="p-3">
                    {u.isLastAdmin ? (
                      <span className="text-[12px] text-muted italic">
                        Protected (Last Admin)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => alert(`Deactivating ${u.name}...`)}
                        className="bg-transparent border-0 text-error-text font-bold text-[13px] cursor-pointer"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] max-w-160">
          <h2 className="font-display rtl:font-arabic text-[20px] leading-[30px] font-bold mb-2">Versioned Learning Settings</h2>
          <p className="text-[14px] text-muted mb-5">
            Changes create a new immutable version for future sessions without altering completed histories.
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[14px] font-bold mb-1.5">
                Raw Accuracy Gate (% required to increase difficulty)
              </label>
              <input type="number" defaultValue={95} min={80} max={99} className="h-12 py-0 px-4 font-body rtl:font-arabic text-[16px] text-ink bg-surface border-2 border-border-control rounded-control [transition:border-color_var(--motion-fast),_box-shadow_var(--motion-fast)] focus:outline-none focus:border-focus-ring focus:shadow-[0_0_0_3px_rgba(6,_102,_223,_0.2)] w-30"  />
            </div>

            <div>
              <label className="block text-[14px] font-bold mb-1.5">
                Difficulty Reduction Threshold (drops difficulty if below)
              </label>
              <input type="number" defaultValue={90} min={70} max={94} className="h-12 py-0 px-4 font-body rtl:font-arabic text-[16px] text-ink bg-surface border-2 border-border-control rounded-control [transition:border-color_var(--motion-fast),_box-shadow_var(--motion-fast)] focus:outline-none focus:border-focus-ring focus:shadow-[0_0_0_3px_rgba(6,_102,_223,_0.2)] w-30"  />
            </div>

            <div>
              <label className="block text-[14px] font-bold mb-1.5">
                Maximum Initial Latency Cutoff (ms)
              </label>
              <input type="number" defaultValue={2000} className="h-12 py-0 px-4 font-body rtl:font-arabic text-[16px] text-ink bg-surface border-2 border-border-control rounded-control [transition:border-color_var(--motion-fast),_box-shadow_var(--motion-fast)] focus:outline-none focus:border-focus-ring focus:shadow-[0_0_0_3px_rgba(6,_102,_223,_0.2)] w-40"  />
            </div>

            <button
              type="button"
              onClick={() => alert('New immutable version activated: v1.3.0')}
              className="inline-flex items-center justify-center gap-2 h-12 py-0 px-6 font-body rtl:font-arabic text-[16px] font-bold text-action-foreground bg-action-primary border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none self-start mt-3"
            >
              Activate New Version
            </button>
          </div>
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
