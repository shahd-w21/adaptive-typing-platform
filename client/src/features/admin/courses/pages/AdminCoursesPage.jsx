/**
 * Admin Courses Management Page (SYS-58, SYS-62).
 * Overview of course drafts, immutable published curricula, and archived versions.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../../../i18n/useTranslation.js';
import {
  useAdminCourses,
  useCreateSuccessorDraft,
  useArchiveCourse,
  useAdminCourseScenario,
} from '../hooks/useAdminCourses.js';
import { Loading } from '../../../../components/Loading.jsx';
import { ErrorMessage } from '../../../../components/ErrorMessage.jsx';
import {
  PlusIcon,
  RotateCcwIcon,
  KeyboardIcon,
  ArrowRightIcon,
} from '../../../../components/ui/Icons.jsx';

export function AdminCoursesPage() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();

  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'draft' | 'published' | 'archived'
  const [levelFilter, setLevelFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, error, refetch } = useAdminCourses({
    status: statusFilter,
    level: levelFilter,
    topic: topicFilter,
    search: searchQuery,
  });

  const successorMutation = useCreateSuccessorDraft();
  const archiveMutation = useArchiveCourse();
  const { scenario, setScenario, resetFixture } = useAdminCourseScenario();

  const courses = data?.courses || [];

  const handleCreateSuccessor = async (courseId) => {
    try {
      const res = await successorMutation.mutateAsync(courseId);
      if (res?.course?.id) {
        navigate(`/admin/courses/${res.course.id}/edit`);
      }
    } catch (err) {
      alert(err.message || 'Failed to create successor draft.');
    }
  };

  const handleArchive = async (courseId) => {
    const confirm = window.confirm(
      t('adminCourses.confirmArchivePrompt') ||
        'Are you sure you want to archive this course? It will be marked read-only and closed to new student enrollments.',
    );
    if (!confirm) return;

    try {
      await archiveMutation.mutateAsync(courseId);
    } catch (err) {
      alert(err.message || 'Failed to archive course.');
    }
  };

  return (
    <div className="mx-auto my-0 max-w-270 pb-12">
      {/* Reviewer Demonstration Scenario Switcher */}
      <aside
        aria-label="Reviewer demonstration controls"
        className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-subtle bg-subtle/70 px-4 py-2.5 text-[13px]"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-ink">Reviewer Scenario (FE-22):</span>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            aria-label="Select simulation scenario for review"
            className="rounded-control border border-border-control bg-surface px-2.5 py-1 text-[13px] font-medium text-ink"
          >
            <option value="default">Default (Drafts & Published Curricula)</option>
            <option value="empty">Empty Course List (0 Curricula)</option>
            <option value="serverError">Server Error (500 Load Failure)</option>
          </select>

          <button
            type="button"
            onClick={resetFixture}
            className="inline-flex items-center gap-1 text-[12px] font-bold text-action-link underline"
          >
            <RotateCcwIcon size={12} aria-hidden="true" />
            <span>Reset Fixtures</span>
          </button>
        </div>

        <span className="rounded bg-surface px-2 py-0.5 font-mono text-[11px] text-muted shadow-xs">
          SYS-58 / SYS-62 Admin Course Scenarios
        </span>
      </aside>

      {/* Header and New Course Action */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-border-subtle pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-[28px] font-bold text-ink md:text-[32px]">
            {t('adminCourses.pageTitle') || 'Course Curriculum Management'}
          </h1>
          <p className="mt-1 text-[15px] text-muted">
            {t('adminCourses.pageSubtitle') ||
              'Author course drafts, review published versions, branch successor revisions, and manage curricula.'}
          </p>
        </div>

        <Link
          to="/admin/courses/new"
          className="inline-flex min-h-11 items-center gap-2 rounded-control bg-action-primary px-5 text-[14px] font-bold text-action-foreground shadow-sm transition-colors hover:bg-action-hover"
        >
          <PlusIcon size={16} aria-hidden="true" />
          <span>{t('adminCourses.createDraftAction') || 'New Course Draft'}</span>
        </Link>
      </div>

      {/* Filter Tabs by Course Status */}
      <nav aria-label="Course status filters" className="mb-6 flex flex-wrap gap-2 border-b border-border-subtle pb-3">
        {[
          { id: 'all', label: t('adminCourses.allStatus') || 'All Curricula' },
          { id: 'draft', label: t('adminCourses.draftsTab') || 'Drafts' },
          { id: 'published', label: t('adminCourses.publishedTab') || 'Published' },
          { id: 'archived', label: t('adminCourses.archivedTab') || 'Archived' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            aria-pressed={statusFilter === tab.id}
            className={`min-h-10 rounded-full border px-4 text-[13px] font-bold transition-colors ${
              statusFilter === tab.id
                ? 'border-transparent bg-action-primary text-action-foreground shadow-sm'
                : 'border-border-subtle bg-surface text-ink hover:bg-subtle'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Search and Secondary Filters */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        {/* Search */}
        <div className="sm:col-span-2">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              t('adminCourses.searchPlaceholder') ||
              'Search by title, slug, topic, or focus keys…'
            }
            className="h-11 w-full rounded-control border border-border-control bg-surface px-3.5 text-[14px] text-ink focus:border-focus-ring focus:outline-none"
          />
        </div>

        {/* Level */}
        <div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            aria-label="Filter by level"
            className="h-11 w-full rounded-control border border-border-control bg-surface px-3 text-[14px] text-ink focus:border-focus-ring focus:outline-none"
          >
            <option value="all">{t('adminCourses.allLevels') || 'All Levels'}</option>
            <option value="beginner">{t('adminCourses.levelBeginner') || 'Beginner'}</option>
            <option value="intermediate">{t('adminCourses.levelIntermediate') || 'Intermediate'}</option>
            <option value="advanced">{t('adminCourses.levelAdvanced') || 'Advanced'}</option>
          </select>
        </div>

        {/* Topic */}
        <div>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            aria-label="Filter by topic"
            className="h-11 w-full rounded-control border border-border-control bg-surface px-3 text-[14px] text-ink focus:border-focus-ring focus:outline-none"
          >
            <option value="all">{t('adminCourses.allTopics') || 'All Topics'}</option>
            <option value="foundations">{t('adminCourses.topicFoundations') || 'Foundations'}</option>
            <option value="speed">{t('adminCourses.topicSpeed') || 'Speed & Fluency'}</option>
            <option value="numbers_symbols">{t('adminCourses.topicSymbols') || 'Numbers & Symbols'}</option>
            <option value="code_prose">{t('adminCourses.topicCode') || 'Code & Syntax'}</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center p-8">
          <Loading message={t('adminCourses.loadingCourses') || 'Loading admin curricula…'} />
        </div>
      ) : isError ? (
        <div className="rounded-card border border-border-subtle bg-surface p-6 shadow-card">
          <ErrorMessage error={error} onRetry={() => refetch()} />
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-card border-2 border-dashed border-border-subtle bg-surface p-12 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-subtle text-muted">
            <KeyboardIcon size={24} aria-hidden="true" />
          </div>
          <h3 className="font-display text-[18px] font-bold text-ink">
            {searchQuery || statusFilter !== 'all' || levelFilter !== 'all' || topicFilter !== 'all'
              ? t('adminCourses.noMatchTitle') || 'No Matching Courses Found'
              : t('adminCourses.emptyTitle') || 'No Courses or Drafts Available'}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-[14px] text-muted">
            {searchQuery || statusFilter !== 'all' || levelFilter !== 'all' || topicFilter !== 'all'
              ? t('adminCourses.noMatchDescription') ||
                'Try adjusting or resetting your search and filter parameters.'
              : t('adminCourses.emptyDescription') ||
                'Get started by creating your first course curriculum draft.'}
          </p>

          <Link
            to="/admin/courses/new"
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-control bg-action-primary px-4 text-[13px] font-bold text-action-foreground shadow-sm hover:bg-action-hover"
          >
            <PlusIcon size={15} aria-hidden="true" />
            <span>{t('adminCourses.createDraftAction') || 'Create New Course Draft'}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {courses.map((course) => {
            const isDraft = course.status === 'draft';
            const isPublished = course.status === 'published';
            const isArchived = course.status === 'archived';

            return (
              <div
                key={course.id}
                className="flex flex-col justify-between gap-4 rounded-card border border-border-subtle bg-surface p-6 shadow-card transition-all hover:border-border-control md:flex-row md:items-center"
              >
                <div className="flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    {/* Status Badge */}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        isPublished
                          ? 'bg-success-soft text-success-text'
                          : isArchived
                            ? 'bg-subtle text-muted'
                            : 'bg-warning-soft text-warning-text'
                      }`}
                    >
                      {isPublished
                        ? t('adminCourses.publishedBadge') || 'Published'
                        : isArchived
                          ? t('adminCourses.archivedBadge') || 'Archived'
                          : t('adminCourses.draftBadge') || 'Draft'}
                    </span>

                    {/* Version Tag */}
                    <span className="rounded bg-subtle px-2 py-0.5 font-mono text-[11px] font-bold text-ink">
                      {course.versionLabel || 'v1.0.0'}
                    </span>

                    {/* Level / Topic Chips */}
                    <span className="rounded bg-subtle px-2 py-0.5 text-[11px] font-medium text-muted capitalize">
                      {course.level}
                    </span>
                    <span className="rounded bg-subtle px-2 py-0.5 text-[11px] font-medium text-muted">
                      {course.topic}
                    </span>
                  </div>

                  <h2 className="font-display text-[18px] font-bold text-ink">
                    <Link
                      to={`/admin/courses/${course.id}/edit`}
                      className="hover:text-action-link"
                    >
                      {course.title}
                    </Link>
                  </h2>

                  <p className="mt-1 line-clamp-2 text-[14px] text-muted">
                    {course.description || course.keyFocus}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-muted">
                    <span>
                      <strong className="text-ink">{course.totalUnits || 0}</strong>{' '}
                      {t('adminCourses.unitsCount') || 'units'}
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-ink">{course.totalLessons || 0}</strong>{' '}
                      {t('adminCourses.lessonsCount') || 'lessons'}
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-ink">{course.estimatedHours}</strong> hrs
                    </span>
                    {course.author && (
                      <>
                        <span>•</span>
                        <span>
                          Author: <strong className="text-ink">{course.author}</strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Course Actions */}
                <div className="flex flex-wrap items-center gap-2 md:shrink-0">
                  <Link
                    to={`/admin/courses/${course.id}/edit`}
                    className={`inline-flex min-h-10 items-center gap-1.5 rounded-control px-4 text-[13px] font-bold shadow-xs transition-colors ${
                      isDraft
                        ? 'bg-action-primary text-action-foreground hover:bg-action-hover'
                        : 'border border-border-control bg-surface text-ink hover:bg-subtle'
                    }`}
                  >
                    <span>
                      {isDraft
                        ? t('adminCourses.editDraft') || 'Edit Draft'
                        : t('adminCourses.viewCourse') || 'View Course'}
                    </span>
                    <ArrowRightIcon size={14} className={isRTL ? 'rotate-180' : ''} aria-hidden="true" />
                  </Link>

                  {isPublished && (
                    <button
                      type="button"
                      onClick={() => handleCreateSuccessor(course.id)}
                      disabled={successorMutation.isPending}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-control border border-border-subtle bg-subtle px-3.5 text-[13px] font-bold text-ink transition-colors hover:bg-hover"
                    >
                      <PlusIcon size={14} aria-hidden="true" />
                      <span>{t('adminCourses.successorAction') || 'Successor Draft'}</span>
                    </button>
                  )}

                  {!isArchived && (
                    <button
                      type="button"
                      onClick={() => handleArchive(course.id)}
                      className="inline-flex min-h-10 items-center rounded-control border border-transparent px-3 text-[13px] font-semibold text-muted hover:text-error-text"
                    >
                      {t('adminCourses.archive') || 'Archive'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
