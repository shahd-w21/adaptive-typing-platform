// Interactive and accessible lesson node representing progression status on a course path.
import { useTranslation } from '../../../i18n/useTranslation.js';
import {
  CheckIcon,
  PlayIcon,
  LockIcon,
  ArrowRightIcon,
  RotateCcwIcon,
  ShieldIcon,
} from '../../../components/ui/Icons.jsx';

/**
 * Renders a single lesson node within a course unit.
 *
 * Supported statuses:
 * - 'completed': Lesson passed server replay criteria
 * - 'in-progress': Active current lesson on the learning path
 * - 'available': Prerequisites met and ready to start
 * - 'locked': Prerequisites not yet satisfied
 * - 'placement-exempt': Validated competence from diagnostic placement (distinct from completed/mastered)
 *
 * @param {object} props
 * @param {object} props.lesson Lesson node data
 * @param {string} props.lesson.id Lesson identifier
 * @param {number} props.lesson.lessonIndex Ordinal lesson position
 * @param {string} props.lesson.title Lesson title
 * @param {'lesson'|'practice'|'checkpoint'|'review'} props.lesson.type
 * @param {'locked'|'available'|'in-progress'|'completed'|'placement-exempt'} props.lesson.status
 * @param {string} [props.lesson.reason] Accessible reason text explaining status
 * @param {Array<string>} [props.lesson.keysIntroduced] Target keyboard keys
 * @param {object} [props.lesson.completionCriteria] Criteria targets (accuracy, WPM)
 * @param {boolean} [props.lesson.isNextAction] Flag indicating server-selected recommended action
 * @param {(lesson: object) => void} props.onStart Callback when start/resume/review action is triggered
 * @param {boolean} [props.disabled=false] External lock or busy override
 */
export function LessonNode({ lesson, onStart, disabled = false }) {
  const { t } = useTranslation();

  const isCompleted = lesson.status === 'completed';
  const isInProgress = lesson.status === 'in-progress';
  const isAvailable = lesson.status === 'available';
  const isLocked = lesson.status === 'locked';
  const isPlacementExempt = lesson.status === 'placement-exempt';
  const isNext = Boolean(lesson.isNextAction);

  // Status-specific badges and descriptions
  const statusBadge = (() => {
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-bold text-success-text border border-success-text/20">
          <CheckIcon size={12} aria-hidden="true" />
          <span>{t('courses.nodeCompleted')}</span>
        </span>
      );
    }
    if (isInProgress) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-learning-accent text-learning-foreground px-2.5 py-0.5 text-xs font-bold shadow-sm animate-pulse">
          <PlayIcon size={12} aria-hidden="true" />
          <span>{t('courses.nodeInProgress')}</span>
        </span>
      );
    }
    if (isPlacementExempt) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 px-2.5 py-0.5 text-xs font-bold border border-purple-300 dark:border-purple-800">
          <ShieldIcon size={12} aria-hidden="true" />
          <span>{t('courses.nodePlacementExempt')}</span>
        </span>
      );
    }
    if (isAvailable) {
      return (
        <span className="inline-flex items-center rounded-full bg-action-primary/10 text-action-primary px-2.5 py-0.5 text-xs font-semibold border border-action-primary/20">
          <span>{t('courses.nodeAvailable')}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-subtle text-muted px-2.5 py-0.5 text-xs font-medium border border-border-subtle">
        <LockIcon size={12} aria-hidden="true" />
        <span>{t('courses.nodeLocked')}</span>
      </span>
    );
  })();

  const typeLabels = {
    lesson: t('courses.lessonLabel'),
    practice: t('courses.practiceLabel'),
    checkpoint: t('courses.checkpointLabel'),
    review: t('courses.reviewLabel'),
  };

  const actionText = (() => {
    if (isInProgress) return t('courses.resumeLesson');
    if (isCompleted) return t('courses.reviewLesson');
    if (isPlacementExempt) return t('courses.reviewLesson');
    return t('courses.startLesson');
  })();

  const handleAction = () => {
    if (isLocked || disabled) return;
    onStart(lesson);
  };

  return (
    <div
      className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-card border p-4 sm:p-5 transition-all ${
        isNext
          ? 'border-learning-accent bg-surface ring-2 ring-learning-accent/20 shadow-md'
          : isLocked
            ? 'border-border-subtle/60 bg-subtle/40 opacity-75'
            : isPlacementExempt
              ? 'border-purple-200 dark:border-purple-900/60 bg-surface'
              : 'border-border-subtle bg-surface hover:border-learning-accent/50 hover:shadow-card'
      }`}
    >
      {/* Left / Main node details */}
      <div className="flex items-start gap-4 min-w-0 flex-1">
        {/* Node Avatar Icon */}
        <div
          className={`flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-full font-bold text-sm transition-transform ${
            isNext
              ? 'bg-learning-accent text-learning-foreground shadow-node scale-105'
              : isCompleted
                ? 'bg-success-soft text-success-text border border-success-text/30'
                : isPlacementExempt
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                  : isLocked
                    ? 'bg-disabled-bg text-disabled-text'
                    : 'bg-subtle text-ink border border-border-control'
          }`}
          aria-hidden="true"
        >
          {isCompleted ? (
            <CheckIcon size={20} />
          ) : isPlacementExempt ? (
            <ShieldIcon size={18} />
          ) : isLocked ? (
            <LockIcon size={18} />
          ) : isInProgress ? (
            <PlayIcon size={20} />
          ) : (
            <span>{lesson.lessonIndex}</span>
          )}
        </div>

        {/* Content body */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-xs text-muted">
              #{lesson.lessonIndex}
            </span>
            <span className="rounded bg-page px-2 py-0.5 font-mono text-[11px] font-semibold text-muted uppercase tracking-wider border border-border-subtle">
              {typeLabels[lesson.type] || lesson.type}
            </span>
            {statusBadge}
            {isNext && (
              <span className="rounded-full bg-learning-soft px-2 py-0.5 text-[11px] font-bold text-learning-strong border border-learning-accent/30">
                ⭐ {t('courses.recommendedNextAction')}
              </span>
            )}
          </div>

          <h4
            className={`font-display text-base font-bold truncate ${
              isLocked ? 'text-muted' : 'text-ink'
            }`}
          >
            {lesson.title}
          </h4>

          {/* Accessible Reason text */}
          {lesson.reason && (
            <p
              className={`mt-1 text-xs leading-relaxed ${
                isLocked
                  ? 'text-muted italic'
                  : isPlacementExempt
                    ? 'text-purple-700 dark:text-purple-300'
                    : isCompleted
                      ? 'text-success-text'
                      : 'text-muted'
              }`}
            >
              {lesson.reason}
            </p>
          )}

          {/* Target Keys Chips & Criteria */}
          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-muted">
            {lesson.keysIntroduced?.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-medium text-muted">
                  {t('courses.keysFocus')}:
                </span>
                <span className="flex flex-wrap gap-1">
                  {lesson.keysIntroduced.map((key) => (
                    <kbd
                      key={key}
                      className="inline-block rounded bg-page px-1.5 py-0.5 font-mono text-[11px] font-bold text-ink border border-border-subtle shadow-xs"
                    >
                      {key.toUpperCase()}
                    </kbd>
                  ))}
                </span>
              </div>
            )}

            {lesson.completionCriteria && (
              <div className="flex items-center gap-2 text-[11px] text-muted">
                {lesson.completionCriteria.minAccuracy && (
                  <span>
                    🎯 {lesson.completionCriteria.minAccuracy}%{' '}
                    {t('courses.minAccuracy')}
                  </span>
                )}
                {lesson.completionCriteria.targetWpm && (
                  <span>
                    ⚡ {lesson.completionCriteria.targetWpm} WPM{' '}
                    {t('courses.targetWpm')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right / Action Button */}
      <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0 self-end sm:self-center">
        {isLocked ? (
          <button
            type="button"
            disabled
            className="w-full sm:w-auto inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-border-subtle bg-subtle px-4 py-2 text-xs font-bold text-disabled-text cursor-not-allowed"
            aria-disabled="true"
          >
            <LockIcon size={14} aria-hidden="true" />
            <span>{t('courses.nodeLocked')}</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={handleAction}
            className={`w-full sm:w-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-action-focus ${
              isNext
                ? 'bg-action-primary text-action-foreground shadow-primary hover:bg-action-hover active:scale-98'
                : isCompleted || isPlacementExempt
                  ? 'border border-border-subtle bg-surface text-ink hover:bg-subtle'
                  : 'bg-action-primary/90 text-action-foreground hover:bg-action-primary'
            }`}
            aria-label={`${actionText}: ${lesson.title}`}
          >
            {isCompleted || isPlacementExempt ? (
              <RotateCcwIcon size={14} aria-hidden="true" />
            ) : (
              <PlayIcon size={14} aria-hidden="true" />
            )}
            <span>{actionText}</span>
            <ArrowRightIcon size={14} aria-hidden="true" className="rtl:rotate-180" />
          </button>
        )}
      </div>
    </div>
  );
}
