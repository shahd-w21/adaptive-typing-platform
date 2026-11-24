/**
 * Test-only Course Review Fixture (Tasks FE-07, FE-12, FE-22).
 * Exercises all course features with interactive fixtures, role switching,
 * locale toggling, and theme switching without needing a live backend database.
 */
import { useEffect, useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../src/context/authContext.js';
import { PreferencesContext } from '../../src/context/preferences.js';
import { AppearanceSelector } from '../../src/components/controls/AppearanceSelector.jsx';
import { LanguageSelector } from '../../src/components/controls/LanguageSelector.jsx';
import { CourseLibraryPage } from '../../src/features/courses/pages/CourseLibraryPage.jsx';
import { CourseDetailPage } from '../../src/features/courses/pages/CourseDetailPage.jsx';
import { MyCoursesPage } from '../../src/features/courses/pages/MyCoursesPage.jsx';
import { CoursePathPage } from '../../src/features/courses/pages/CoursePathPage.jsx';
import { AdminCoursesPage } from '../../src/features/admin/courses/pages/AdminCoursesPage.jsx';
import { CourseEditorPage } from '../../src/features/admin/courses/pages/CourseEditorPage.jsx';
import '../../src/index.css';

const STUDENT_USER = {
  id: '10000000-0000-4000-8000-000000000001',
  name: 'Layla Hassan',
  email: 'layla@example.test',
  role: 'student',
};

const ADMIN_USER = {
  id: 'u4',
  name: 'System Root',
  email: 'admin@typeflow.local',
  role: 'admin',
};

function FixtureNavBar({ currentRole, onToggleRole, activeSession, onSimulateCollision }) {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { label: 'Library (FE-07)', path: '/courses' },
    { label: 'Detail (FE-07)', path: '/courses/c-foundations-01' },
    { label: 'My Courses (FE-07)', path: '/my-courses' },
    { label: 'Course Path (FE-12)', path: '/courses/c-foundations-01/path' },
    { label: 'Admin Courses (FE-22)', path: '/admin/courses' },
    { label: 'New Draft (FE-22)', path: '/admin/courses/new' },
    { label: 'Edit Draft (FE-22)', path: '/admin/courses/c-draft-code-01/edit' },
  ];

  return (
    <nav className="border-b border-border-subtle bg-surface px-4 py-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display font-black text-ink text-sm">Dev 4 Review:</span>
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.path}
                type="button"
                onClick={() => navigate(link.path)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-learning-accent text-white font-bold'
                    : 'bg-page text-muted hover:bg-subtle hover:text-ink'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onToggleRole}
            className="rounded-full border border-border-control bg-page px-3 py-1 text-xs font-bold text-ink hover:bg-subtle"
          >
            Role: <span className="text-learning-strong">{currentRole.toUpperCase()}</span> (Switch)
          </button>
          <button
            type="button"
            onClick={onSimulateCollision}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              activeSession
                ? 'bg-warning-soft text-warning-text border border-warning-border'
                : 'border border-border-control text-muted hover:text-ink'
            }`}
            title="Toggle a mock active session from another course to test the collision guard"
          >
            {activeSession ? '⚡ Active Session Running (Simulated)' : '⚡ Simulate Other Running Session'}
          </button>
          <AppearanceSelector />
          <LanguageSelector />
        </div>
      </div>
    </nav>
  );
}

export function CoursesFixtureApp() {
  const [uiLocale, setUiLocale] = useState('en');
  const [themePreference, setThemePreference] = useState('light');
  const [role, setRole] = useState('student');
  const [activeSession, setActiveSession] = useState(null);
  const [launchedExercise, setLaunchedExercise] = useState(null);

  useEffect(() => {
    document.documentElement.lang = uiLocale;
    document.documentElement.dir = uiLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dataset.theme = themePreference;
  }, [uiLocale, themePreference]);

  const currentUser = role === 'admin' ? ADMIN_USER : STUDENT_USER;

  const authContextValue = useMemo(
    () => ({
      user: currentUser,
      status: 'authenticated',
      csrfToken: 'mock-csrf-token',
      signOut: async () => {},
    }),
    [currentUser]
  );

  const preferencesContextValue = useMemo(
    () => ({
      uiLocale,
      isRTL: uiLocale === 'ar',
      dir: uiLocale === 'ar' ? 'rtl' : 'ltr',
      setUiLocale,
      themePreference,
      setThemePreference,
    }),
    [uiLocale, themePreference]
  );

  const handleStartLesson = (lesson, context) => {
    setLaunchedExercise({
      lesson,
      context,
      launchedAt: new Date().toLocaleTimeString(),
    });
  };

  const handleSimulateCollision = () => {
    if (activeSession) {
      setActiveSession(null);
    } else {
      setActiveSession({
        sessionId: 'session-speed-exercise-99',
        mode: 'Speed & Fluency Drill',
        assignedText: 'the and tha for with this that from they',
        courseId: 'c-speed-01',
        lessonId: 'l-speed-101',
        enrollmentId: 'enr-speed-01',
      });
    }
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <PreferencesContext.Provider value={preferencesContextValue}>
        <div className="min-h-screen bg-page text-ink flex flex-col font-sans">
          <FixtureNavBar
            currentRole={role}
            onToggleRole={() => setRole((r) => (r === 'admin' ? 'student' : 'admin'))}
            activeSession={activeSession}
            onSimulateCollision={handleSimulateCollision}
          />

          {launchedExercise && (
            <div className="m-4 rounded-card border-2 border-learning-accent bg-learning-soft p-4 shadow-sm flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-learning-strong text-sm">
                  🚀 Lesson Typing Session Launched (Context Validated)
                </p>
                <p className="text-xs text-ink mt-0.5">
                  Lesson: <span className="font-semibold">{launchedExercise.lesson.title}</span> |
                  Course ID: <span className="font-mono">{launchedExercise.context.courseId}</span> |
                  Enrollment ID: <span className="font-mono">{launchedExercise.context.enrollmentId}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLaunchedExercise(null)}
                className="rounded-full bg-learning-accent px-3 py-1 text-xs font-bold text-white hover:opacity-90"
              >
                Dismiss
              </button>
            </div>
          )}

          <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<CourseLibraryPage />} />
              <Route path="/courses" element={<CourseLibraryPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailPage />} />
              <Route path="/my-courses" element={<MyCoursesPage />} />
              <Route
                path="/courses/:courseId/path"
                element={
                  <CoursePathPage
                    onStartLesson={handleStartLesson}
                    activeSession={activeSession}
                    onAbandonActiveSession={() => setActiveSession(null)}
                  />
                }
              />
              <Route path="/admin/courses" element={<AdminCoursesPage />} />
              <Route path="/admin/courses/new" element={<CourseEditorPage isNew={true} />} />
              <Route path="/admin/courses/:courseId/edit" element={<CourseEditorPage />} />
              <Route
                path="*"
                element={
                  <div className="p-8 text-center">
                    <p className="text-lg font-bold">Route not recognized in fixture</p>
                    <Link to="/courses" className="mt-2 inline-block text-learning-accent underline">
                      Go to Courses
                    </Link>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </PreferencesContext.Provider>
    </AuthContext.Provider>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30000,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter basename="/tests/fixtures/courses.html">
      <CoursesFixtureApp />
    </BrowserRouter>
  </QueryClientProvider>
);
