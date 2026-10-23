// Renders the ordered sequence of units and lessons for an enrolled course path.
import { useTranslation } from '../../../i18n/useTranslation.js';
import { LessonNode } from './LessonNode.jsx';
import { CheckIcon, LockIcon } from '../../../components/ui/Icons.jsx';

/**
 * Renders the full unit and lesson sequence for a course path.
 *
 * @param {object} props
 * @param {Array<object>} props.units Ordered array of unit path objects
 * @param {(lesson: object, unit: object) => void} props.onStartLesson Action handler when starting a lesson
 * @param {boolean} [props.disabled=false]
 */
export function CoursePath({ units = [], onStartLesson, disabled = false }) {
  const { t } = useTranslation();

  if (!units || units.length === 0) {
    return (
      <div className="rounded-card border border-border-subtle bg-surface p-8 text-center text-muted">
        <p>{t('courses.emptyCatalogDescription')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {units.map((unit) => {
        const isUnitCompleted = unit.status === 'completed';
        const isUnitInProgress = unit.status === 'in-progress';
        const isUnitLocked = unit.status === 'locked';

        return (
          <section
            key={unit.id}
            aria-labelledby={`unit-heading-${unit.id}`}
            className={`rounded-card border transition-all ${
              isUnitLocked
                ? 'border-border-subtle/50 bg-page/50'
                : isUnitInProgress
                  ? 'border-learning-accent/40 bg-surface shadow-card ring-1 ring-learning-accent/10'
                  : 'border-border-subtle bg-surface shadow-xs'
            }`}
          >
            {/* Unit Header Banner */}
            <div
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b p-5 sm:p-6 ${
                isUnitInProgress
                  ? 'border-learning-accent/20 bg-learning-soft/20'
                  : 'border-border-subtle/60 bg-subtle/30'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full font-bold text-xs ${
                    isUnitCompleted
                      ? 'bg-success-soft text-success-text border border-success-text/30'
                      : isUnitInProgress
                        ? 'bg-learning-accent text-learning-foreground shadow-xs'
                        : isUnitLocked
                          ? 'bg-disabled-bg text-disabled-text'
                          : 'bg-surface text-ink border border-border-control'
                  }`}
                  aria-hidden="true"
                >
                  {isUnitCompleted ? (
                    <CheckIcon size={16} />
                  ) : isUnitLocked ? (
                    <LockIcon size={14} />
                  ) : (
                    unit.unitIndex
                  )}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-muted uppercase tracking-wider">
                      {t('courses.unitsLabel')} {unit.unitIndex}
                    </span>
                    {isUnitCompleted && (
                      <span className="rounded-full bg-success-soft px-2 py-0.2 text-[10px] font-bold text-success-text border border-success-text/30">
                        {t('courses.statusCompleted')}
                      </span>
                    )}
                    {isUnitInProgress && (
                      <span className="rounded-full bg-learning-accent text-learning-foreground px-2 py-0.2 text-[10px] font-bold">
                        {t('courses.inProgress')}
                      </span>
                    )}
                  </div>
                  <h3
                    id={`unit-heading-${unit.id}`}
                    className={`font-display text-lg font-bold ${
                      isUnitLocked ? 'text-muted' : 'text-ink'
                    }`}
                  >
                    {unit.title}
                  </h3>
                  {unit.description && (
                    <p className="mt-0.5 text-xs text-muted">
                      {unit.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress Count */}
              <div className="flex items-center gap-2 text-xs font-medium text-muted shrink-0 self-end sm:self-center">
                <span>
                  {unit.completedLessonsCount} / {unit.lessonCount || unit.lessons?.length || 0}{' '}
                  {t('courses.lessonsCompletedLabel')}
                </span>
              </div>
            </div>

            {/* Unit Lessons Flow */}
            <div className="p-5 sm:p-6">
              <div className="space-y-3.5">
                {(unit.lessons ?? []).map((lesson) => (
                  <LessonNode
                    key={lesson.id}
                    lesson={lesson}
                    onStart={(targetLesson) => onStartLesson(targetLesson, unit)}
                    disabled={disabled || isUnitLocked}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
