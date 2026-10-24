/** Starter public landing: explains learning without fetching or inventing student data. */
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation.js';
import {
  ArrowRightIcon,
  KeyboardIcon,
  CheckIcon,
} from '../../components/ui/Icons.jsx';
import { BrandLogo } from '../../components/ui/BrandLogo.jsx';

const keyboardRows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const learningSteps = ['practice', 'result', 'next'];

/** Decorative desktop QWERTY illustration; it never captures keys or starts a session. */
function PracticeIllustration({ t }) {
  return (
    <figure className="landing-example">
      <figcaption className="landing-example-label">{t('landing.exampleLabel')}</figcaption>
      <div className="landing-passage" lang="en" dir="ltr">
        <span className="text-muted">a little practice </span>
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
        <span className="landing-focus-pair font-mono" lang="en" dir="ltr">F + J</span>
        <div>
          <p className="font-bold">{t('landing.focusTitle')}</p>
          <p className="text-sm text-muted">{t('landing.focusDescription')}</p>
        </div>
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

      <section className="landing-course landing-container" aria-labelledby="course-title">
        <div className="landing-path-art" aria-hidden="true" dir="ltr">
          <span className="landing-path-node landing-path-done"><CheckIcon size={28} /></span>
          <span className="landing-path-connector" />
          <span className="landing-path-node landing-path-current font-mono">F J</span>
          <span className="landing-path-connector" />
          <span className="landing-path-node"><KeyboardIcon size={30} /></span>
        </div>
        <div>
          <h2 id="course-title">{t('landing.courseTitle')}</h2>
          <p className="landing-lead">{t('landing.courseDescription')}</p>
          <p className="landing-course-status">{t('landing.courseStatus')}</p>
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
      </section>

      <section className="landing-focus-section" aria-labelledby="focus-section-title">
        <div className="landing-container landing-focus-layout">
          <div>
            <h2 id="focus-section-title">{t('landing.personalTitle')}</h2>
            <p className="landing-lead">{t('landing.personalDescription')}</p>
            <p className="landing-focus-detail">{t('landing.personalDetail')}</p>
          </div>
          <div className="landing-focus-story">
            {['notice', 'target', 'reflect'].map((step) => (
              <div className="landing-focus-row" key={step}>
                <CheckIcon size={22} />
                <div>
                  <h3>{t(`landing.${step}Heading`)}</h3>
                  <p>{t(`landing.${step}Copy`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="questions" className="landing-faq landing-container" aria-labelledby="questions-title">
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
      </section>

      <section className="landing-closing landing-container" aria-labelledby="closing-title">
        <div>
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
