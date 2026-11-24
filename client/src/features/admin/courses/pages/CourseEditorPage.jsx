/**
 * Course Editor Page for Admins (SYS-58, SYS-62).
 * Supports creating new drafts, editing existing drafts, immutable published inspection,
 * successor draft branching, dirty-state tracking, and stale-edit conflict resolution.
 */
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../../../i18n/useTranslation.js';
import {
  useAdminCourse,
  useSaveCourseDraft,
  useCreateSuccessorDraft,
  useArchiveCourse,
  useAdminCourseScenario,
} from '../hooks/useAdminCourses.js';
import { CourseMetadataForm } from '../components/CourseMetadataForm.jsx';
import { UnitEditor } from '../components/UnitEditor.jsx';
import { Loading } from '../../../../components/Loading.jsx';
import { ErrorMessage } from '../../../../components/ErrorMessage.jsx';
import { Dialog } from '../../../../components/ui/Dialog.jsx';
import {
  AlertCircleIcon,
  CheckIcon,
  RotateCcwIcon,
  PlusIcon,
} from '../../../../components/ui/Icons.jsx';
import { adminCourseDetailSchema } from '@typeflow/shared';

const BLANK_DRAFT = {
  id: '',
  versionId: '',
  versionLabel: 'v1.0.0-draft',
  slug: '',
  title: '',
  description: '',
  level: 'beginner',
  topic: 'foundations',
  status: 'draft',
  estimatedHours: 3.5,
  keyFocus: '',
  prerequisites: [],
  objectives: ['Master foundational typing rhythm'],
  revision: 1,
  units: [],
};

function CourseEditorForm({
  initialCourse,
  isNew,
  scenario,
  setScenario,
  onRefetch,
}) {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();

  const saveMutation = useSaveCourseDraft();
  const successorMutation = useCreateSuccessorDraft();
  const archiveMutation = useArchiveCourse();

  const [formState, setFormState] = useState(initialCourse);
  const [initialSnapshot, setInitialSnapshot] = useState(() => JSON.stringify(initialCourse));
  const [errors, setErrors] = useState({});
  const [conflictData, setConflictData] = useState(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [activeTab, setActiveTab] = useState('metadata'); // 'metadata' | 'units'
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const isDirty = JSON.stringify(formState) !== initialSnapshot;
  const isReadOnly = formState.status === 'published' || formState.status === 'archived';

  const handleMetadataChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleUnitsChange = (updatedUnits) => {
    setFormState((prev) => ({
      ...prev,
      units: updatedUnits,
      totalUnits: updatedUnits.length,
      totalLessons: updatedUnits.reduce(
        (sum, u) => sum + (u.lessons?.length || u.lessonCount || 0),
        0,
      ),
    }));
    if (errors.units) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.units;
        return copy;
      });
    }
  };

  const validateForm = () => {
    const candidate = {
      ...formState,
      id: formState.id || `c-draft-${Date.now().toString(36)}`,
      versionId: formState.versionId || `cv-${formState.slug || 'new'}-v1-draft`,
      units: formState.units || [],
    };

    const result = adminCourseDetailSchema.safeParse(candidate);
    if (!result.success) {
      const fieldErrors = {};
      for (const issue of result.error.issues) {
        const pathKey = issue.path[0];
        if (pathKey && !fieldErrors[pathKey]) {
          fieldErrors[pathKey] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSaveDraft = async (forceSave = false) => {
    if (isReadOnly) return;
    if (!validateForm()) {
      setActiveTab('metadata');
      return;
    }

    setConflictData(null);
    setSaveSuccessNotice(false);

    try {
      const res = await saveMutation.mutateAsync({
        courseData: formState,
        options: { forceSave },
      });

      if (res?.course) {
        setFormState(res.course);
        setInitialSnapshot(JSON.stringify(res.course));
        setSaveSuccessNotice(true);
        setTimeout(() => setSaveSuccessNotice(false), 5000);

        if (isNew && res.course.id) {
          navigate(`/admin/courses/${res.course.id}/edit`, { replace: true });
        }
      }
    } catch (err) {
      if (err?.status === 409 || err?.code === 'STALE_EDIT_CONFLICT') {
        // Concurrency conflict detected (SYS-62)
        setConflictData({
          message: err.message,
          serverRevision: err.serverRevision || (formState.revision || 1) + 1,
        });
      } else {
        setErrors({
          general: err?.message || 'Failed to save course draft. Please try again.',
        });
      }
    }
  };

  const handleCreateSuccessorDraft = async () => {
    if (!formState.id) return;
    try {
      const res = await successorMutation.mutateAsync(formState.id);
      if (res?.course?.id) {
        navigate(`/admin/courses/${res.course.id}/edit`);
      }
    } catch (err) {
      setErrors({
        general: err?.message || 'Failed to branch successor draft.',
      });
    }
  };

  const handleArchiveCourse = async () => {
    if (!formState.id) return;
    const confirm = window.confirm(
      t('adminCourses.confirmArchivePrompt') ||
        'Are you sure you want to archive this course? It will be marked read-only and closed to new student enrollments.',
    );
    if (!confirm) return;

    try {
      const res = await archiveMutation.mutateAsync(formState.id);
      if (res?.course) {
        setFormState(res.course);
        setInitialSnapshot(JSON.stringify(res.course));
      }
    } catch (err) {
      setErrors({ general: err?.message || 'Failed to archive course.' });
    }
  };

  const handleReloadLatest = async () => {
    setConflictData(null);
    setErrors({});
    if (onRefetch) {
      const res = await onRefetch();
      if (res?.data?.course) {
        setFormState(res.data.course);
        setInitialSnapshot(JSON.stringify(res.data.course));
      }
    }
  };

  const handleBackClick = (e) => {
    if (isDirty) {
      e.preventDefault();
      setShowDiscardConfirm(true);
    }
  };

  return (
    <div className="mx-auto my-0 max-w-270 pb-12">
      {/* Reviewer Demonstration Scenario Switcher */}
      <aside
        aria-label="Reviewer demonstration controls"
        className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-subtle bg-subtle/70 px-4 py-2.5 text-[13px]"
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-ink">Reviewer Scenario (FE-22):</span>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            aria-label="Select simulation scenario for review"
            className="rounded-control border border-border-control bg-surface px-2.5 py-1 text-[13px] font-medium text-ink"
          >
            <option value="default">Default (Normal Draft Saving)</option>
            <option value="conflict">Simulate Stale-Edit Conflict (409)</option>
            <option value="serverError">Simulate Server Error (500)</option>
          </select>
        </div>
        <span className="rounded bg-surface px-2 py-0.5 font-mono text-[11px] text-muted shadow-xs">
          SYS-58 / SYS-62 Fixture Mode
        </span>
      </aside>

      {/* Navigation and Actions Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-border-subtle pb-5 md:flex-row md:items-center">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <Link
              to="/admin/courses"
              onClick={handleBackClick}
              className="inline-flex items-center gap-1 text-[13px] font-bold text-muted transition-colors hover:text-ink"
            >
              <span className={isRTL ? 'rotate-180' : ''}>←</span>
              <span>{t('adminCourses.backToCourses') || 'Back to Courses'}</span>
            </Link>
            {isDirty && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-0.5 text-[11px] font-bold text-warning-text">
                <span className="size-1.5 rounded-full bg-warning-accent" />
                {t('adminCourses.unsavedChanges') || 'Unsaved Changes'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-[26px] font-bold text-ink md:text-[30px]">
              {isNew
                ? t('adminCourses.newCourseTitle') || 'New Course Draft'
                : formState.title || 'Untitled Course'}
            </h1>

            {/* Version Badge */}
            <span className="rounded-control bg-subtle px-2.5 py-1 font-mono text-[13px] font-bold text-ink">
              {formState.versionLabel || 'v1.0.0-draft'}
            </span>

            {/* Status Badge */}
            <span
              className={`rounded-full px-2.5 py-0.5 text-[12px] font-bold ${
                formState.status === 'published'
                  ? 'bg-success-soft text-success-text'
                  : formState.status === 'archived'
                    ? 'bg-subtle text-muted'
                    : 'bg-warning-soft text-warning-text'
              }`}
            >
              {formState.status === 'published'
                ? t('adminCourses.publishedBadge') || 'Published (Immutable)'
                : formState.status === 'archived'
                  ? t('adminCourses.archivedBadge') || 'Archived'
                  : t('adminCourses.draftBadge') || 'Draft'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isReadOnly ? (
            <>
              {formState.status === 'published' && (
                <button
                  type="button"
                  onClick={handleCreateSuccessorDraft}
                  disabled={successorMutation.isPending}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-control bg-action-primary px-4 text-[13px] font-bold text-action-foreground shadow-sm transition-colors hover:bg-action-hover disabled:opacity-50"
                >
                  <PlusIcon size={15} aria-hidden="true" />
                  <span>
                    {successorMutation.isPending
                      ? t('adminCourses.creatingSuccessor') || 'Branching…'
                      : t('adminCourses.createSuccessor') || 'Create Successor Draft'}
                  </span>
                </button>
              )}

              {formState.status !== 'archived' && (
                <button
                  type="button"
                  onClick={handleArchiveCourse}
                  disabled={archiveMutation.isPending}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-control border border-border-subtle bg-surface px-3.5 text-[13px] font-bold text-muted transition-colors hover:border-error-border hover:text-error-text"
                >
                  {t('adminCourses.archiveCourse') || 'Archive Course'}
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleSaveDraft(false)}
                disabled={saveMutation.isPending || !isDirty}
                className="inline-flex min-h-10 items-center gap-2 rounded-control bg-action-primary px-5 text-[14px] font-bold text-action-foreground shadow-sm transition-colors hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text disabled:shadow-none"
              >
                {saveMutation.isPending ? (
                  <>
                    <span className="size-3.5 animate-spin rounded-full border-2 border-action-foreground border-t-transparent" />
                    <span>{t('adminCourses.saving') || 'Saving Draft…'}</span>
                  </>
                ) : (
                  <>
                    <CheckIcon size={16} aria-hidden="true" />
                    <span>{t('adminCourses.saveDraft') || 'Save Draft'}</span>
                  </>
                )}
              </button>

              {formState.id && (
                <button
                  type="button"
                  onClick={handleArchiveCourse}
                  className="inline-flex min-h-10 items-center rounded-control border border-border-subtle bg-surface px-3.5 text-[13px] font-bold text-muted transition-colors hover:text-error-text"
                >
                  {t('adminCourses.archiveDraft') || 'Archive Draft'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Immutable Notice Banner */}
      {isReadOnly && (
        <div
          role="note"
          className="mb-6 flex items-start gap-3 rounded-card border border-border-subtle bg-subtle p-4 text-[14px]"
        >
          <AlertCircleIcon size={20} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
          <div className="flex-1">
            <h4 className="font-bold text-ink">
              {t('adminCourses.immutableTitle') || 'Published Course Version is Immutable (SYS-62)'}
            </h4>
            <p className="mt-1 text-muted">
              {t('adminCourses.immutableDescription') ||
                'To protect active student enrollments, historical replay evidence, and certificates, modifications cannot be directly saved to a published or archived course. Click "Create Successor Draft" to draft an upgraded version (e.g. v2.0.0-draft).'}
            </p>
          </div>
        </div>
      )}

      {/* Stale-Edit Conflict Banner (SYS-62) */}
      {conflictData && (
        <div
          role="alert"
          className="mb-6 rounded-card border-2 border-warning-accent bg-warning-soft/40 p-5 text-ink shadow-sm"
        >
          <div className="flex items-start gap-3">
            <AlertCircleIcon
              size={22}
              className="mt-0.5 shrink-0 text-warning-text"
              aria-hidden="true"
            />
            <div className="flex-1">
              <h4 className="font-display text-[16px] font-bold text-ink">
                {t('adminCourses.conflictTitle') || 'Stale-Edit Concurrency Conflict (SYS-62)'}
              </h4>
              <p className="mt-1 text-[14px] text-ink">
                {t('adminCourses.conflictMessage') ||
                  `Another administrator modified this course draft (server revision ${conflictData.serverRevision}) while you were editing. Your unsaved changes are preserved below and have NOT been lost.`}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSaveDraft(true)}
                  disabled={saveMutation.isPending}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-control bg-action-primary px-4 text-[13px] font-bold text-action-foreground shadow-sm hover:bg-action-hover"
                >
                  {t('adminCourses.forceSave') || 'Overwrite with My Edits'}
                </button>

                <button
                  type="button"
                  onClick={handleReloadLatest}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-control border border-border-control bg-surface px-3.5 text-[13px] font-bold text-ink hover:bg-subtle"
                >
                  <RotateCcwIcon size={14} aria-hidden="true" />
                  <span>{t('adminCourses.reloadDraft') || 'Discard & Reload Latest Version'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Notice */}
      {saveSuccessNotice && (
        <div
          role="status"
          className="mb-6 flex items-center gap-2.5 rounded-card border border-success-text/20 bg-success-soft p-4 text-[14px] font-semibold text-success-text"
        >
          <CheckIcon size={18} aria-hidden="true" />
          <span>{t('adminCourses.savedSuccess') || 'Course draft saved successfully.'}</span>
        </div>
      )}

      {/* General Form Error */}
      {errors.general && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-2.5 rounded-card border border-error-border bg-error-soft p-4 text-[14px] font-semibold text-error-text"
        >
          <AlertCircleIcon size={18} aria-hidden="true" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <nav aria-label="Course editor sections" className="mb-6 flex gap-2 border-b border-border-subtle">
        <button
          type="button"
          onClick={() => setActiveTab('metadata')}
          className={`min-h-11 border-b-2 px-5 text-[14px] font-bold transition-colors ${
            activeTab === 'metadata'
              ? 'border-action-primary text-action-primary'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          {t('adminCourses.metadataTab') || 'Course Metadata & Objectives'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('units')}
          className={`flex min-h-11 items-center gap-2 border-b-2 px-5 text-[14px] font-bold transition-colors ${
            activeTab === 'units'
              ? 'border-action-primary text-action-primary'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <span>{t('adminCourses.unitsTab') || 'Curriculum Units'}</span>
          <span className="rounded-full bg-subtle px-2 py-0.5 font-mono text-[11px] text-muted">
            {formState.units?.length || 0}
          </span>
        </button>
      </nav>

      {/* Tab Content */}
      {activeTab === 'metadata' && (
        <CourseMetadataForm
          values={formState}
          onChange={handleMetadataChange}
          errors={errors}
          readOnly={isReadOnly}
        />
      )}

      {activeTab === 'units' && (
        <UnitEditor
          units={formState.units || []}
          onChange={handleUnitsChange}
          errors={errors}
          readOnly={isReadOnly}
        />
      )}

      {/* Discard Unsaved Changes Confirm Dialog */}
      <Dialog
        open={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        title={t('adminCourses.discardConfirmTitle') || 'Discard Unsaved Changes?'}
      >
        <div className="p-1">
          <p className="text-[14px] text-muted leading-[22px]">
            {t('adminCourses.discardConfirmMessage') ||
              'You have modified this course draft without saving. Leaving now will discard all unsaved edits.'}
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowDiscardConfirm(false)}
              className="inline-flex min-h-10 items-center rounded-control border border-border-control bg-surface px-4 text-[13px] font-bold text-ink hover:bg-subtle"
            >
              {t('common.cancel') || 'Keep Editing'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDiscardConfirm(false);
                navigate('/admin/courses');
              }}
              className="inline-flex min-h-10 items-center rounded-control bg-error-text px-4 text-[13px] font-bold text-surface shadow-sm hover:opacity-90"
            >
              {t('adminCourses.discardAndLeave') || 'Discard & Leave'}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export function CourseEditorPage() {
  const { courseId } = useParams();
  const { t } = useTranslation();
  const isNew = !courseId || courseId === 'new';

  const { data, isLoading, isError, error, refetch } = useAdminCourse(courseId);
  const { scenario, setScenario } = useAdminCourseScenario();

  if (isLoading && !isNew) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <Loading message={t('adminCourses.loadingCourse') || 'Loading course draft…'} />
      </div>
    );
  }

  if (isError && !isNew) {
    return (
      <div className="mx-auto max-w-270 p-6">
        <ErrorMessage error={error} onRetry={() => refetch()} />
        <div className="mt-4">
          <Link
            to="/admin/courses"
            className="inline-flex min-h-10 items-center font-bold text-action-link"
          >
            ← {t('adminCourses.backToCourses') || 'Back to Course List'}
          </Link>
        </div>
      </div>
    );
  }

  const initialCourse = isNew ? BLANK_DRAFT : (data?.course || BLANK_DRAFT);
  const formKey = isNew ? 'new-draft' : `${initialCourse.id}-${initialCourse.revision || 1}`;

  return (
    <CourseEditorForm
      key={formKey}
      initialCourse={initialCourse}
      isNew={isNew}
      scenario={scenario}
      setScenario={setScenario}
      onRefetch={refetch}
    />
  );
}
