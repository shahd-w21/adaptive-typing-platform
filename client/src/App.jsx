import { useState, useEffect } from 'react';
import { PreferencesProvider } from './context/PreferencesContext.jsx';
import { PublicHeader } from './components/layout/PublicHeader.jsx';
import { StudentShell } from './components/layout/StudentShell.jsx';
import { DeviceGuidance } from './components/layout/DeviceGuidance.jsx';
import { LandingPage, AuthModal, PublicCertificateVerification } from './features/auth/AuthPages.jsx';
import { Dashboard } from './features/dashboard/Dashboard.jsx';
import { LearningPath } from './features/learning-path/LearningPath.jsx';
import { TypingSessionPage } from './features/typing/pages/TypingSessionPage.jsx';
import { TestsView } from './features/tests/TestsView.jsx';
import { ProgressView } from './features/progress/ProgressView.jsx';
import { AchievementsView } from './features/achievements/AchievementsView.jsx';
import { CertificatesView } from './features/certificates/CertificatesView.jsx';
import { ForumView } from './features/forum/ForumView.jsx';
import { AdminView } from './features/admin/AdminView.jsx';
import { ProfileView } from './features/profile/ProfileView.jsx';
import './App.css';

function TypeFlowApp() {
  // Navigation & User session state
  const [currentUser, setCurrentUser] = useState({
    name: 'Layla M.',
    email: 'layla@example.com',
    role: 'Student',
    streak: 5,
    xp: 1420,
    level: 3,
  });

  const [currentView, setCurrentView] = useState('dashboard'); // 'landing' | 'dashboard' | 'path' | 'tests' | 'progress' | 'achievements' | 'certificates' | 'forum' | 'admin' | 'profile' | 'typing' | 'verify-cert'
  const [authModalMode, setAuthModalMode] = useState(null); // 'login' | 'register' | null
  const [activeSessionConfig, setActiveSessionConfig] = useState(null);

  // Viewport width tracker for desktop touch-typing boundary (SYS-55)
  const [viewportWidth, setViewportWidth] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 1200;
  });

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Launch a typing session (enforcing desktop physical QWERTY boundary)
  const handleLaunchTyping = (config = {}) => {
    const defaultConfig = {
      sessionId: `session-${Date.now()}`,
      mode: config.mode || 'Adaptive Practice',
      assignedText: config.assignedText || 'asdf jkl; asdf jkl; fdsa ;lkj asdf jkl; reed feed seek keel free',
    };

    setActiveSessionConfig(defaultConfig);
    setCurrentView('typing');
  };

  // Exit typing back to student dashboard
  const handleExitTyping = () => {
    setActiveSessionConfig(null);
    setCurrentView('dashboard');
  };

  // 1. ACTIVE TYPING STAGE IN STUDY SHELL
  if (currentView === 'typing') {
    // If screen width is below 1024 CSS pixels, present desktop guidance per SRS SYS-55
    if (viewportWidth < 1024) {
      return (
        <DeviceGuidance onBack={handleExitTyping} />
      );
    }

    return (
      <TypingSessionPage
        sessionId={activeSessionConfig?.sessionId || 'session-101'}
        mode={activeSessionConfig?.mode || 'Adaptive Practice'}
        assignedText={activeSessionConfig?.assignedText}
        onExit={handleExitTyping}
      />
    );
  }

  // 2. PUBLIC LANDING & GUEST VIEWS
  if (currentView === 'landing' || (!currentUser && currentView !== 'verify-cert')) {
    return (
      <div style={{ minHgeiht: '100vh', display: 'flex', flexDirection: 'column' }}>
        <PublicHeader
          activeTab={currentView}
          onNavigate={(view) => {
            if (view === 'login') setAuthModalMode('login');
            else if (view === 'register') setAuthModalMode('register');
            else setCurrentView(view);
          }}
        />

        <main style={{ flex: 1 }}>
          <LandingPage
            onStartLearning={() => {
              if (currentUser) {
                setCurrentView('dashboard');
              } else {
                setAuthModalMode('register');
              }
            }}
            onLogin={() => setAuthModalMode('login')}
            onVerifyCert={() => setCurrentView('verify-cert')}
          />
        </main>

        {authModalMode && (
          <AuthModal
            mode={authModalMode}
            onClose={() => setAuthModalMode(null)}
            onSuccess={(user) => {
              setCurrentUser(user);
              setAuthModalMode(null);
              setCurrentView('dashboard');
            }}
          />
        )}
      </div>
    );
  }

  // 3. PUBLIC CERTIFICATE VERIFICATION VIEW
  if (currentView === 'verify-cert') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <PublicHeader
          activeTab="verify-cert"
          onNavigate={(view) => {
            if (view === 'login') setAuthModalMode('login');
            else if (view === 'register') setAuthModalMode('register');
            else setCurrentView(view);
          }}
        />
        <main style={{ flex: 1 }}>
          <PublicCertificateVerification onBack={() => setCurrentView('landing')} />
        </main>
      </div>
    );
  }

  // 4. STUDENT & ADMIN AUTHENTICATED VIEWS
  return (
    <StudentShell
      activeTab={currentView}
      onNavigate={setCurrentView}
      user={currentUser}
    >
      {currentView === 'dashboard' && (
        <Dashboard
          onStartPractice={() => handleLaunchTyping({ mode: 'Adaptive Practice' })}
          onNavigate={setCurrentView}
        />
      )}

      {currentView === 'path' && (
        <LearningPath
          onStartExercise={(node) =>
            handleLaunchTyping({
              mode: `Lesson · ${node.title}`,
              assignedText: 'asdf jkl; asdf jkl; reed feed seek keel free real lead dark lake',
            })
          }
        />
      )}

      {currentView === 'practice' && (
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h1 className="text-heading-page" style={{ marginBottom: '8px' }}>Adaptive Practice Setup</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            The engine customises your exercise based on recent key errors and letter-pair latencies.
          </p>
          <div className="surface-card" style={{ padding: '28px' }}>
            <h2 className="text-heading-section" style={{ fontSize: '18px', marginBottom: '8px' }}>
              Weakness Focus: Keys E, I, P
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Targeting top-row finger transitions. Spaces and baseline home-row characters are included.
            </p>
            <button
              type="button"
              onClick={() => handleLaunchTyping({ mode: 'Adaptive Practice' })}
              className="btn-primary"
              style={{ height: '48px', padding: '0 28px' }}
            >
              Start Adaptive Session
            </button>
          </div>
        </div>
      )}

      {currentView === 'review' && (
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h1 className="text-heading-page" style={{ marginBottom: '8px' }}>Spaced Memory Review</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            Periodic reviews ensure long-term retention of previously mastered keys.
          </p>
          <div className="surface-card" style={{ padding: '28px' }}>
            <h2 className="text-heading-section" style={{ fontSize: '18px', marginBottom: '8px' }}>
              Overdue Review: 3 Keys (E, R, T)
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Pass threshold: $\ge 97\%$ raw accuracy and latency within 1.2× your target speed.
            </p>
            <button
              type="button"
              onClick={() => handleLaunchTyping({ mode: 'Spaced Review', assignedText: 'tree tree free free refer deter reader ferret' })}
              className="btn-primary"
              style={{ height: '48px', padding: '0 28px' }}
            >
              Begin Spaced Review
            </button>
          </div>
        </div>
      )}

      {currentView === 'tests' && (
        <TestsView
          onStartTimed={(minutes) =>
            handleLaunchTyping({
              mode: `Timed Test (${minutes}m)`,
              assignedText: 'Touch typing requires muscle memory and disciplined finger placement. Keep your eyes on the screen and trust your hands.',
            })
          }
          onStartCertified={() =>
            handleLaunchTyping({
              mode: 'Certified Performance Test',
              assignedText: 'Touch typing requires muscle memory and disciplined finger placement. Keep your eyes on the screen and trust your hands. Fast typists do not look down at the keyboard.',
            })
          }
        />
      )}

      {currentView === 'progress' && <ProgressView />}

      {currentView === 'achievements' && <AchievementsView />}

      {currentView === 'certificates' && (
        <CertificatesView
          onVerifyClick={() => {
            setCurrentView('verify-cert');
          }}
        />
      )}

      {currentView === 'forum' && <ForumView />}

      {currentView === 'admin' && <AdminView />}

      {currentView === 'profile' && <ProfileView />}
    </StudentShell>
  );
}

export default function App() {
  return (
    <PreferencesProvider>
      <TypeFlowApp />
    </PreferencesProvider>
  );
}
