// Test-only forum host: real components/query lifecycle, disposable data, no backend calls.
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '../../src/context/authContext.js';
import { PreferencesContext } from '../../src/context/preferences.js';
import { AppearanceSelector } from '../../src/components/controls/AppearanceSelector.jsx';
import { LanguageSelector } from '../../src/components/controls/LanguageSelector.jsx';
import { ForumView } from '../../src/features/forum/ForumView.jsx';
import { createForumFixture } from '../../src/mocks/forum.js';
import '../../src/index.css';

const params = new URLSearchParams(window.location.search);
const user = { id: 'forum-reviewer', name: 'Layla (You)', role: 'student' };
const api = createForumFixture({
  user,
  empty: params.has('empty'),
  readOnly: params.has('readOnly'),
  delay: params.has('slow') ? 900 : 200,
});
if (params.has('failList')) {
  api.failNext('list');
}
if (params.has('failDetail')) {
  api.failNext('detail', { code: 'NOT_FOUND' });
}
if (params.has('hiddenDetail')) {
  // Deliberately malformed visibility payload verifies the renderer's defense too.
  api.detail = async () => ({
    id: 't1',
    status: 'hidden',
    title: 'SHOULD_NOT_RENDER',
    body: 'SHOULD_NOT_RENDER',
    author: 'SHOULD_NOT_RENDER',
    permissions: { canReply: true, canReport: true },
    replies: [],
  });
}
// Exposed only by this test entry, never by application modules.
window.forumFixture = api;
const queryClient = new QueryClient();

/** Preserve the same forum instance/draft through real preference menu changes. */
export function ForumFixture() {
  const [uiLocale, setUiLocale] = useState(params.get('locale') || 'en');
  const [themePreference, setThemePreference] = useState(params.get('theme') || 'light');

  useEffect(() => {
    document.documentElement.lang = uiLocale;
    document.documentElement.dir = uiLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dataset.theme = themePreference;
  }, [uiLocale, themePreference]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext value={{ user }}>
        <PreferencesContext value={{
          uiLocale,
          isRTL: uiLocale === 'ar',
          dir: uiLocale === 'ar' ? 'rtl' : 'ltr',
          setUiLocale,
          themePreference,
          setThemePreference,
        }}>
          <header className="flex flex-wrap justify-end gap-3 p-4">
            <AppearanceSelector />
            <LanguageSelector />
          </header>
          <main id="main-content" tabIndex={-1} className="min-h-screen bg-page p-4 text-ink">
            <ForumView api={params.has('defaultAdapter') ? undefined : api} />
          </main>
        </PreferencesContext>
      </AuthContext>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById('root')).render(<ForumFixture />);
