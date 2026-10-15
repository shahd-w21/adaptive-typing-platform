import { useState, useEffect, useRef, useMemo } from 'react';
import { usePreferences } from '../../../context/preferences.js';
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
    if (buffer.length> 0 && !isPaused && !isCompleted) {
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
    if (currentPos>= assignedText.length) return;

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
    if (newBuffer.length>= assignedText.length) {
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
    <div className="min-h-screen bg-page">
      {/* Study Shell Top Bar */}
      <div
        className="h-16 border-b border-b-border-subtle bg-surface flex items-center justify-between px-6"
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (buffer.length> 0) setShowExitConfirm(true);
              else onExit();
            }}
            className="bg-transparent border-0 cursor-pointer flex items-center gap-1.5 text-[14px] font-bold text-muted"
          >
            <ArrowLeftIcon size={18} className={[
                                       isRTL ? 'rotate-180' : 'transform-none',
                                     ].filter(Boolean).join(' ')} />
            <span>{t('common.exit')}</span>
          </button>

          <span
            className="py-1 px-2.5 rounded-full bg-learning-soft text-learning-strong text-[12px] font-bold"
          >
            {mode}
          </span>
        </div>

        {/* View Options & Preferences */}
        <div className="flex items-center gap-3.5">
          {/* Large Text Toggle */}
          <button
            type="button"
            onClick={() => setLargeText(!largeText)}
            className={[
              "bg-transparent border border-border-subtle rounded-full py-1 px-2.5 cursor-pointer text-[13px] text-ink",
              largeText ? 'font-extrabold bg-subtle' : 'font-medium bg-transparent',
            ].filter(Boolean).join(' ')}
          >
            Large Text: {largeText ? 'ON' : 'OFF'}
          </button>

          {/* Reduced Pressure Toggle */}
          <button
            type="button"
            onClick={() => setReducedPressure(!reducedPressure)}
            className={[
              "bg-transparent border border-border-subtle rounded-full py-1 px-2.5 cursor-pointer text-[13px] text-ink",
              reducedPressure ? 'font-extrabold bg-subtle' : 'font-medium bg-transparent',
            ].filter(Boolean).join(' ')}
          >
            Reduced Pressure: {reducedPressure ? 'ON' : 'OFF'}
          </button>

          <LanguageSelector compact />
          <AppearanceSelector compact />
        </div>
      </div>

      {/* Main 960px Study Stage */}
      <div className="max-w-[var(--study-max)] mx-auto p-6 relative">
        {/* Activity Header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="font-display rtl:font-arabic leading-[34px] font-bold text-[20px] mb-1">
              Home Row & Upper Reach Drill
            </h1>
            <p className="text-[14px] text-muted">
              Type naturally. Correct mistakes with Backspace or keep typing forward.
            </p>
          </div>

          {/* Live Provisional Metrics Bar */}
          {!reducedPressure ? (
            <div className="flex gap-4 items-center">
              <div className="text-right">
                <div className="text-[11px] text-muted font-bold">
                  {t('typing.liveProvisional')}
                </div>
                <div className="[direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! flex gap-3 text-[18px] font-extrabold">
                  <span>{live.formattedGrossWpm} WPM</span>
                  <span className="text-success-text">{live.formattedRawAccuracy}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-[12px] text-muted italic">
              (Timer runs calmly in background)
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-border-subtle rounded-[3px] mb-5 overflow-hidden">
          <div
            className="h-full bg-learning-accent [transition:width_100ms_ease-out]" style={{ width: `${progressPercent}%` }}
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
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={togglePause}
              className="inline-flex items-center justify-center gap-2 font-body rtl:font-arabic font-bold text-ink bg-surface border-2 border-border-control rounded-full cursor-pointer no-underline [transition:background-color_var(--motion-fast),_border-color_var(--motion-fast)] enabled:hover:bg-subtle enabled:hover:border-ink disabled:border-border-subtle disabled:text-disabled-text disabled:cursor-not-allowed h-10 py-0 px-4 text-[14px]"
            >
              {isPaused ? <PlayIcon size={16} /> : <PauseIcon size={16} />}
              <span>{isPaused ? t('typing.resume') : t('typing.pause')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRestartConfirm(true)}
              className="inline-flex items-center justify-center gap-2 font-body rtl:font-arabic font-bold text-ink bg-surface border-2 border-border-control rounded-full cursor-pointer no-underline [transition:background-color_var(--motion-fast),_border-color_var(--motion-fast)] enabled:hover:bg-subtle enabled:hover:border-ink disabled:border-border-subtle disabled:text-disabled-text disabled:cursor-not-allowed h-10 py-0 px-4 text-[14px]"
            >
              <RotateCcwIcon size={16} />
              <span>{t('common.restart')}</span>
            </button>
          </div>

          <div className="text-[13px] text-muted">
            {buffer.length === 0 ? t('typing.startPrompt') : `${buffer.length} / ${assignedText.length} characters`}
          </div>
        </div>

        {/* Physical QWERTY Keyboard Guide */}
        <KeyboardGuide nextChar={nextChar} masteredKeys={new Set(['f', 'j', 'd', 'k', 'a', 's', 'l', ';'])} />

        {/* Pause Overlay */}
        {isPaused && (
          <div
            className="absolute inset-0 bg-overlay [backdrop-filter:blur(3px)] rounded-card flex flex-col items-center justify-center z-50"
          >
            <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] text-center max-w-90">
              <div className="mb-4 text-learning-strong">
                <PauseIcon size={36} />
              </div>
              <h2 className="font-display rtl:font-arabic leading-[34px] font-bold text-[20px] mb-2">
                Practice Paused
              </h2>
              <p className="text-muted text-[14px] mb-5">
                {t('typing.pausedState')}
              </p>
              <button
                type="button"
                onClick={togglePause}
                className="inline-flex items-center justify-center gap-2 h-12 py-0 px-6 font-body rtl:font-arabic text-[16px] font-bold text-action-foreground bg-action-primary border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none w-full"
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
            className="absolute inset-0 bg-overlay rounded-card flex flex-col items-center justify-center z-60 text-on-inverse"
          >
            <div className="text-[18px] font-bold">{t('typing.submitting')}</div>
          </div>
        )}
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div
          className="fixed inset-0 bg-overlay flex items-center justify-center z-100"
        >
          <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] max-w-105 text-center">
            <div className="text-warning-accent mb-3">
              <AlertCircleIcon size={36} />
            </div>
            <h3 className="font-display rtl:font-arabic leading-[34px] font-bold text-[18px] mb-2">
              Exit Practice?
            </h3>
            <p className="text-[14px] text-muted mb-6">
              {t('typing.abandonWarning')}
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="inline-flex items-center justify-center gap-2 h-12 py-0 px-6 font-body rtl:font-arabic text-[16px] font-bold text-ink bg-surface border-2 border-border-control rounded-full cursor-pointer no-underline [transition:background-color_var(--motion-fast),_border-color_var(--motion-fast)] enabled:hover:bg-subtle enabled:hover:border-ink disabled:border-border-subtle disabled:text-disabled-text disabled:cursor-not-allowed"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={onExit}
                className="inline-flex items-center justify-center gap-2 h-12 py-0 px-6 font-body rtl:font-arabic text-[16px] font-bold text-action-foreground border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none bg-error-text"
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
          className="fixed inset-0 bg-overlay flex items-center justify-center z-100"
        >
          <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] max-w-105 text-center">
            <h3 className="font-display rtl:font-arabic leading-[34px] font-bold text-[18px] mb-2">
              Restart Session?
            </h3>
            <p className="text-[14px] text-muted mb-6">
              {t('typing.restartWarning')}
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowRestartConfirm(false)}
                className="inline-flex items-center justify-center gap-2 h-12 py-0 px-6 font-body rtl:font-arabic text-[16px] font-bold text-ink bg-surface border-2 border-border-control rounded-full cursor-pointer no-underline [transition:background-color_var(--motion-fast),_border-color_var(--motion-fast)] enabled:hover:bg-subtle enabled:hover:border-ink disabled:border-border-subtle disabled:text-disabled-text disabled:cursor-not-allowed"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center justify-center gap-2 h-12 py-0 px-6 font-body rtl:font-arabic text-[16px] font-bold text-action-foreground bg-action-primary border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none"
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
