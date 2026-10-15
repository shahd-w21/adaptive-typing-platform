import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePreferences } from '../../../context/PreferencesContext.jsx';
import { useTranslation } from '../../../i18n/useTranslation.js';
import { KeystrokeRecorder } from '../engine/keystrokeRecorder.js';
import { computeLiveMetrics, computeOfficialResults } from '../engine/liveMetrics.js';
import { TypingStage } from '../components/TypingStage.jsx';
import { KeyboardGuide } from '../components/KeyboardGuide.jsx';
import { OfficialResult } from '../../result/OfficialResult.jsx';
import { AppearanceSelector } from '../../../components/controls/AppearanceSelector.jsx';
import { LanguageSelector } from '../../../components/controls/LanguageSelector.jsx';
import { PlayIcon, PauseIcon, RotateCcwIcon, ArrowLeftIcon, AlertCircleIcon } from '../../../components/ui/Icons.jsx';

export function TypingSessionPage({
  sessionId = 'session-101',
  mode = 'Adaptive Practice',
  assignedText = 'asdf jkl; asdf jkl; fdsa ;lkj asdf jkl; reed feed seek keel free',
  onExit,
}) {
  const { largeText, setLargeText, reducedPressure, setReducedPressure } = usePreferences();
  const { t, isRTL } = useTranslation();

  // Engine state
  const [buffer, setBuffer] = useState('');
  const [totalInserts, setTotalInserts] = useState(0);
  const [correctInserts, setCorrectInserts] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [officialResult, setOfficialResult] = useState(null);

  // Dialog states
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  // Monotonic recorder ref
  const recorderRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Initialise recorder once per session
  useEffect(() => {
    recorderRef.current = new KeystrokeRecorder();
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [sessionId]);

  // Active elapsed timer
  useEffect(() => {
    if (buffer.length > 0 && !isPaused && !isCompleted) {
      timerIntervalRef.current = setInterval(() => {
        if (recorderRef.current) {
          setElapsedMs(recorderRef.current.getElapsedMs());
        }
      }, 200);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [buffer.length, isPaused, isCompleted]);

  // Handle Printable Character Input
  const handleCharInput = (char) => {
    if (isCompleted || isPaused) return;

    const currentPos = buffer.length;
    if (currentPos >= assignedText.length) return;

    const expectedChar = assignedText[currentPos];
    const isCorrect = char === expectedChar;

    // Record monotonic event
    recorderRef.current?.recordInsert(char);

    const newBuffer = buffer + char;
    setBuffer(newBuffer);
    setTotalInserts((prev) => prev + 1);
    if (isCorrect) {
      setCorrectInserts((prev) => prev + 1);
    }

    // Check completion condition
    if (newBuffer.length >= assignedText.length) {
      handleComplete(newBuffer, totalInserts + 1, correctInserts + (isCorrect ? 1 : 0));
    }
  };

  // Handle End-of-Buffer Backspace
  const handleBackspace = () => {
    if (buffer.length === 0 || isCompleted || isPaused) return;

    recorderRef.current?.recordBackspace();
    setBuffer((prev) => prev.slice(0, -1));
  };

  // Toggle Pause (valid pause intervals are excluded from duration)
  const togglePause = () => {
    if (isCompleted) return;
    if (isPaused) {
      recorderRef.current?.recordResume();
      setIsPaused(false);
    } else {
      recorderRef.current?.recordPause();
      setIsPaused(true);
    }
  };

  // Session Submission & Official Scoring
  const handleComplete = (finalBuffer, finalTotalInserts, finalCorrectInserts) => {
    setIsSubmitting(true);
    const finalDuration = recorderRef.current?.getElapsedMs() || 45000;

    // Simulate official server-side verification and replay
    setTimeout(() => {
      const computed = computeOfficialResults({
        totalInserts: finalTotalInserts,
        correctInserts: finalCorrectInserts,
        buffer: finalBuffer,
        assignedText,
        activeDurationMs: finalDuration,
      });

      setOfficialResult(computed);
      setIsSubmitting(false);
      setIsCompleted(true);
    }, 600);
  };

  // Restart attempt
  const handleRestart = () => {
    recorderRef.current?.reset();
    setBuffer('');
    setTotalInserts(0);
    setCorrectInserts(0);
    setElapsedMs(0);
    setIsPaused(false);
    setIsCompleted(false);
    setShowRestartConfirm(false);
  };

  // Next expected key for keyboard guide
  const nextChar = buffer.length < assignedText.length ? assignedText[buffer.length] : '';

  // Live Provisional Metrics
  const live = useMemo(() => {
    return computeLiveMetrics({
      totalInserts,
      correctInserts,
      bufferLength: buffer.length,
      activeDurationMs: elapsedMs,
    });
  }, [totalInserts, correctInserts, buffer.length, elapsedMs]);

  // Render Official Result on completion
  if (isCompleted && officialResult) {
    return (
      <OfficialResult
        result={officialResult}
        onContinue={onExit}
        onRetry={handleRestart}
      />
    );
  }

  const progressPercent = Math.min(100, Math.round((buffer.length / assignedText.length) * 100));

  return (
    <div className="study-shell" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-page)' }}>
      {/* Study Shell Top Bar */}
      <div
        style={{
          height: '64px',
          borderBottom: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            onClick={() => {
              if (buffer.length > 0) setShowExitConfirm(true);
              else onExit();
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
            }}
          >
            <ArrowLeftIcon size={18} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
            <span>{t('common.exit')}</span>
          </button>

          <span
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-learning-soft)',
              color: 'var(--color-learning-strong)',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {mode}
          </span>
        </div>

        {/* View Options & Preferences */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Large Text Toggle */}
          <button
            type="button"
            onClick={() => setLargeText(!largeText)}
            style={{
              background: 'none',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-pill)',
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: largeText ? 800 : 500,
              backgroundColor: largeText ? 'var(--color-bg-subtle)' : 'transparent',
              color: 'var(--color-text-primary)',
            }}
          >
            Large Text: {largeText ? 'ON' : 'OFF'}
          </button>

          {/* Reduced Pressure Toggle */}
          <button
            type="button"
            onClick={() => setReducedPressure(!reducedPressure)}
            style={{
              background: 'none',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-pill)',
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: reducedPressure ? 800 : 500,
              backgroundColor: reducedPressure ? 'var(--color-bg-subtle)' : 'transparent',
              color: 'var(--color-text-primary)',
            }}
          >
            Reduced Pressure: {reducedPressure ? 'ON' : 'OFF'}
          </button>

          <LanguageSelector compact />
          <AppearanceSelector compact />
        </div>
      </div>

      {/* Main 960px Study Stage */}
      <div className="study-container" style={{ position: 'relative' }}>
        {/* Activity Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 className="text-heading-section" style={{ fontSize: '20px', marginBottom: '4px' }}>
              Home Row & Upper Reach Drill
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Type naturally. Correct mistakes with Backspace or keep typing forward.
            </p>
          </div>

          {/* Live Provisional Metrics Bar */}
          {!reducedPressure ? (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                  {t('typing.liveProvisional')}
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '18px', fontWeight: 800 }} className="english-island">
                  <span>{live.formattedGrossWpm} WPM</span>
                  <span style={{ color: 'var(--color-success-text)' }}>{live.formattedRawAccuracy}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
              (Timer runs calmly in background)
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div style={{ height: '6px', backgroundColor: 'var(--color-border-subtle)', borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: 'var(--color-learning-accent)',
              transition: 'width 100ms ease-out',
            }}
          />
        </div>

        {/* Interactive Typing Surface */}
        <TypingStage
          assignedText={assignedText}
          buffer={buffer}
          onCharInput={handleCharInput}
          onBackspace={handleBackspace}
          isActive={!isCompleted && !isSubmitting}
          isPaused={isPaused}
        />

        {/* Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={togglePause}
              className="btn-secondary"
              style={{ height: '40px', padding: '0 16px', fontSize: '14px' }}
            >
              {isPaused ? <PlayIcon size={16} /> : <PauseIcon size={16} />}
              <span>{isPaused ? t('typing.resume') : t('typing.pause')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRestartConfirm(true)}
              className="btn-secondary"
              style={{ height: '40px', padding: '0 16px', fontSize: '14px' }}
            >
              <RotateCcwIcon size={16} />
              <span>{t('common.restart')}</span>
            </button>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            {buffer.length === 0 ? t('typing.startPrompt') : `${buffer.length} / ${assignedText.length} characters`}
          </div>
        </div>

        {/* Physical QWERTY Keyboard Guide */}
        <KeyboardGuide nextChar={nextChar} masteredKeys={new Set(['f', 'j', 'd', 'k', 'a', 's', 'l', ';'])} />

        {/* Pause Overlay */}
        {isPaused && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'var(--color-overlay)',
              backdropFilter: 'blur(3px)',
              borderRadius: 'var(--radius-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
            }}
          >
            <div className="surface-card" style={{ textAlign: 'center', maxWidth: '360px' }}>
              <div style={{ marginBottom: '16px', color: 'var(--color-learning-strong)' }}>
                <PauseIcon size={36} />
              </div>
              <h2 className="text-heading-section" style={{ fontSize: '20px', marginBottom: '8px' }}>
                Practice Paused
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                {t('typing.pausedState')}
              </p>
              <button
                type="button"
                onClick={togglePause}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                <PlayIcon size={18} />
                <span>{t('typing.resume')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Submitting Loading Overlay */}
        {isSubmitting && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'var(--color-overlay)',
              borderRadius: 'var(--radius-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 60,
              color: 'var(--color-text-inverse)',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{t('typing.submitting')}</div>
          </div>
        )}
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--color-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div className="surface-card" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div style={{ color: 'var(--color-warning-accent)', marginBottom: '12px' }}>
              <AlertCircleIcon size={36} />
            </div>
            <h3 className="text-heading-section" style={{ fontSize: '18px', marginBottom: '8px' }}>
              Exit Practice?
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              {t('typing.abandonWarning')}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="btn-secondary"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={onExit}
                className="btn-primary"
                style={{ backgroundColor: 'var(--color-error-text)' }}
              >
                {t('common.exit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restart Confirmation Dialog */}
      {showRestartConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--color-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div className="surface-card" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <h3 className="text-heading-section" style={{ fontSize: '18px', marginBottom: '8px' }}>
              Restart Session?
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              {t('typing.restartWarning')}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowRestartConfirm(false)}
                className="btn-secondary"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="btn-primary"
              >
                {t('common.restart')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
