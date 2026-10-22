import { useTranslation } from '../../../i18n/useTranslation.js';
import { ArrowRightIcon, CheckIcon, LockIcon } from '../../../components/ui/Icons.jsx';

/**
 * Course summary card showing metadata, key focus, and enrollment status.
 *
 * @param {object} props
 * @param {object} props.course Course summary DTO
 * @param {object} [props.enrollment] Existing student enrollment record (if enrolled)
 * @param {(courseId: string) => void} props.onViewDetails Callback to open details
 * @param {(courseId: string) => void} props.onEnroll Callback to enroll
 * @param {(resumeLink: string) => void} props.onResume Callback to resume active enrollment
 * @param {boolean} [props.isEnrolling=false] Whether enrollment mutation is currently pending
 */
export function CourseCard({
  course,
  enrollment,
  onViewDetails,
  onEnroll,
  onResume,
  isEnrolling = false,
}) {
  const { t } = useTranslation();

  const levelStyles = {
    beginner: 'bg-learning-soft text-learning-strong border-learning-accent/30',
    intermediate: 'bg-action-soft text-action-primary border-action-primary/30',
    advanced: 'bg-warning-soft text-warning-text border-warning-accent/40',
  };

  const topicLabels = {
    foundations: t('courses.topicFoundations'),
    speed: t('courses.topicSpeed'),
    numbers_symbols: t('courses.topicSymbols'),
    code_prose: t('courses.topicCode'),
  };

  const levelLabels = {
    beginner: t('courses.levelBeginner'),
    intermediate: t('courses.levelIntermediate'),
    advanced: t('courses.levelAdvanced'),
  };

  const isArchived = course.status === 'archived';
  const isEnrolled = Boolean(enrollment);

  return (
    <article className="flex h-full flex-col justify-between rounded-card border border-border-subtle bg-surface p-6 shadow-card transition-all duration-200 hover:shadow-card-hover hover:border-learning-accent/40">
      <div>
        {/* Header Badges */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                levelStyles[course.level] || levelStyles.beginner
              }`}
            >
              {levelLabels[course.level] || course.level}
            </span>
            <span className="rounded-full bg-subtle px-2.5 py-0.5 text-xs font-medium text-muted">
              {topicLabels[course.topic] || course.topic}
            </span>
          </div>

          {isArchived ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-subtle px-2.5 py-0.5 text-xs font-bold text-muted">
              <LockIcon size={12} aria-hidden="true" />
              <span>{t('courses.statusArchived')}</span>
            </span>
          ) : isEnrolled ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-learning-soft px-2.5 py-0.5 text-xs font-bold text-learning-strong">
              <CheckIcon size={12} aria-hidden="true" />
              <span>
                {enrollment.progressPercent >= 100
                  ? t('courses.statusCompleted')
                  : t('courses.statusEnrolled')}
              </span>
            </span>
          ) : null}
        </div>

        {/* Title */}
        <h3 className="mb-2 font-display text-xl font-bold text-ink leading-snug">
          <button
            type="button"
            onClick={() => onViewDetails(course.id)}
            className="text-start hover:text-learning-strong hover:underline focus:outline-none focus:ring-1 focus:ring-learning-accent"
          >
            {course.title}
          </button>
        </h3>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-muted line-clamp-3">
          {course.description}
        </p>

        {/* Focus Keys Tag */}
        {course.keyFocus && (
          <div className="mb-4 rounded-control bg-page/80 px-3 py-1.5 text-xs font-mono text-muted border border-border-subtle/50">
            <span className="font-semibold text-ink">{t('courses.keyFocus')}: </span>
            <span>{course.keyFocus}</span>
          </div>
        )}

        {/* Course Metrics */}
        <div className="mb-5 flex flex-wrap items-center gap-4 text-xs font-medium text-muted">
          <span>⏱️ {course.estimatedHours} {t('courses.hoursUnit')}</span>
          <span>📚 {course.totalUnits} {t('courses.unitsUnit')}</span>
          <span>⌨️ {course.totalLessons} {t('courses.lessonsUnit')}</span>
        </div>

        {/* Enrollment Progress Bar if enrolled */}
        {isEnrolled && (
          <div className="mb-5 rounded-control bg-subtle p-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-ink">
                {t('courses.progressLabel')}
              </span>
              <span className="font-bold text-learning-strong">
                {enrollment.progressPercent}%
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-border-subtle"
              role="progressbar"
              aria-valuenow={enrollment.progressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                className="h-full bg-learning-accent transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, enrollment.progressPercent))}%` }}
              />
            </div>
            {enrollment.currentLesson && (
              <p className="mt-2 text-xs text-muted truncate">
                <span className="font-medium text-ink">{t('courses.currentLesson')}: </span>
                <span>{enrollment.currentLesson.title}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-t-border-subtle/50">
        {isEnrolled ? (
          <>
            <button
              type="button"
              onClick={() => onResume(enrollment.resumeLink || '/learning-path')}
              className="inline-flex flex-1 min-h-10 items-center justify-center gap-2 rounded-full bg-action-primary px-4 py-2 text-sm font-bold text-action-foreground shadow-primary transition-colors hover:bg-action-hover focus:outline-none focus:ring-2 focus:ring-action-focus"
            >
              <span>{t('courses.resumeAction')}</span>
              <ArrowRightIcon size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onViewDetails(course.id)}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-subtle focus:outline-none focus:ring-2 focus:ring-action-focus"
            >
              {t('courses.viewDetailsAction')}
            </button>
          </>
        ) : isArchived ? (
          <button
            type="button"
            onClick={() => onViewDetails(course.id)}
            className="w-full inline-flex min-h-10 items-center justify-center rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm font-semibold text-muted hover:text-ink hover:bg-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-action-focus"
          >
            {t('courses.viewArchivedDetailsAction')}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onEnroll(course.id)}
              disabled={isEnrolling}
              className="inline-flex flex-1 min-h-10 items-center justify-center rounded-full bg-action-primary px-4 py-2 text-sm font-bold text-action-foreground shadow-primary transition-colors hover:bg-action-hover disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-action-focus"
            >
              {isEnrolling ? t('courses.enrollingAction') : t('courses.enrollAction')}
            </button>
            <button
              type="button"
              onClick={() => onViewDetails(course.id)}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-subtle focus:outline-none focus:ring-2 focus:ring-action-focus"
            >
              {t('courses.viewDetailsAction')}
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export default CourseCard;
