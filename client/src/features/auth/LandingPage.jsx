/** Starter public landing: explains learning without fetching or inventing student data. */
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation.js';
import {
  ArrowRightIcon,
  KeyboardIcon,
  CheckIcon,
} from '../../components/ui/Icons.jsx';
import { BrandLogo } from '../../components/ui/BrandLogo.jsx';
import { AppearanceSelector } from '../../components/controls/AppearanceSelector.jsx';
import { LanguageSelector } from '../../components/controls/LanguageSelector.jsx';

const keyboardRows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const learningSteps = ['practice', 'result', 'next'];

/** Decorative desktop QWERTY illustration; it never captures keys or starts a session. */
function PracticeIllustration({ t }) {
  return (
    <figure className="landing-example">
      <figcaption className="landing-example-label">{t('landing.exampleLabel')}</figcaption>
      <svg
        className="landing-finger-art"
        viewBox="0 0 420 150"
        aria-hidden="true"
      >
        <path
          d="M22 131C66 118 105 93 155 68c14-7 26 0 25 13l-2 17 26-30c8-9 22-4 19 8l-10 33 33-32c9-8 22 1 16 12l-23 36 42-25c10-6 21 5 13 14l-42 34c-14 11-35 15-54 9l-39-12c-29-9-67-9-111 2Z"
          fill="none"
          stroke="var(--tf-color-text-inverse)"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 131C66 118 105 93 155 68c14-7 26 0 25 13l-2 17 26-30c8-9 22-4 19 8l-10 33 33-32c9-8 22 1 16 12l-23 36 42-25c10-6 21 5 13 14l-42 34c-14 11-35 15-54 9l-39-12c-29-9-67-9-111 2"
          fill="none"
          stroke="var(--tf-color-illustration-tangerine)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g transform="translate(314 30) rotate(8)">
          <path
            d="M0 10 54 0l38 10-54 13Z"
            fill="var(--tf-color-learning-accent)"
          />
          <path
            d="m0 10 38 13v59L0 71Z"
            fill="var(--tf-color-learning-lip)"
          />
          <path
            d="m38 23 54-13v61L38 82Z"
            fill="var(--tf-color-learning-strong)"
          />
          <text
            x="57"
            y="61"
            fill="var(--tf-color-learning-foreground)"
            fontSize="30"
            fontFamily="var(--tf-font-mono)"
            fontWeight="700"
            textAnchor="middle"
          >
            F
          </text>
        </g>
      </svg>
      <div className="landing-passage" lang="en" dir="ltr">
        <span className="landing-passage-muted">a little practice </span>
        <span className="landing-current-letter">f</span>inds your flow.
      </div>
      <div className="landing-keyboard" dir="ltr" aria-hidden="true">
        {keyboardRows.map((row) => (
          <div className="landing-keyboard-row" key={row}>
            {[...row].map((letter) => (
              <span
                className={`landing-key ${'fj'.includes(letter) ? 'landing-key-focus' : ''}`}
                key={letter}
              >
                {letter.toUpperCase()}
              </span>
            ))}
          </div>
        ))}
        <div className="landing-spacebar" />
      </div>
      <div className="landing-example-note">
        <span
          className="landing-focus-pair font-mono"
          lang="en"
          dir="ltr"
          aria-label={`${t('landing.focusTitle')}: F`}
        >
          F
        </span>
      </div>
    </figure>
  );
}

/** Existing callbacks own registration/login; all examples below are static explanations. */
export function LandingPage({ onStartLearning, onLogin }) {
  const { t, isRTL } = useTranslation();

  /** Native fragment navigation stays immediate and keeps keyboard focus at the section. */
  function focusExplanation() {
    document.getElementById('how-it-works')?.focus({ preventScroll: true });
  }

  return (
    <div className="landing-page">
      <section className="landing-hero landing-container" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <h1 id="landing-title">{t('landing.title')}</h1>
          <p className="landing-lead">{t('landing.description')}</p>
          <div className="landing-actions">
            <button type="button" className="landing-primary" onClick={onStartLearning}>
              {t('landing.start')}
              <ArrowRightIcon size={19} className={isRTL ? 'rotate-180' : ''} />
            </button>
            <a href="#how-it-works" className="landing-text-link" onClick={focusExplanation}>
              {t('landing.howLink')}
            </a>
          </div>
          <p className="landing-device-note">
            <KeyboardIcon size={20} />
            {t('landing.device')}
          </p>
        </div>
        <PracticeIllustration t={t} />
      </section>

      <section id="how-it-works" tabIndex={-1} className="landing-method" aria-labelledby="method-title">
        <div className="landing-container">
          <div className="landing-section-heading">
            <h2 id="method-title">{t('landing.methodTitle')}</h2>
            <p>{t('landing.methodDescription')}</p>
          </div>
          <div className="landing-adaptive-example">
            <div className="landing-adaptive-copy">
              <span className="landing-sample-label">{t('landing.exampleLabel')}</span>
              <h3>{t('landing.adaptiveTitle')}</h3>
              <p>{t('landing.adaptiveDescription')}</p>
            </div>
            <div className="landing-worksheet" lang="en" dir="ltr">
              <p>
                <span>{t('landing.targetLabel')}</span>
                <code>a s d f</code>
              </p>
              <p>
                <span>{t('landing.typedLabel')}</span>
                <code>a s d <mark>d</mark></code>
              </p>
              <p className="landing-mismatch-note">{t('landing.mismatchNote')}</p>
              <p className="landing-drill-preview">
                <span>{t('landing.drillLabel')}</span>
                <code>d f d f</code>
              </p>
            </div>
          </div>
          <ol className="landing-steps">
            {learningSteps.map((step, index) => (
              <li key={step}>
                <span className="landing-step-number" aria-hidden="true">{index + 1}</span>
                <h3>{t(`landing.${step}Title`)}</h3>
                <p>{t(`landing.${step}Description`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="landing-dashboard-preview" aria-labelledby="dashboard-preview-title">
        <div className="landing-container">
          <div className="landing-dashboard-heading">
            <span className="landing-sample-label">{t('landing.showcaseLabel')}</span>
            <h2 id="dashboard-preview-title">{t('landing.showcaseTitle')}</h2>
            <p>{t('landing.showcaseDescription')}</p>
          </div>
          <div className="landing-dashboard-frame">
            <aside className="landing-dashboard-sidebar" aria-hidden="true">
              <BrandLogo />
              <span>{t('nav.dashboard')}</span>
              <span>{t('nav.courses')}</span>
              <span>{t('nav.learningPath')}</span>
              <span>{t('nav.progress')}</span>
            </aside>
            <div className="landing-dashboard-content">
              <div className="landing-dashboard-topline">
                <strong>{t('dashboard.title')}</strong>
                <span>{t('landing.showcaseSampleNotice')}</span>
              </div>
              <div className="landing-dashboard-grid">
                <section className="landing-preview-recommendation">
                  <span>{t('dashboard.serverRecommendation')}</span>
                  <h3>{t('dashboard.nextPractice')}</h3>
                  <p dir="ltr" lang="en">F · J</p>
                  <span className="landing-preview-action">{t('dashboard.startPractice')}</span>
                </section>
                <section className="landing-preview-path">
                  <h3>{t('dashboard.learningPath')}</h3>
                  <div aria-hidden="true"><i /><i /><i /><i /></div>
                </section>
                <section className="landing-preview-journal">
                  <h3>{t('dashboard.recentSessions')}</h3>
                  <p>{t('landing.showcaseEmptyValue')}</p>
                </section>
                <aside className="landing-preview-goal">
                  <h3>{t('dashboard.dailyGoal')}</h3>
                  <span>{t('landing.showcaseEmptyValue')}</span>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="landing-touch-statement"
        aria-labelledby="touch-statement-title"
      >
        <div className="landing-container">
          <div className="landing-touch-copy">
            <h2 id="touch-statement-title">{t('landing.touchTitle')}</h2>
            <p>{t('landing.touchDescription')}</p>
            <a href="#course-preview" className="landing-text-link">
              {t('landing.exploreCourses')}
              <ArrowRightIcon
                size={18}
                className={isRTL ? 'rotate-180' : ''}
              />
            </a>
          </div>
          <svg
            className="landing-touch-art"
            viewBox="0 0 760 230"
            aria-hidden="true"
          >
            <path
              d="M74 205c22-38 44-64 70-76 9-4 18 2 17 11l-4 18 28-39c7-10 21-4 17 7l-12 37 31-39c8-10 21-1 16 9l-21 39 34-29c9-8 21 3 14 12l-37 47c-12 15-32 23-53 20l-48-7c-24-4-40-14-52-30Z"
              fill="none"
              stroke="var(--tf-color-text-inverse)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M686 205c-22-38-44-64-70-76-9-4-18 2-17 11l4 18-28-39c-7-10-21-4-17 7l12 37-31-39c-8-10-21-1-16 9l21 39-34-29c-9-8-21 3-14 12l37 47c12 15 32 23 53 20l48-7c24-4 40-14 52-30Z"
              fill="none"
              stroke="var(--tf-color-text-inverse)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <g transform="translate(262 72)">
              {['F', 'J', 'D', 'K', 'A', 'L'].map((key, index) => (
                <g
                  key={key}
                  transform={`translate(${index * 42} ${index % 2 ? 18 : 0})`}
                >
                  <path
                    d="m0 8 25-7 25 7-25 8Z"
                    fill="var(--tf-color-learning-accent)"
                  />
                  <path
                    d="m0 8 25 8v33L0 41Z"
                    fill="var(--tf-color-learning-lip)"
                  />
                  <path
                    d="m25 16 25-8v33l-25 8Z"
                    fill="var(--tf-color-learning-strong)"
                  />
                  <text
                    x="30"
                    y="38"
                    fill="var(--tf-color-learning-foreground)"
                    fontSize="14"
                    fontFamily="var(--tf-font-mono)"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {key}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      </section>

      <section
        id="course-preview"
        className="landing-course"
        aria-labelledby="course-title"
      >
        <div className="landing-container landing-course-inner">
          <div className="landing-path-art" aria-hidden="true" dir="ltr">
            <svg
              className="landing-map-contours"
              viewBox="0 0 500 300"
              preserveAspectRatio="none"
            >
              <path d="M85 220C118 220 122 90 205 90s86 134 165 82" />
              <path d="M39 245C89 245 87 56 205 56s118 172 208 106" />
              <path d="M118 267c25-25 21-133 87-133s63 103 133 74" />
            </svg>
            <span className="landing-path-node landing-path-done landing-path-start">
              <CheckIcon size={28} />
            </span>
            <span className="landing-path-node landing-path-current font-mono">
              F J
            </span>
            <span className="landing-path-node landing-path-end">
              <KeyboardIcon size={30} />
            </span>
          </div>
          <div>
            <h2 id="course-title">{t('landing.courseTitle')}</h2>
            <p className="landing-lead">
              {t('landing.courseDescription')}
            </p>
            <p className="landing-course-status">
              {t('landing.courseStatus')}
            </p>
            {/* NOTE for course owners: replace this labelled concept with published metadata
                only when the public course API and library destination are available. */}
            <ul className="landing-reassurance">
              {['accuracy', 'review', 'progress'].map((item) => (
                <li key={item}>
                  <CheckIcon size={20} />
                  <span>{t(`landing.${item}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="landing-focus-section" aria-labelledby="focus-section-title">
        <div className="landing-container landing-focus-layout">
          <div>
            <h2 id="focus-section-title">{t('landing.personalTitle')}</h2>
            <p className="landing-lead">{t('landing.personalDescription')}</p>
            <p className="landing-focus-detail">{t('landing.personalDetail')}</p>
          </div>
          <div className="landing-history-preview">
            <span className="landing-history-label">
              {t('landing.historyExampleLabel')}
            </span>
            <h3>{t('landing.historySpeedTitle')}</h3>
            <p className="landing-history-description">
              {t('landing.historySpeedDescription')}
            </p>
            <div className="landing-history-chart-wrap">
              <span className="landing-history-key" aria-hidden="true">
                F
              </span>
              <svg
                className="landing-history-chart"
                viewBox="0 0 480 150"
                role="img"
                aria-labelledby="history-chart-title history-chart-description"
              >
                <title id="history-chart-title">
                  {t('landing.historySpeedTitle')}
                </title>
                <desc id="history-chart-description">
                  {t('landing.historySpeedDescription')}
                </desc>
                <path d="M24 24H456M24 75H456M24 126H456" />
                <path
                  className="landing-history-line"
                  d="M30 112 112 95 194 104 276 68 358 78 450 38"
                />
                <path
                  className="landing-history-area"
                  d="M30 112 112 95 194 104 276 68 358 78 450 38V126H30Z"
                />
                {[30, 112, 194, 276, 358, 450].map((x, index) => {
                  const y = [112, 95, 104, 68, 78, 38][index];
                  return (
                    <circle
                      key={x}
                      cx={x}
                      cy={y}
                      r="5"
                      className="landing-history-point"
                    />
                  );
                })}
              </svg>
            </div>
            <div className="landing-history-session">
              <div>
                <h4>{t('landing.historySessionTitle')}</h4>
                <p>{t('landing.historySessionDescription')}</p>
              </div>
              <ArrowRightIcon
                size={20}
                className={isRTL ? 'rotate-180' : ''}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="questions" className="landing-faq" aria-labelledby="questions-title">
        <div className="landing-container landing-faq-inner">
          <div className="landing-section-heading">
            <h2 id="questions-title">{t('landing.questionsTitle')}</h2>
            <p>{t('landing.questionsDescription')}</p>
          </div>
          <div className="landing-faq-list">
            {/* Native disclosure keeps keyboard operation and expanded state accessible
                without extra state or height animations. */}
            {['keyboard', 'language', 'mistakes', 'account'].map((question) => (
              <details key={question}>
                <summary>{t(`landing.${question}Question`)}</summary>
                <p>{t(`landing.${question}Answer`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-closing" aria-labelledby="closing-title">
        <div className="landing-container landing-closing-inner">
          <div className="landing-closing-copy">
            <h2 id="closing-title">{t('landing.closingTitle')}</h2>
            <p>{t('landing.closingDescription')}</p>
          </div>
          <div className="landing-actions">
            <button type="button" className="landing-primary" onClick={onStartLearning}>
              {t('landing.start')}
            </button>
            <button type="button" className="landing-text-link" onClick={onLogin}>
              {t('auth.loginAction')}
            </button>
          </div>
          <svg
            className="landing-closing-art"
            viewBox="0 0 760 150"
            aria-hidden="true"
          >
            <path
              d="M35 145c18-35 36-58 58-67 8-3 15 2 14 10l-3 15 23-32c6-8 17-4 14 6l-10 30 25-32c7-8 17-1 13 8l-17 31 27-23c7-6 17 2 11 10l-30 37c-10 12-26 18-43 16l-38-6c-20-3-33-12-44-23Z"
              fill="none"
              stroke="var(--tf-color-text-inverse)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M725 145c-18-35-36-58-58-67-8-3-15 2-14 10l3 15-23-32c-6-8-17-4-14 6l10 30-25-32c-7-8-17-1-13 8l17 31-27-23c-7-6-17 2-11 10l30 37c10 12 26 18 43 16l38-6c20-3 33-12 44-23Z"
              fill="none"
              stroke="var(--tf-color-text-inverse)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <g transform="translate(286 66)">
              <path
                d="m0 9 44-12 44 12-44 12Z"
                fill="var(--tf-color-learning-accent)"
              />
              <path
                d="m0 9 44 12v49L0 58Z"
                fill="var(--tf-color-learning-lip)"
              />
              <path
                d="m44 21 44-12v49L44 70Z"
                fill="var(--tf-color-learning-strong)"
              />
              <text
                x="52"
                y="50"
                fill="var(--tf-color-learning-foreground)"
                fontSize="22"
                fontFamily="var(--tf-font-mono)"
                fontWeight="700"
                textAnchor="middle"
              >
                F
              </text>
            </g>
            <g transform="translate(402 66)">
              <path
                d="m0 9 44-12 44 12-44 12Z"
                fill="var(--tf-color-learning-accent)"
              />
              <path
                d="m0 9 44 12v49L0 58Z"
                fill="var(--tf-color-learning-lip)"
              />
              <path
                d="m44 21 44-12v49L44 70Z"
                fill="var(--tf-color-learning-strong)"
              />
              <text
                x="52"
                y="50"
                fill="var(--tf-color-learning-foreground)"
                fontSize="22"
                fontFamily="var(--tf-font-mono)"
                fontWeight="700"
                textAnchor="middle"
              >
                J
              </text>
            </g>
          </svg>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-grid">
            <div className="landing-footer-brand">
              <BrandLogo />
              <p>{t('landing.footer')}</p>
              <p>{t('landing.footerDescription')}</p>
            </div>
            <nav aria-label={t('landing.exploreTitle')}>
              <h2>{t('landing.exploreTitle')}</h2>
              <a href="#how-it-works" onClick={focusExplanation}>{t('landing.howLink')}</a>
              <a href="#questions">{t('landing.questionsTitle')}</a>
              <Link to="/verify-certificate">{t('nav.verifyCertificate')}</Link>
            </nav>
            <nav aria-label={t('landing.accountTitle')}>
              <h2>{t('landing.accountTitle')}</h2>
              <button type="button" onClick={onStartLearning}>{t('landing.start')}</button>
              <button type="button" onClick={onLogin}>{t('auth.loginAction')}</button>
              <p>{t('landing.device')}</p>
              <div className="landing-footer-preferences">
                <AppearanceSelector compact />
                <LanguageSelector compact />
              </div>
            </nav>
          </div>
          <div className="landing-footer-bottom">
            <p>© {new Date().getFullYear()} TypeFlow</p>
            <p>{t('landing.footerNote')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
