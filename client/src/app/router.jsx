import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { RequireAuth } from '../components/RequireAuth.jsx';
import { RequireRole } from '../components/RequireRole.jsx';
import { PublicHeader } from '../components/layout/PublicHeader.jsx';
import { StudentShell } from '../components/layout/StudentShell.jsx';
import { DeviceGuidance } from '../components/layout/DeviceGuidance.jsx';
import { LandingPage, AuthModal, PublicCertificateVerification } from '../features/auth/AuthPages.jsx';
import { VerifyEmailPage } from '../features/auth/pages/VerifyEmailPage.jsx';
import { Dashboard } from '../features/dashboard/Dashboard.jsx';
import { LearningPath } from '../features/learning-path/LearningPath.jsx';
import { TypingSessionPage } from '../features/typing/pages/TypingSessionPage.jsx';
import { TestsView } from '../features/tests/TestsView.jsx';
import { ProgressView } from '../features/progress/ProgressView.jsx';
import { AchievementsView } from '../features/achievements/AchievementsView.jsx';
import { CertificatesView } from '../features/certificates/CertificatesView.jsx';
import { ForumView } from '../features/forum/ForumView.jsx';
import { AdminView } from '../features/admin/AdminView.jsx';
import { ProfileView } from '../features/profile/ProfileView.jsx';
import { CourseLibraryPage } from '../features/courses/pages/CourseLibraryPage.jsx';
import { CourseDetailPage } from '../features/courses/pages/CourseDetailPage.jsx';
import { MyCoursesPage } from '../features/courses/pages/MyCoursesPage.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useTranslation } from '../i18n/useTranslation.js';
import { abandonSession, startPracticeSession } from '../api/sessions.js';

const VIEW_PATHS = {
  landing: '/', dashboard: '/dashboard', path: '/learning-path', practice: '/practice',
  review: '/review', tests: '/tests', progress: '/progress', achievements: '/achievements',
  certificates: '/certificates', forum: '/forum', admin: '/admin', profile: '/profile',
  courses: '/courses', 'my-courses': '/my-courses', myCourses: '/my-courses',
  typing: '/typing', 'verify-cert': '/verify-certificate', login: '/login', register: '/register',
};
const PROTECTED_PATHS = new Set([
  '/dashboard', '/learning-path', '/path', '/practice', '/review', '/tests', '/progress',
  '/achievements', '/certificates', '/forum', '/admin', '/profile', '/typing',
  '/courses', '/my-courses',
]);

function routeForView(view) {
  return VIEW_PATHS[view] ?? '/';
}

function PublicLayout({ activeTab, children }) {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader activeTab={activeTab} onNavigate={view => navigate(routeForView(view))} />
      <main className="flex-1">{children}</main>
    </div>
  );
}

function LandingRoute() {
  const navigate = useNavigate();
  return (
    <PublicLayout activeTab="landing">
      <LandingPage onStartLearning={() => navigate('/register')} onLogin={() => navigate('/login')} />
    </PublicLayout>
  );
}

function CertificateVerificationRoute() {
  const navigate = useNavigate();
  return (
    <PublicLayout activeTab="verify-cert">
      <PublicCertificateVerification onBack={() => navigate('/')} />
    </PublicLayout>
  );
}

function EmailVerificationRoute() {
  const [params, setParams] = useSearchParams();
  return (
    <PublicLayout activeTab="landing">
      <VerifyEmailPage token={params.get('token') || ''} onVerified={() => setParams({}, { replace: true })} />
    </PublicLayout>
  );
}

function SessionError() {
  const { retrySession } = useAuth();
  const { t } = useTranslation();
  return (
    <div className="mx-auto my-6 flex max-w-xl items-center gap-4 rounded-card border border-error-text/25 bg-error-soft p-5 text-error-text" role="alert">
      <p className="flex-1">{t('auth.sessionFailed')}</p>
      <button type="button" onClick={() => retrySession()} className="font-bold underline">{t('common.retry')}</button>
    </div>
  );
}

function AuthRoute({ mode }) {
  const { status, user, signIn, signUp } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  if (status === 'loading') {
    return <main className="flex min-h-screen items-center justify-center bg-page text-muted" role="status">{t('auth.sessionLoading')}</main>;
  }
  if (status === 'authenticated') return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;

  const submit = async credentials => {
    if (mode === 'register') return signUp(credentials);
    const session = await signIn(credentials);
    const destination = location.state?.from?.pathname;
    navigate(destination?.startsWith('/') ? destination : (session.user.role === 'admin' ? '/admin' : '/dashboard'), { replace: true });
    return session;
  };

  return (
    <PublicLayout activeTab="landing">
      <LandingPage onStartLearning={() => navigate('/register')} onLogin={() => navigate('/login')} />
      {status === 'error' && <SessionError />}
      <AuthModal
        mode={mode}
        onClose={() => navigate('/')}
        onModeChange={nextMode => navigate(routeForView(nextMode), { replace: true })}
        onSubmit={submit}
      />
    </PublicLayout>
  );
}

function PracticeSetup({ onStart }) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-195">
      <h1 className="mb-2 font-display text-[32px] font-bold leading-[44px] max-md:text-[24px] max-md:leading-[32px]">{t('practice.title')}</h1>
      <p className="mb-6 text-muted">{t('practice.description')}</p>
      <div className="rounded-card border border-border-subtle bg-surface p-7 shadow-card">
        <h2 className="mb-2 font-display text-lg font-bold">{t('practice.cardTitle')}</h2>
        <p className="mb-5 text-sm text-muted">{t('practice.cardDescription')}</p>
        <button type="button" onClick={onStart} className="min-h-12 rounded-full bg-action-primary px-7 py-2 font-bold text-action-foreground shadow-primary hover:bg-action-hover">{t('practice.start')}</button>
      </div>
    </div>
  );
}

function ReviewSetup({ onStart }) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-195">
      <h1 className="mb-2 font-display text-[32px] font-bold leading-[44px] max-md:text-[24px] max-md:leading-[32px]">{t('review.title')}</h1>
      <p className="mb-6 text-muted">{t('review.description')}</p>
      <div className="rounded-card border border-border-subtle bg-surface p-7 shadow-card">
        <h2 className="mb-2 font-display text-lg font-bold">{t('review.cardTitle')}</h2>
        <p className="mb-5 text-sm text-muted">{t('review.cardDescription')}</p>
        <button type="button" onClick={onStart} className="min-h-12 rounded-full bg-action-primary px-7 py-2 font-bold text-action-foreground shadow-primary hover:bg-action-hover">{t('review.start')}</button>
      </div>
    </div>
  );
}

function AuthenticatedLayout({ activeSessionConfig, launchError, onClearSession, onNavigate, onLogout, onRetrySession, viewportWidth }) {
  const { user, csrfToken } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const isTypingRoute = location.pathname === '/typing';
  const fixtureRoutes = ['/review', '/tests', '/achievements', '/certificates', '/forum', '/admin'];
  const usesFixtureData = fixtureRoutes.includes(location.pathname);
  const showDeviceGuidance = isTypingRoute && viewportWidth < 1024;
  const exitSession = async () => {
    if (activeSessionConfig?.source === 'server') {
      try { await abandonSession(activeSessionConfig.sessionId, csrfToken); } catch { /* Completed, expired, or already abandoned sessions are already unavailable. */ }
    }
    onClearSession();
    onNavigate('dashboard');
  };

  if (isTypingRoute && !activeSessionConfig) return <Navigate to="/dashboard" replace />;

  return (
    <>
      <div hidden={isTypingRoute} aria-hidden={isTypingRoute}>
        {launchError && <div className="mx-auto my-4 max-w-4xl rounded-card border border-error-text/30 bg-error-soft p-4 text-error-text" role="alert">{launchError}</div>}
        <StudentShell
          activeTab={location.pathname === '/learning-path' || location.pathname === '/path' ? 'path' : location.pathname.slice(1)}
          onNavigate={onNavigate}
          onLogout={onLogout}
          user={user}
        >
          <>
            {usesFixtureData && <p className="mb-5 rounded-control border border-warning-accent/40 bg-warning-soft p-3 text-sm text-warning-text" role="note">{t(location.pathname === '/admin' ? 'common.adminFixtureNotice' : 'common.fixtureNotice')}</p>}
            <Outlet />
          </>
        </StudentShell>
      </div>
      {activeSessionConfig && (
        <div hidden={!isTypingRoute || showDeviceGuidance} aria-hidden={!isTypingRoute || showDeviceGuidance}>
          <TypingSessionPage
            key={activeSessionConfig.sessionId}
            sessionId={activeSessionConfig.sessionId}
            mode={activeSessionConfig.mode}
            assignedText={activeSessionConfig.assignedText}
            isFixture={activeSessionConfig.source !== 'server'}
            isActive={isTypingRoute && !showDeviceGuidance}
            onRetrySession={onRetrySession}
            onExit={exitSession}
          />
        </div>
      )}
      {showDeviceGuidance && (
        <div className="fixed inset-0 z-100 overflow-y-auto bg-page" role="dialog" aria-modal="true" aria-label="Desktop typing guidance">
          <DeviceGuidance onBack={exitSession} />
        </div>
      )}
    </>
  );
}

function NotFoundRoute() {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-6 text-ink">
      <section className="rounded-card border border-border-subtle bg-surface p-8 text-center shadow-card">
        <h1 className="mb-2 font-display text-2xl font-bold">{t('auth.notFoundTitle')}</h1>
        <p className="mb-5 text-muted">{t('auth.notFoundDescription')}</p>
        <Link to="/" className="font-bold text-action-link">{t('common.back')}</Link>
      </section>
    </main>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const { user, csrfToken, signOut } = useAuth();
  const [viewportWidth, setViewportWidth] = useState(() => typeof window === 'undefined' ? 1200 : window.innerWidth);
  const [activeSessionConfig, setActiveSessionConfig] = useState(null);
  const [launchError, setLaunchError] = useState('');

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', updateViewportWidth);
    return () => window.removeEventListener('resize', updateViewportWidth);
  }, []);

  const onNavigate = view => {
    const path = routeForView(view);
    if (!PROTECTED_PATHS.has(path) && path !== '/typing') setActiveSessionConfig(null);
    navigate(path);
  };

  const launchTyping = async config => {
    setLaunchError('');
    if (config.serverPractice) {
      try {
        const session = await startPracticeSession(csrfToken);
        setActiveSessionConfig({
          sessionId: session.sessionId,
          mode: 'Adaptive Practice',
          assignedText: session.text,
          source: 'server',
        });
        navigate('/typing');
      } catch (error) {
        setLaunchError(error.message || 'Practice could not be started. Retry in a moment.');
      }
      return;
    }
    setActiveSessionConfig({
      sessionId: `fixture-${Date.now()}`,
      mode: config.mode || 'Sample Practice',
      assignedText: config.assignedText || 'asdf jkl; asdf jkl; fdsa ;lkj asdf jkl; reed feed seek keel free',
      source: 'development-fixture',
    });
    navigate('/typing');
  };

  const handleLogout = async () => {
    if (activeSessionConfig?.source === 'server') {
      try { await abandonSession(activeSessionConfig.sessionId, csrfToken); } catch { /* The server may already have completed or expired the session. */ }
    }
    setActiveSessionConfig(null);
    navigate('/', { replace: true });
    try { await signOut(); } catch { /* Local session and protected cache are cleared in signOut's finally block. */ }
  };

  return (
    <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route path="/verify-certificate" element={<CertificateVerificationRoute />} />
      <Route path="/verify-cert" element={<Navigate to="/verify-certificate" replace />} />
      <Route path="/verify-email" element={<EmailVerificationRoute />} />
      <Route path="/login" element={<AuthRoute mode="login" />} />
      <Route path="/register" element={<AuthRoute mode="register" />} />

      <Route element={<RequireAuth />}>
        <Route element={<AuthenticatedLayout activeSessionConfig={activeSessionConfig} launchError={launchError} onClearSession={() => setActiveSessionConfig(null)} onNavigate={onNavigate} onLogout={handleLogout} onRetrySession={() => launchTyping({ serverPractice: true })} viewportWidth={viewportWidth} />}>
          <Route element={<RequireRole role="student" />}>
            <Route path="/dashboard" element={<Dashboard user={user} onStartPractice={() => launchTyping({ mode: 'Adaptive Practice', serverPractice: true })} onNavigate={onNavigate} />} />
            <Route path="/learning-path" element={<LearningPath onStartExercise={() => launchTyping({ mode: 'Adaptive Practice', serverPractice: true })} />} />
            <Route path="/path" element={<Navigate to="/learning-path" replace />} />
            <Route path="/practice" element={<PracticeSetup onStart={() => launchTyping({ mode: 'Adaptive Practice', serverPractice: true })} />} />
            <Route path="/review" element={<ReviewSetup onStart={() => launchTyping({ mode: 'Sample Review', assignedText: 'tree tree free free refer deter reader ferret' })} />} />
            <Route path="/tests" element={<TestsView onStartTimed={minutes => launchTyping({ mode: `Sample Timed Test (${minutes}m)`, assignedText: 'Touch typing requires muscle memory and disciplined finger placement. Keep your eyes on the screen and trust your hands.' })} onStartCertified={() => launchTyping({ mode: 'Sample Certified Test', assignedText: 'Touch typing requires muscle memory and disciplined finger placement. Keep your eyes on the screen and trust your hands.' })} />} />
            <Route path="/progress" element={<ProgressView />} />
            <Route path="/achievements" element={<AchievementsView />} />
            <Route path="/certificates" element={<CertificatesView onVerifyClick={() => onNavigate('verify-cert')} />} />
            <Route path="/forum" element={<ForumView />} />
            <Route path="/courses" element={<CourseLibraryPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
            <Route path="/my-courses" element={<MyCoursesPage />} />
            <Route path="/typing" element={null} />
          </Route>
          <Route element={<RequireRole role="admin" />}>
            <Route path="/admin" element={<AdminView />} />
          </Route>
          <Route element={<RequireRole role={['student', 'admin']} />}>
            <Route path="/profile" element={<ProfileView user={user} onAccountDeleted={() => navigate('/', { replace: true })} onPasswordChanged={() => navigate('/login', { replace: true })} />} />
          </Route>
          <Route path="/app" element={<Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  );
}

export function AppRouter() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}
