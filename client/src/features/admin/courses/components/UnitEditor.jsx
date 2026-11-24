/**
 * Ordered unit authoring component within course drafts (SYS-58, SYS-62).
 * Enables unit creation, reordering, title/summary authoring, and lesson count tracking.
 */
import { useTranslation } from '../../../../i18n/useTranslation.js';
import {
  PlusIcon,
  TrashIcon,
  RotateCcwIcon as MoveUpIcon,
  ArrowRightIcon as MoveDownIcon,
} from '../../../../components/ui/Icons.jsx';

export function UnitEditor({
  units = [],
  onChange,
  readOnly = false,
  errors = {},
}) {
  const { t } = useTranslation();

  const handleAddUnit = () => {
    if (readOnly) return;
    const nextIndex = units.length + 1;
    const newUnit = {
      id: `u-draft-${Date.now().toString(36)}-${nextIndex}`,
      unitIndex: nextIndex,
      title: `Unit ${nextIndex}: New Module`,
      description: '',
      lessonCount: 0,
      lessons: [],
    };
    onChange([...units, newUnit]);
  };

  const handleUpdateUnit = (index, field, value) => {
    if (readOnly) return;
    const updated = units.map((u, i) => (i === index ? { ...u, [field]: value } : u));
    onChange(updated);
  };

  const handleMoveUp = (index) => {
    if (readOnly || index === 0) return;
    const reordered = [...units];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;

    // Recalculate 1-based unit indices
    const normalized = reordered.map((u, i) => ({
      ...u,
      unitIndex: i + 1,
    }));
    onChange(normalized);
  };

  const handleMoveDown = (index) => {
    if (readOnly || index === units.length - 1) return;
    const reordered = [...units];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;

    // Recalculate 1-based unit indices
    const normalized = reordered.map((u, i) => ({
      ...u,
      unitIndex: i + 1,
    }));
    onChange(normalized);
  };

  const handleDeleteUnit = (index) => {
    if (readOnly) return;
    const unit = units[index];
    if (unit.lessons && unit.lessons.length > 0) {
      const confirmDelete = window.confirm(
        t('adminCourses.confirmDeleteUnitWithLessons') ||
          `This unit contains ${unit.lessons.length} drafted lessons. Are you sure you want to remove it?`,
      );
      if (!confirmDelete) return;
    }

    const filtered = units.filter((_, i) => i !== index);
    const normalized = filtered.map((u, i) => ({
      ...u,
      unitIndex: i + 1,
    }));
    onChange(normalized);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-card border border-border-subtle bg-surface p-6 shadow-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-[18px] font-bold text-ink">
              {t('adminCourses.unitsTitle') || 'Course Curriculum Units'} ({units.length})
            </h3>
            <p className="text-[13px] text-muted">
              {t('adminCourses.unitsSubtitle') ||
                'Organize sequential learning units. Progression follows this defined order.'}
            </p>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={handleAddUnit}
              className="inline-flex min-h-10 items-center gap-2 rounded-control bg-action-primary px-4 text-[13px] font-bold text-action-foreground shadow-sm transition-colors hover:bg-action-hover"
            >
              <PlusIcon size={16} aria-hidden="true" />
              <span>{t('adminCourses.addUnit') || 'Add Curriculum Unit'}</span>
            </button>
          )}
        </div>

        {errors.units && (
          <p role="alert" className="mb-4 text-[12px] font-semibold text-error-text">
            {errors.units}
          </p>
        )}

        {units.length === 0 ? (
          <div className="rounded-control border-2 border-dashed border-border-subtle p-8 text-center">
            <p className="text-[14px] font-medium text-muted">
              {t('adminCourses.noUnits') ||
                'No units created yet. Add a unit to begin structuring this course curriculum.'}
            </p>
            {!readOnly && (
              <button
                type="button"
                onClick={handleAddUnit}
                className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-control border border-border-subtle bg-subtle px-3 text-[13px] font-bold text-ink hover:bg-hover"
              >
                <PlusIcon size={14} aria-hidden="true" />
                <span>{t('adminCourses.addUnit') || 'Add First Unit'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {units.map((unit, index) => {
              const lessonCount = unit.lessons?.length || unit.lessonCount || 0;
              return (
                <div
                  key={unit.id || index}
                  className="rounded-control border border-border-subtle bg-surface p-5 transition-shadow hover:shadow-sm"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 items-center justify-center rounded-full bg-learning-soft font-mono text-[13px] font-bold text-learning-strong">
                        {unit.unitIndex || index + 1}
                      </span>
                      <span className="font-display text-[15px] font-bold text-ink">
                        {unit.title || `Unit ${unit.unitIndex || index + 1}`}
                      </span>
                      <span className="rounded-full bg-subtle px-2.5 py-0.5 text-[11px] font-bold text-muted">
                        {lessonCount} {t('adminCourses.lessonsCount') || 'lessons'}
                      </span>
                    </div>

                    {!readOnly && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveUp(index)}
                          aria-label={`Move unit ${unit.unitIndex || index + 1} up`}
                          title={t('adminCourses.moveUp') || 'Move Up'}
                          className="flex size-8 items-center justify-center rounded-control border border-border-subtle text-muted hover:bg-subtle hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
                        >
                          <span className="rotate-90">
                            <MoveUpIcon size={14} aria-hidden="true" />
                          </span>
                        </button>

                        <button
                          type="button"
                          disabled={index === units.length - 1}
                          onClick={() => handleMoveDown(index)}
                          aria-label={`Move unit ${unit.unitIndex || index + 1} down`}
                          title={t('adminCourses.moveDown') || 'Move Down'}
                          className="flex size-8 items-center justify-center rounded-control border border-border-subtle text-muted hover:bg-subtle hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
                        >
                          <span className="rotate-90">
                            <MoveDownIcon size={14} aria-hidden="true" />
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteUnit(index)}
                          aria-label={`Delete unit ${unit.unitIndex || index + 1}`}
                          title={t('adminCourses.deleteUnit') || 'Delete Unit'}
                          className="flex size-8 items-center justify-center rounded-control border border-transparent text-muted hover:border-border-subtle hover:text-error-text"
                        >
                          <TrashIcon size={15} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`unit-title-${index}`}
                        className="mb-1 block text-[13px] font-bold text-ink"
                      >
                        {t('adminCourses.unitTitle') || 'Unit Title'} *
                      </label>
                      <input
                        id={`unit-title-${index}`}
                        type="text"
                        disabled={readOnly}
                        value={unit.title || ''}
                        onChange={(e) => handleUpdateUnit(index, 'title', e.target.value)}
                        placeholder="e.g. Home Row Fundamentals"
                        className="h-10 w-full rounded-control border border-border-control bg-surface px-3 text-[14px] text-ink focus:border-focus-ring focus:outline-none disabled:bg-subtle disabled:text-muted"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`unit-desc-${index}`}
                        className="mb-1 block text-[13px] font-bold text-ink"
                      >
                        {t('adminCourses.unitDescription') || 'Unit Summary'}
                      </label>
                      <input
                        id={`unit-desc-${index}`}
                        type="text"
                        disabled={readOnly}
                        value={unit.description || ''}
                        onChange={(e) => handleUpdateUnit(index, 'description', e.target.value)}
                        placeholder="e.g. Master left and right hand anchor keys."
                        className="h-10 w-full rounded-control border border-border-control bg-surface px-3 text-[14px] text-ink focus:border-focus-ring focus:outline-none disabled:bg-subtle disabled:text-muted"
                      />
                    </div>
                  </div>

                  {/* Lessons list summary */}
                  {unit.lessons && unit.lessons.length > 0 && (
                    <div className="mt-3 rounded-control bg-subtle/50 p-3">
                      <div className="mb-1.5 text-[12px] font-bold text-muted">
                        {t('adminCourses.lessonsInUnit') || 'Drafted Lessons in Unit'}:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {unit.lessons.map((lesson, lIdx) => (
                          <span
                            key={lesson.id || lIdx}
                            className="inline-flex items-center gap-1 rounded bg-surface px-2 py-0.5 text-[12px] font-medium text-ink shadow-xs"
                          >
                            <span className="font-mono text-muted">{lesson.lessonIndex || lIdx + 1}.</span>
                            <span>{lesson.title}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
