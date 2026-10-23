// Course learning path page displaying ordered units, lesson states, and adaptive next actions.
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../i18n/useTranslation.js';
import { useCoursePath } from '../hooks/useCoursePath.js';
import { CoursePath } from '../components/CoursePath.jsx';
import { Loading } from '../../../components/Loading.jsx';
import { ErrorMessage } from '../../../components/ErrorMessage.jsx';
import { ConfirmDialog } from '../../../components/ConfirmDialog.jsx';
import {
  ArrowLeftIcon,
  PlayIcon,
  ArrowRightIcon,
  ShieldIcon,
  AlertCircleIcon,
} from '../../../components/ui/Icons.jsx';

/**
 * Page displaying the unit and lesson path for an enrolled course.
 *
 * Requirements satisfied:
 * - SYS-58: Ordered units/lessons with completion rules & prerequisites
 * - SYS-59: Distinction between course progress, lesson completion, and shared key mastery
 * - SYS-60: Clear placement-exempt states without unearned rewards or XP
 * - SYS-61: Separate enrollment progress from global profile
 * - SYS-64: Server-authoritative results; client never locally completes lessons
 * - Collision guard: Selecting a different course cannot mutate a running assignment
 *
 * @param {object} props
 * @param {(lesson: object, context: object) => Promise<void>|void} props.onStartLesson
 * @param {object} [props.activeSession] Currently running typing session configuration (if any)
 * @param {() => Promise<void>|void} [props.onAbandonActiveSession] Abandon running session callback
 */
export function CoursePathPage({
  onStartLesson,
  activeSession,
  onAbandonActiveSession,
}) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    path,
    isFixture,
    isPending,
    isError,
    error,
    refetch,
    scenario,
    setScenario,
  } = useCoursePath(courseId);

  // Modal state when student attempts to start a lesson while another course session is active
  const [pendingLessonToStart, setPendingLessonToStart] = useState(null);
  const [startErrorFeedback, setStartErrorFeedback] = useState(null);

  const handleStartLesson = (lesson, unit) => {
    // Collision guard: if there is an active session for a DIFFERENT course, prevent silent mutation
    if (
      activeSession &&
      activeSession.courseId &&
      activeSession.courseId !== courseId
    ) {
      setPendingLessonToStart({ lesson, unit });
      return;
    }

    triggerLessonLaunch(lesson, unit);
  };

  const triggerLessonLaunch = (lesson, unit) => {
    // If reviewer testing start error scenario
    if (scenario === 'start_error') {
      setStartErrorFeedback({
        title: t('courses.startFailedTitle'),
        message: t('courses.startFailedDesc'),
      });
      return;
    }

    setStartErrorFeedback(null);
    if (typeof onStartLesson === 'function') {
      onStartLesson(lesson, {
        courseId,
        courseVersionId: path?.courseVersionId,
        enrollmentId: path?.enrollmentId,
        unitId: unit?.id,
        lessonId: lesson.id,
      });
    }
  };

  const confirmSwitchCourse = async () => {
    if (typeof onAbandonActiveSession === 'function') {
      await onAbandonActiveSession();
    }
    const target = pendingLessonToStart;
    setPendingLessonToStart(null);
    if (target) {
      triggerLessonLaunch(target.lesson, target.unit);
    }
  };

  if (isPending) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Loading message={t('courses.loadingPath')} size="lg" />
      </div>
    );
  }

  if (isError || !path) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <ErrorMessage
          title={t('courses.pathLoadError')}
          message={error?.message || t('courses.pathLoadError')}
          onRetry={refetch}
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/my-courses')}
            className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-5 py-2 text-sm font-semibold text-ink shadow-sm hover:bg-subtle"
          >
            <ArrowLeftIcon size={16} />
            <span>{t('courses.backToMyCourses')}</span>
          </button>
          <button
            type="button"
            onClick={() => setScenario('default')}
            className="rounded-full bg-learning-accent text-learning-foreground px-5 py-2 text-sm font-bold"
          >
            {t('courses.resetFilters')}
          </button>
        </div>
      </div>
    );
  }

  // Find next action lesson and its parent unit if applicable
  const nextLessonObj = path.nextAction
    ? path.units
        ?.flatMap((u) => u.lessons.map((l) => ({ lesson: l, unit: u })))
        .find((item) => item.lesson.id === path.nextAction.lessonId)
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Top Navigation */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/my-courses')}
            className="inline-flex items-center gap-1.5 rounded-control px-2.5 py-1 text-sm font-medium text-muted transition-colors hover:text-ink focus:outline-none focus:ring-1 focus:ring-learning-accent"
          >
            <ArrowLeftIcon size={16} aria-hidden="true" />
            <span>{t('courses.backToMyCourses')}</span>
          </button>
          <span className="text-border-subtle" aria-hidden="true">
            /
          </span>
          <button
            type="button"
            onClick={() => navigate(`/courses/${courseId}`)}
            className="text-sm font-medium text-muted hover:text-ink hover:underline"
          >
            {t('courses.backToCourseDetail')}
          </button>
        </div>
      </div>

      {/* Development Fixture Notice */}
      {isFixture && (
        <div
          role="note"
          className="mb-6 flex items-center justify-between rounded-card border border-warning-accent/40 bg-warning-soft/70 p-3.5 text-xs text-warning-text"
        >
          <span>{t('courses.fixtureNotice')}</span>
          <span className="rounded-control bg-warning-accent/20 px-2 py-0.5 font-mono font-bold uppercase text-[10px]">
            {t('courses.frontendOnlyTag')}
          </span>
        </div>
      )}

      {/* Reviewer Scenario Switcher Bar */}
      <div className="mb-6 rounded-control border border-dashed border-learning-accent/40 bg-learning-soft/30 p-3.5 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <span className="font-bold text-learning-strong flex items-center gap-1.5">
            <span>🛠️</span>
            <span>{t('courses.reviewScenarioTitle')}:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setScenario('default')}
              className={`rounded-control px-2.5 py-1 font-semibold transition-colors ${
                scenario === 'default'
                  ? 'bg-learning-accent text-learning-foreground shadow-xs'
                  : 'bg-surface text-ink border border-border-subtle hover:bg-subtle'
              }`}
            >
              {t('courses.scenarioExperienced')}
            </button>
            <button
              type="button"
              onClick={() => setScenario('novice')}
              className={`rounded-control px-2.5 py-1 font-semibold transition-colors ${
                scenario === 'novice'
                  ? 'bg-learning-accent text-learning-foreground shadow-xs'
                  : 'bg-surface text-ink border border-border-subtle hover:bg-subtle'
              }`}
            >
              {t('courses.scenarioNovice')}
            </button>
            <button
              type="button"
              onClick={() => setScenario('sparse')}
              className={`rounded-control px-2.5 py-1 font-semibold transition-colors ${
                scenario === 'sparse'
                  ? 'bg-learning-accent text-learning-foreground shadow-xs'
                  : 'bg-surface text-ink border border-border-subtle hover:bg-subtle'
              }`}
            >
              {t('courses.scenarioSparse')}
            </button>
            <button
              type="button"
              onClick={() => setScenario('unmet_prerequisites')}
              className={`rounded-control px-2.5 py-1 font-semibold transition-colors ${
                scenario === 'unmet_prerequisites'
                  ? 'bg-learning-accent text-learning-foreground shadow-xs'
                  : 'bg-surface text-ink border border-border-subtle hover:bg-subtle'
              }`}
            >
              {t('courses.scenarioPrereqLocked')}
            </button>
            <button
              type="button"
              onClick={() => setScenario('start_error')}
              className={`rounded-control px-2.5 py-1 font-semibold transition-colors ${
                scenario === 'start_error'
                  ? 'bg-error-text text-white shadow-xs'
                  : 'bg-surface text-ink border border-border-subtle hover:bg-subtle'
              }`}
            >
              {t('courses.scenarioStartError')}
            </button>
            <button
              type="button"
              onClick={() => setScenario('path_error')}
              className={`rounded-control px-2.5 py-1 font-semibold transition-colors ${
                scenario === 'path_error'
                  ? 'bg-error-text text-white shadow-xs'
                  : 'bg-surface text-ink border border-border-subtle hover:bg-subtle'
              }`}
            >
              {t('courses.scenarioPathError')}
            </button>
          </div>
        </div>
      </div>

      {/* Start Error Feedback Alert if triggered */}
      {startErrorFeedback && (
        <div className="mb-6">
          <ErrorMessage
            title={startErrorFeedback.title}
            message={startErrorFeedback.message}
            onRetry={() => {
              setStartErrorFeedback(null);
              setScenario('default');
            }}
            retryLabel={t('common.close')}
          />
        </div>
      )}

      {/* Prerequisite Unmet Warning Banner if present */}
      {path.prerequisiteWarning && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-card border border-warning-accent/60 bg-warning-soft p-4 text-warning-text shadow-sm"
        >
          <div className="pt-0.5 shrink-0" aria-hidden="true">
            <AlertCircleIcon size={20} />
          </div>
          <div>
            <h4 className="font-display text-sm font-bold">
              {t('courses.prerequisitesTitle')}
            </h4>
            <p className="mt-1 text-xs leading-relaxed">
              {path.prerequisiteWarning}
            </p>
          </div>
        </div>
      )}

      {/* Course Overview Header Card */}
      <div className="mb-8 rounded-card border border-border-subtle bg-surface p-6 shadow-card sm:p-7">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-full bg-learning-soft px-3 py-0.5 text-xs font-bold text-learning-strong border border-learning-accent/20">
                {t('courses.coursePathTitle')}
              </span>
              <span className="font-mono text-xs text-muted">
                {path.courseVersionId}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
              {path.courseTitle}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {t('courses.coursePathSubtitle')}
            </p>
          </div>

          {/* Placement Exemptions Indicator */}
          {path.placementExemptionsCount > 0 && (
            <div
              className="flex items-center gap-2 rounded-control border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 p-3 text-xs text-purple-800 dark:text-purple-300 shrink-0"
              role="status"
            >
              <ShieldIcon size={18} aria-hidden="true" />
              <div>
                <div className="font-bold">
                  {path.placementExemptionsCount} {t('courses.placementExemptBadge')}
                </div>
                <div className="text-[11px] text-purple-600 dark:text-purple-400">
                  {t('courses.placementExemptDesc')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar Strip */}
        <div className="mt-6 border-t border-border-subtle/60 pt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-muted">
              {t('courses.progressLabel')}
            </span>
            <span className="font-bold text-learning-strong text-sm">
              {path.progressPercent}%
            </span>
          </div>
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-border-subtle"
            role="progressbar"
            aria-valuenow={path.progressPercent}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`${path.courseTitle} progress: ${path.progressPercent}%`}
          >
            <div
              className="h-full bg-learning-accent transition-all duration-300"
              style={{ width: `${path.progressPercent}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-muted">
            <span>
              {path.completedLessonsCount} / {path.totalLessonsCount}{' '}
              {t('courses.lessonsCompletedLabel')}
            </span>
            <span>
              {path.totalLessonsCount - path.completedLessonsCount}{' '}
              {t('courses.inProgress')}
            </span>
          </div>
        </div>
      </div>

      {/* Next Up Hero Card (Server-selected recommended action) */}
      {path.nextAction && (
        <div className="mb-8 rounded-card border-2 border-learning-accent bg-gradient-to-r from-learning-soft/40 via-surface to-surface p-6 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex size-6 items-center justify-center rounded-full bg-learning-accent text-learning-foreground text-xs font-bold">
                  ⭐
                </span>
                <span className="font-bold text-xs uppercase tracking-wider text-learning-strong">
                  {t('courses.recommendedNextAction')}
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-ink">
                {path.nextAction.title}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {path.nextAction.reason}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (nextLessonObj) {
                  handleStartLesson(nextLessonObj.lesson, nextLessonObj.unit);
                }
              }}
              className="inline-flex min-h-12 w-full sm:w-auto shrink-0 items-center justify-center gap-2.5 rounded-full bg-action-primary px-7 py-3 font-bold text-action-foreground shadow-primary transition-all hover:bg-action-hover active:scale-98 focus:outline-none focus:ring-2 focus:ring-action-focus"
            >
              <PlayIcon size={18} aria-hidden="true" />
              <span>{path.nextAction.actionLabel}</span>
              <ArrowRightIcon size={18} aria-hidden="true" className="rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* Main Ordered Course Path */}
      <CoursePath
        units={path.units}
        onStartLesson={(lesson, unit) => handleStartLesson(lesson, unit)}
      />

      {/* Server-Authoritative Result Notice Footer */}
      <div className="mt-8 rounded-card border border-border-subtle bg-subtle/30 p-4 text-center text-xs text-muted">
        <span>{t('courses.finishedExerciseNotice')}</span>
      </div>

      {/* Confirm Dialog for switching running assignment collision */}
      <ConfirmDialog
        isOpen={Boolean(pendingLessonToStart)}
        title={t('courses.activeSessionRunningTitle')}
        message={t('courses.activeSessionRunningDesc')}
        confirmLabel={t('courses.abandonAndStart')}
        cancelLabel={t('common.cancel')}
        isDestructive={true}
        onConfirm={confirmSwitchCourse}
        onCancel={() => setPendingLessonToStart(null)}
      />
    </div>
  );
}
