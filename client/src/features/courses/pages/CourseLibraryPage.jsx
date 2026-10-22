import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../i18n/useTranslation.js';
import { useCourses, useMyCourses, useEnrollCourse } from '../hooks/useCourses.js';
import {
  setCourseReviewScenario,
  getCourseReviewScenario,
} from '../../../api/courses.js';
import { CourseCard } from '../components/CourseCard.jsx';
import { CourseFilters } from '../components/CourseFilters.jsx';
import { Loading } from '../../../components/Loading.jsx';
import { EmptyState } from '../../../components/EmptyState.jsx';
import { ErrorMessage } from '../../../components/ErrorMessage.jsx';
import { KeyboardIcon } from '../../../components/ui/Icons.jsx';

/**
 * CourseLibraryPage: Searchable, filterable catalog of published typing courses.
 * SYS-57: Searchable published course library with objectives/prerequisites/path previews.
 */
export function CourseLibraryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('all');
  const [topic, setTopic] = useState('all');
  const [status, setStatus] = useState('all');
  const [scenario, setScenario] = useState(() => getCourseReviewScenario());
  const [enrollFeedback, setEnrollFeedback] = useState(null);

  const {
    data: catalogData,
    isPending: isCatalogPending,
    isError: isCatalogError,
    error: catalogError,
    refetch: refetchCatalog,
  } = useCourses({ search, level, topic, status });

  const { data: myCoursesData } = useMyCourses();
  const enrollMutation = useEnrollCourse();

  const courses = catalogData?.courses || [];
  const enrollments = myCoursesData?.enrollments || [];
  const isFixture = catalogData?.isFixture ?? true;

  const handleResetFilters = () => {
    setSearch('');
    setLevel('all');
    setTopic('all');
    setStatus('all');
  };

  const handleScenarioChange = (newScenario) => {
    setScenario(newScenario);
    setCourseReviewScenario(newScenario);
    setEnrollFeedback(null);
    refetchCatalog();
  };

  const handleEnroll = async (courseId) => {
    setEnrollFeedback(null);
    try {
      await enrollMutation.mutateAsync(courseId);
      setEnrollFeedback({
        type: 'success',
        message: t('courses.enrollSuccess'),
      });
    } catch (err) {
      setEnrollFeedback({
        type: 'error',
        message: err.message || t('courses.enrollError'),
      });
    }
  };

  const handleResume = (resumeLink) => {
    navigate(resumeLink || '/learning-path');
  };

  const handleViewDetails = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {t('courses.catalogTitle')}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {t('courses.catalogSubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/my-courses')}
          className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-subtle focus:outline-none focus:ring-2 focus:ring-learning-accent"
        >
          <span>{t('courses.myCoursesAction')}</span>
          {enrollments.length > 0 && (
            <span className="rounded-full bg-learning-soft px-2 py-0.5 text-xs font-bold text-learning-strong">
              {enrollments.length}
            </span>
          )}
        </button>
      </div>

      {/* Explicit Frontend Fixture Notice */}
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

      {/* Enrollment Result Feedback Alert */}
      {enrollFeedback && (
        <div className="mb-6">
          {enrollFeedback.type === 'success' ? (
            <div
              role="status"
              className="flex items-center justify-between rounded-card border border-learning-accent/40 bg-learning-soft p-4 text-sm font-semibold text-learning-strong"
            >
              <span>{enrollFeedback.message}</span>
              <button
                type="button"
                onClick={() => setEnrollFeedback(null)}
                className="underline text-xs"
              >
                {t('common.close')}
              </button>
            </div>
          ) : (
            <ErrorMessage
              message={enrollFeedback.message}
              onRetry={() => setEnrollFeedback(null)}
              retryLabel={t('common.close')}
            />
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <CourseFilters
        search={search}
        onSearchChange={setSearch}
        level={level}
        onLevelChange={setLevel}
        topic={topic}
        onTopicChange={setTopic}
        status={status}
        onStatusChange={setStatus}
        onReset={handleResetFilters}
        scenario={scenario}
        onScenarioChange={handleScenarioChange}
      />

      {/* Main Content States */}
      {isCatalogPending ? (
        <div className="py-16">
          <Loading message={t('courses.loadingCatalog')} size="lg" />
        </div>
      ) : isCatalogError ? (
        <div className="py-8">
          <ErrorMessage
            title={t('common.error')}
            message={catalogError?.message || t('courses.catalogLoadError')}
            onRetry={refetchCatalog}
          />
        </div>
      ) : courses.length === 0 ? (
        <div className="py-12">
          {search || level !== 'all' || topic !== 'all' || status !== 'all' ? (
            <EmptyState
              icon={KeyboardIcon}
              title={t('courses.noMatchTitle')}
              description={t('courses.noMatchDescription')}
              actionLabel={t('courses.resetFilters')}
              onAction={handleResetFilters}
            />
          ) : (
            <EmptyState
              icon={KeyboardIcon}
              title={t('courses.emptyCatalogTitle')}
              description={t('courses.emptyCatalogDescription')}
              actionLabel={t('courses.scenarioDefault')}
              onAction={() => handleScenarioChange('default')}
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const enrollment = enrollments.find(
              (e) => e.courseId === course.id,
            );
            return (
              <CourseCard
                key={course.id}
                course={course}
                enrollment={enrollment}
                onViewDetails={handleViewDetails}
                onEnroll={handleEnroll}
                onResume={handleResume}
                isEnrolling={
                  enrollMutation.isPending &&
                  enrollMutation.variables === course.id
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CourseLibraryPage;
