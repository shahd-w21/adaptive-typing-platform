/**
 * Form component for authoring and editing course metadata (SYS-58, SYS-62).
 * Handles titles, version labels, topic/level, entry prerequisites, and learning objectives.
 */
import { useTranslation } from '../../../../i18n/useTranslation.js';
import { PlusIcon, TrashIcon } from '../../../../components/ui/Icons.jsx';

export function CourseMetadataForm({
  values = {},
  onChange,
  errors = {},
  readOnly = false,
}) {
  const { t } = useTranslation();

  const handleInputChange = (field) => (e) => {
    if (readOnly) return;
    onChange(field, e.target.value);
  };

  const handleNumberChange = (field) => (e) => {
    if (readOnly) return;
    const num = parseFloat(e.target.value);
    onChange(field, isNaN(num) ? '' : num);
  };

  // Objectives list operations
  const handleObjectiveChange = (index, value) => {
    if (readOnly) return;
    const updated = [...(values.objectives || [])];
    updated[index] = value;
    onChange('objectives', updated);
  };

  const handleAddObjective = () => {
    if (readOnly) return;
    const updated = [...(values.objectives || []), ''];
    onChange('objectives', updated);
  };

  const handleRemoveObjective = (index) => {
    if (readOnly) return;
    const updated = (values.objectives || []).filter((_, i) => i !== index);
    onChange('objectives', updated);
  };

  // Prerequisites list operations
  const handlePrerequisiteChange = (index, value) => {
    if (readOnly) return;
    const updated = [...(values.prerequisites || [])];
    updated[index] = value;
    onChange('prerequisites', updated);
  };

  const handleAddPrerequisite = () => {
    if (readOnly) return;
    const updated = [...(values.prerequisites || []), ''];
    onChange('prerequisites', updated);
  };

  const handleRemovePrerequisite = (index) => {
    if (readOnly) return;
    const updated = (values.prerequisites || []).filter((_, i) => i !== index);
    onChange('prerequisites', updated);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Basic Information */}
      <div className="rounded-card border border-border-subtle bg-surface p-6 shadow-card">
        <h3 className="mb-4 font-display text-[18px] font-bold text-ink">
          {t('adminCourses.basicInfoTitle') || 'Course Information & Versioning'}
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Title */}
          <div className="md:col-span-2">
            <label
              htmlFor="course-title"
              className="mb-1.5 block text-[14px] font-bold text-ink"
            >
              {t('adminCourses.courseTitleLabel') || 'Course Title'} *
            </label>
            <input
              id="course-title"
              type="text"
              disabled={readOnly}
              value={values.title || ''}
              onChange={handleInputChange('title')}
              placeholder="e.g. Touch Typing Foundations"
              className={`h-11 w-full rounded-control border px-3.5 text-[15px] text-ink transition-colors ${
                errors.title ? 'border-error-text bg-error-soft/10' : 'border-border-control bg-surface'
              } focus:border-focus-ring focus:outline-none disabled:bg-subtle disabled:text-muted`}
            />
            {errors.title && (
              <p role="alert" className="mt-1 text-[12px] font-semibold text-error-text">
                {errors.title}
              </p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="course-slug"
              className="mb-1.5 block text-[14px] font-bold text-ink"
            >
              {t('adminCourses.slugLabel') || 'URL Slug'} *
            </label>
            <input
              id="course-slug"
              type="text"
              disabled={readOnly}
              value={values.slug || ''}
              onChange={handleInputChange('slug')}
              placeholder="e.g. touch-typing-foundations"
              className={`h-11 w-full rounded-control border px-3.5 font-mono text-[14px] text-ink transition-colors ${
                errors.slug ? 'border-error-text bg-error-soft/10' : 'border-border-control bg-surface'
              } focus:border-focus-ring focus:outline-none disabled:bg-subtle disabled:text-muted`}
            />
            {errors.slug && (
              <p role="alert" className="mt-1 text-[12px] font-semibold text-error-text">
                {errors.slug}
              </p>
            )}
            <p className="mt-1 text-[11px] text-muted">
              {t('adminCourses.slugHelp') || 'Lowercase letters, numbers, and hyphens only.'}
            </p>
          </div>

          {/* Version Label */}
          <div>
            <label
              htmlFor="course-version-label"
              className="mb-1.5 block text-[14px] font-bold text-ink"
            >
              {t('adminCourses.versionLabel') || 'Version Label'} *
            </label>
            <input
              id="course-version-label"
              type="text"
              disabled={readOnly}
              value={values.versionLabel || ''}
              onChange={handleInputChange('versionLabel')}
              placeholder="e.g. v1.0.0-draft"
              className={`h-11 w-full rounded-control border px-3.5 font-mono text-[14px] text-ink transition-colors ${
                errors.versionLabel ? 'border-error-text bg-error-soft/10' : 'border-border-control bg-surface'
              } focus:border-focus-ring focus:outline-none disabled:bg-subtle disabled:text-muted`}
            />
            {errors.versionLabel && (
              <p role="alert" className="mt-1 text-[12px] font-semibold text-error-text">
                {errors.versionLabel}
              </p>
            )}
            <p className="mt-1 text-[11px] text-muted">
              {t('adminCourses.versionHelp') || 'Semantic versioning tag (e.g. v1.0.0-draft).'}
            </p>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label
              htmlFor="course-description"
              className="mb-1.5 block text-[14px] font-bold text-ink"
            >
              {t('adminCourses.descriptionLabel') || 'Summary & Description'}
            </label>
            <textarea
              id="course-description"
              rows={3}
              disabled={readOnly}
              value={values.description || ''}
              onChange={handleInputChange('description')}
              placeholder="Brief course curriculum overview and student learning targets..."
              className="w-full rounded-control border border-border-control bg-surface p-3 text-[14px] text-ink focus:border-focus-ring focus:outline-none disabled:bg-subtle disabled:text-muted"
            />
          </div>

          {/* Level */}
          <div>
            <label
              htmlFor="course-level"
              className="mb-1.5 block text-[14px] font-bold text-ink"
            >
              {t('adminCourses.levelLabel') || 'Difficulty Level'} *
            </label>
            <select
              id="course-level"
              disabled={readOnly}
              value={values.level || 'beginner'}
              onChange={handleInputChange('level')}
              className="h-11 w-full rounded-control border border-border-control bg-surface px-3 text-[14px] text-ink focus:border-focus-ring focus:outline-none disabled:bg-subtle disabled:text-muted"
            >
              <option value="beginner">{t('adminCourses.levelBeginner') || 'Beginner'}</option>
              <option value="intermediate">{t('adminCourses.levelIntermediate') || 'Intermediate'}</option>
              <option value="advanced">{t('adminCourses.levelAdvanced') || 'Advanced'}</option>
            </select>
          </div>

          {/* Topic */}
          <div>
            <label
              htmlFor="course-topic"
              className="mb-1.5 block text-[14px] font-bold text-ink"
            >
              {t('adminCourses.topicLabel') || 'Curriculum Topic'} *
            </label>
            <select
              id="course-topic"
              disabled={readOnly}
              value={values.topic || 'foundations'}
              onChange={handleInputChange('topic')}
              className="h-11 w-full rounded-control border border-border-control bg-surface px-3 text-[14px] text-ink focus:border-focus-ring focus:outline-none disabled:bg-subtle disabled:text-muted"
            >
              <option value="foundations">{t('adminCourses.topicFoundations') || 'Foundations'}</option>
              <option value="speed">{t('adminCourses.topicSpeed') || 'Speed & Fluency'}</option>
              <option value="numbers_symbols">{t('adminCourses.topicSymbols') || 'Numbers & Symbols'}</option>
              <option value="code_prose">{t('adminCourses.topicCode') || 'Code & Syntax'}</option>
            </select>
          </div>

          {/* Estimated Hours */}
          <div>
            <label
              htmlFor="course-hours"
              className="mb-1.5 block text-[14px] font-bold text-ink"
            >
              {t('adminCourses.hoursLabel') || 'Estimated Hours'} *
            </label>
            <input
              id="course-hours"
              type="number"
              step="0.5"
              min="0.5"
              disabled={readOnly}
              value={values.estimatedHours ?? ''}
              onChange={handleNumberChange('estimatedHours')}
              placeholder="e.g. 4.5"
              className={`h-11 w-full rounded-control border px-3.5 text-[15px] text-ink transition-colors ${
                errors.estimatedHours ? 'border-error-text bg-error-soft/10' : 'border-border-control bg-surface'
              } focus:border-focus-ring focus:outline-none disabled:bg-subtle disabled:text-muted`}
            />
            {errors.estimatedHours && (
              <p role="alert" className="mt-1 text-[12px] font-semibold text-error-text">
                {errors.estimatedHours}
              </p>
            )}
          </div>

          {/* Key Focus */}
          <div>
            <label
              htmlFor="course-focus"
              className="mb-1.5 block text-[14px] font-bold text-ink"
            >
              {t('adminCourses.keyFocusLabel') || 'Key Focus Group'} *
            </label>
            <input
              id="course-focus"
              type="text"
              disabled={readOnly}
              value={values.keyFocus || ''}
              onChange={handleInputChange('keyFocus')}
              placeholder="e.g. Home row keys (ASDF JKL;)"
              className={`h-11 w-full rounded-control border px-3.5 text-[15px] text-ink transition-colors ${
                errors.keyFocus ? 'border-error-text bg-error-soft/10' : 'border-border-control bg-surface'
              } focus:border-focus-ring focus:outline-none disabled:bg-subtle disabled:text-muted`}
            />
            {errors.keyFocus && (
              <p role="alert" className="mt-1 text-[12px] font-semibold text-error-text">
                {errors.keyFocus}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Learning Objectives (SYS-58) */}
      <div className="rounded-card border border-border-subtle bg-surface p-6 shadow-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-[18px] font-bold text-ink">
              {t('adminCourses.objectivesTitle') || 'Learning Objectives'} *
            </h3>
            <p className="text-[13px] text-muted">
              {t('adminCourses.objectivesSubtitle') || 'Measurable typing outcomes and benchmark requirements.'}
            </p>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddObjective}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-control border border-border-subtle bg-subtle px-3 text-[13px] font-bold text-ink transition-colors hover:bg-hover"
            >
              <PlusIcon size={14} aria-hidden="true" />
              <span>{t('adminCourses.addObjective') || 'Add Objective'}</span>
            </button>
          )}
        </div>

        {errors.objectives && (
          <p role="alert" className="mb-3 text-[12px] font-semibold text-error-text">
            {errors.objectives}
          </p>
        )}

        <div className="flex flex-col gap-2.5">
          {(values.objectives || []).map((obj, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-subtle text-[12px] font-bold text-muted">
                {idx + 1}
              </span>
              <input
                type="text"
                disabled={readOnly}
                value={obj}
                onChange={(e) => handleObjectiveChange(idx, e.target.value)}
                placeholder={t('adminCourses.objectivePlaceholder') || 'e.g. Achieve at least 95% accuracy on home row drills'}
                className="h-10 flex-1 rounded-control border border-border-control bg-surface px-3 text-[14px] text-ink focus:border-focus-ring focus:outline-none disabled:bg-subtle disabled:text-muted"
              />
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveObjective(idx)}
                  aria-label={`Remove objective ${idx + 1}`}
                  className="flex size-10 shrink-0 items-center justify-center rounded-control border border-transparent text-muted transition-colors hover:border-border-subtle hover:text-error-text"
                >
                  <TrashIcon size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          ))}

          {(!values.objectives || values.objectives.length === 0) && (
            <p className="text-[13px] italic text-muted">
              {t('adminCourses.noObjectives') || 'No objectives defined. Add at least one objective.'}
            </p>
          )}
        </div>
      </div>

      {/* Entry Prerequisites (SYS-58) */}
      <div className="rounded-card border border-border-subtle bg-surface p-6 shadow-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-[18px] font-bold text-ink">
              {t('adminCourses.prerequisitesTitle') || 'Prerequisites & Entry Requirements'}
            </h3>
            <p className="text-[13px] text-muted">
              {t('adminCourses.prerequisitesSubtitle') || 'Prior courses, key mastery, or minimum WPM requirements.'}
            </p>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddPrerequisite}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-control border border-border-subtle bg-subtle px-3 text-[13px] font-bold text-ink transition-colors hover:bg-hover"
            >
              <PlusIcon size={14} aria-hidden="true" />
              <span>{t('adminCourses.addPrerequisite') || 'Add Prerequisite'}</span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          {(values.prerequisites || []).map((pre, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-subtle text-[12px] font-bold text-muted">
                {idx + 1}
              </span>
              <input
                type="text"
                disabled={readOnly}
                value={pre}
                onChange={(e) => handlePrerequisiteChange(idx, e.target.value)}
                placeholder={t('adminCourses.prerequisitePlaceholder') || 'e.g. Completion of Touch Typing Foundations or 25 WPM baseline'}
                className="h-10 flex-1 rounded-control border border-border-control bg-surface px-3 text-[14px] text-ink focus:border-focus-ring focus:outline-none disabled:bg-subtle disabled:text-muted"
              />
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemovePrerequisite(idx)}
                  aria-label={`Remove prerequisite ${idx + 1}`}
                  className="flex size-10 shrink-0 items-center justify-center rounded-control border border-transparent text-muted transition-colors hover:border-border-subtle hover:text-error-text"
                >
                  <TrashIcon size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          ))}

          {(!values.prerequisites || values.prerequisites.length === 0) && (
            <p className="text-[13px] italic text-muted">
              {t('adminCourses.noPrerequisites') || 'None — accessible to all learners.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
