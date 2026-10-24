import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../i18n/useTranslation.js';
import { useMyCourses, useCourses } from '../hooks/useCourses.js';
import {
  setCourseReviewScenario,
  getCourseReviewScenario,
} from '../../../api/courses.js';
import { Loading } from '../../../components/Loading.jsx';
import { EmptyState } from '../../../components/EmptyState.jsx';
import { ErrorMessage } from '../../../components/ErrorMessage.jsx';
import {
  ArrowRightIcon,
  KeyboardIcon,
} from '../../../components/ui/Icons.jsx';

/**
 * MyCoursesPage: Student's personal dashboard of active and completed course enrollments.
 * SYS-57: owned enrollments and resumable per-course progress.
 */
export function MyCoursesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'in_progress' | 'completed'
  const [scenario, setScenario] = useState(() => getCourseReviewScenario());

  const {
    data: myCoursesData,
    isPending: isEnrollmentsPending,
    isError: isEnrollmentsError,
    error: enrollmentsError,
    refetch: refetchEnrollments,
  } = useMyCourses();

  const { data: catalogData } = useCourses();

  const enrollments = myCoursesData?.enrollments || [];
  const courses = catalogData?.courses || [];
  const isFixture = myCoursesData?.isFixture ?? true;

  const handleScenarioChange = (newScenario) => {
    setScenario(newScenario);
    setCourseReviewScenario(newScenario);
    refetchEnrollments();
  };

  // Filter enrollments based on tab
  const filteredEnrollments = enrollments.filter((enr) => {
    if (filterTab === 'completed') return enr.progressPercent >= 100;
    if (filterTab === 'in_progress') return enr.progressPercent < 100;
    return true;
  });

  const inProgressCount = enrollments.filter(
    (e) => e.progressPercent < 100,
  ).length;
  const completedCount = enrollments.filter(
    (e) => e.progressPercent >= 100,
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {t('courses.myCoursesTitle')}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {t('courses.myCoursesSubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/courses')}
          className="inline-flex items-center gap-2 rounded-full bg-action-primary px-5 py-2 text-sm font-bold text-action-foreground shadow-primary transition-colors hover:bg-action-hover focus:outline-none focus:ring-2 focus:ring-action-focus"
        >
          <span>{t('courses.browseCatalogAction')}</span>
          <ArrowRightIcon size={16} aria-hidden="true" />
        </button>
      </div>

      {/* Fixture Notice */}
      {isFixture && (
        <div
          role="note"
          className="mb-6 rounded-card border border-warning-accent/40 bg-warning-soft/70 p-3.5 text-xs text-warning-text flex items-center justify-between"
        >
          <span>{t('courses.fixtureNotice')}</span>
          <span className="rounded-control bg-warning-accent/20 px-2 py-0.5 font-mono font-bold uppercase text-[10px]">
            {t('courses.frontendOnlyTag')}
          </span>
        </div>
      )}

      {/* Review Scenario Switcher */}
      <div className="mb-6 rounded-control border border-dashed border-learning-accent/40 bg-learning-soft/30 p-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-learning-strong flex items-center gap-1.5">
            <span>🛠️</span>
            <span>{t('courses.reviewScenarioTitle')}:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleScenarioChange('default')}
              className={`rounded-control px-2.5 py-1 font-semibold transition-colors ${
                scenario === 'default'
                  ? 'bg-learning-accent text-learning-foreground'
                  : 'bg-surface text-ink border border-border-subtle hover:bg-subtle'
              }`}
            >
              {t('courses.scenarioDefault')} ({enrollments.length})
            </button>
            <button
              type="button"
              onClick={() => handleScenarioChange('empty_enrollments')}
              className={`rounded-control px-2.5 py-1 font-semibold transition-colors ${
                scenario === 'empty_enrollments'
                  ? 'bg-learning-accent text-learning-foreground'
                  : 'bg-surface text-ink border border-border-subtle hover:bg-subtle'
              }`}
            >
              {t('courses.scenarioEmptyEnrollments')}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-border-subtle bg-surface p-5 shadow-card">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider">
            {t('courses.totalEnrolled')}
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-ink">
            {enrollments.length}
          </div>
        </div>
        <div className="rounded-card border border-border-subtle bg-surface p-5 shadow-card">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider">
            {t('courses.inProgress')}
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-learning-strong">
            {inProgressCount}
          </div>
        </div>
        <div className="rounded-card border border-border-subtle bg-surface p-5 shadow-card">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider">
            {t('courses.completed')}
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-action-primary">
            {completedCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      {enrollments.length > 0 && (
        <div className="mb-6 flex items-center gap-2 border-b border-b-border-subtle pb-3">
          {[
            { id: 'all', label: t('courses.allCoursesTab') },
            { id: 'in_progress', label: `${t('courses.inProgress')} (${inProgressCount})` },
            { id: 'completed', label: `${t('courses.completed')} (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                filterTab === tab.id
                  ? 'bg-learning-accent text-learning-foreground shadow-sm'
                  : 'bg-page text-muted border border-border-subtle hover:bg-subtle hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      {isEnrollmentsPending ? (
        <div className="py-16">
          <Loading message={t('courses.loadingEnrollments')} size="lg" />
        </div>
      ) : isEnrollmentsError ? (
        <div className="py-8">
          <ErrorMessage
            title={t('common.error')}
            message={enrollmentsError?.message || t('courses.enrollmentsLoadError')}
            onRetry={refetchEnrollments}
          />
        </div>
      ) : enrollments.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={KeyboardIcon}
            title={t('courses.emptyMyCoursesTitle')}
            description={t('courses.emptyMyCoursesDescription')}
            actionLabel={t('courses.browseCatalogAction')}
            onAction={() => navigate('/courses')}
          />
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="py-12 text-center text-muted text-sm">
          {t('courses.noFilteredCourses')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEnrollments.map((enr) => {
            const course = courses.find((c) => c.id === enr.courseId) || {
              id: enr.courseId,
              title: enr.courseId,
              description: '',
              level: 'beginner',
            };
            const isFinished = enr.progressPercent >= 100;

            return (
              <article
                key={enr.id}
                className="flex flex-col justify-between rounded-card border border-border-subtle bg-surface p-6 shadow-card hover:border-learning-accent/40 transition-colors"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-learning-soft px-2.5 py-0.5 text-xs font-bold text-learning-strong border border-learning-accent/30">
                      {isFinished
                        ? t('courses.statusCompleted')
                        : t('courses.statusEnrolled')}
                    </span>
                    <span className="text-xs text-muted font-mono" title={enr.id}>
                      {enr.id.slice(0, 14)}...
                    </span>
                  </div>

                  <h3 className="mb-2 font-display text-lg font-bold text-ink">
                    <button
                      type="button"
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="text-start hover:underline hover:text-learning-strong"
                    >
                      {course.title}
                    </button>
                  </h3>

                  {/* Progress Box */}
                  <div className="mb-4 rounded-control bg-subtle p-3 text-xs">
                    <div className="mb-1 flex items-center justify-between font-semibold">
                      <span className="text-ink">{t('courses.progressLabel')}</span>
                      <span className="text-learning-strong font-bold">
                        {enr.progressPercent}%
                      </span>
                    </div>
                    <div
                      className="h-2 w-full overflow-hidden rounded-full bg-border-subtle"
                      role="progressbar"
                      aria-valuenow={enr.progressPercent}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      <div
                        className="h-full bg-learning-accent"
                        style={{ width: `${enr.progressPercent}%` }}
                      />
                    </div>
                    <div className="mt-2 text-muted">
                      {enr.completedLessonsCount} / {enr.totalLessonsCount}{' '}
                      {t('courses.lessonsCompletedLabel')}
                    </div>
                  </div>

                  {enr.currentLesson && !isFinished && (
                    <div className="mb-4 text-xs text-muted">
                      <span className="font-semibold text-ink">
                        {t('courses.currentLesson')}:{' '}
                      </span>
                      <span>{enr.currentLesson.title}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-t-border-subtle/50">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(enr.resumeLink || '/learning-path')
                    }
                    className="inline-flex flex-1 min-h-10 items-center justify-center gap-2 rounded-full bg-action-primary px-4 py-2 text-sm font-bold text-action-foreground shadow-primary transition-colors hover:bg-action-hover focus:outline-none focus:ring-2 focus:ring-action-focus"
                  >
                    <span>
                      {isFinished
                        ? t('courses.reviewCourseAction')
                        : t('courses.resumeAction')}
                    </span>
                    <ArrowRightIcon size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-action-focus"
                  >
                    {t('courses.detailsAction')}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyCoursesPage;
