import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../i18n/useTranslation.js';
import { useCourseDetail, useMyCourses, useEnrollCourse } from '../hooks/useCourses.js';
import { Loading } from '../../../components/Loading.jsx';
import { ErrorMessage } from '../../../components/ErrorMessage.jsx';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  LockIcon,
} from '../../../components/ui/Icons.jsx';

/**
 * CourseDetailPage: Full course overview, objectives, prerequisites, syllabus preview, and enrollment action.
 * SYS-57-58, SYS-61.
 */
export function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [expandedUnit, setExpandedUnit] = useState(1);
  const [enrollFeedback, setEnrollFeedback] = useState(null);

  const {
    data: courseData,
    isPending,
    isError,
    error,
    refetch,
  } = useCourseDetail(courseId);

  const { data: myCoursesData } = useMyCourses();
  const enrollMutation = useEnrollCourse();

  const course = courseData?.course;
  const isFixture = courseData?.isFixture ?? true;
  const enrollments = myCoursesData?.enrollments || [];
  const existingEnrollment = enrollments.find(
    (e) => e.courseId === course?.id || e.courseId === courseId,
  );

  const isArchived = course?.status === 'archived';
  const isEnrolled = Boolean(existingEnrollment);

  const handleEnroll = async () => {
    if (!course) return;
    setEnrollFeedback(null);
    try {
      await enrollMutation.mutateAsync(course.id);
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

  const handleResume = () => {
    navigate(existingEnrollment?.resumeLink || '/learning-path');
  };

  if (isPending) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Loading message={t('courses.loadingDetails')} size="lg" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <ErrorMessage
          title={t('courses.courseNotFoundTitle')}
          message={error?.message || t('courses.courseNotFoundDesc')}
          onRetry={refetch}
        />
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-5 py-2 text-sm font-semibold text-ink shadow-sm hover:bg-subtle"
          >
            <ArrowLeftIcon size={16} />
            <span>{t('courses.backToCatalog')}</span>
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Back Navigation Button */}
      <div className="mb-5">
        <button
          type="button"
          onClick={() => navigate('/courses')}
          className="inline-flex items-center gap-2 rounded-control px-2 py-1 text-sm font-medium text-muted transition-colors hover:text-ink focus:outline-none focus:ring-1 focus:ring-learning-accent"
        >
          <ArrowLeftIcon size={16} aria-hidden="true" />
          <span>{t('courses.backToCatalog')}</span>
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

      {/* Main Grid: Overview (2/3) + Sticky Action Sidebar (1/3) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Course Overview */}
        <div className="space-y-8 lg:col-span-2">
          {/* Header Card */}
          <div className="rounded-card border border-border-subtle bg-surface p-6 shadow-card sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  levelStyles[course.level] || levelStyles.beginner
                }`}
              >
                {levelLabels[course.level] || course.level}
              </span>
              <span className="rounded-full bg-subtle px-3 py-0.5 text-xs font-medium text-muted">
                {topicLabels[course.topic] || course.topic}
              </span>
              {isArchived && (
                <span className="inline-flex items-center gap-1 rounded-full bg-subtle px-3 py-0.5 text-xs font-bold text-muted">
                  <LockIcon size={13} aria-hidden="true" />
                  <span>{t('courses.statusArchived')}</span>
                </span>
              )}
            </div>

            <h1 className="mb-4 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {course.title}
            </h1>

            <p className="mb-6 text-base leading-relaxed text-muted">
              {course.description}
            </p>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 gap-4 rounded-control bg-page/80 p-4 border border-border-subtle/50 sm:grid-cols-4">
              <div>
                <div className="text-xs text-muted">{t('courses.estimatedTime')}</div>
                <div className="mt-0.5 font-display text-base font-bold text-ink">
                  {course.estimatedHours} {t('courses.hoursUnit')}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted">{t('courses.unitsLabel')}</div>
                <div className="mt-0.5 font-display text-base font-bold text-ink">
                  {course.totalUnits} {t('courses.unitsUnit')}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted">{t('courses.lessonsLabel')}</div>
                <div className="mt-0.5 font-display text-base font-bold text-ink">
                  {course.totalLessons} {t('courses.lessonsUnit')}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted">{t('courses.versionLabel')}</div>
                <div className="mt-0.5 font-mono text-xs font-bold text-muted truncate" title={course.versionId}>
                  {course.versionId}
                </div>
              </div>
            </div>
          </div>

          {/* Learning Objectives Section */}
          <div className="rounded-card border border-border-subtle bg-surface p-6 shadow-card sm:p-8">
            <h2 className="mb-4 font-display text-xl font-bold text-ink">
              {t('courses.objectivesTitle')}
            </h2>
            <ul className="space-y-3">
              {course.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-learning-soft text-learning-strong mt-0.5">
                    <CheckIcon size={13} aria-hidden="true" />
                  </span>
                  <span className="text-sm leading-relaxed text-ink">{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prerequisites Section */}
          <div className="rounded-card border border-border-subtle bg-surface p-6 shadow-card sm:p-8">
            <h2 className="mb-3 font-display text-xl font-bold text-ink">
              {t('courses.prerequisitesTitle')}
            </h2>
            <div className="rounded-control bg-subtle p-4">
              {course.prerequisites && course.prerequisites.length > 0 ? (
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq, idx) => (
                    <li key={idx} className="text-sm text-ink">
                      • {prereq}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">
                  {t('courses.noPrerequisites')}
                </p>
              )}
            </div>
          </div>

          {/* Curriculum / Path Preview Section */}
          <div className="rounded-card border border-border-subtle bg-surface p-6 shadow-card sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-ink">
                  {t('courses.curriculumTitle')}
                </h2>
                <p className="mt-1 text-xs text-muted">
                  {t('courses.curriculumPreviewNotice')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {course.units.map((unit) => {
                const isExpanded = expandedUnit === unit.unitIndex;
                return (
                  <div
                    key={unit.id}
                    className="overflow-hidden rounded-card border border-border-subtle bg-page transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedUnit(isExpanded ? null : unit.unitIndex)
                      }
                      className="flex w-full items-center justify-between p-4 text-start hover:bg-subtle transition-colors"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-learning-soft text-xs font-bold text-learning-strong">
                          {unit.unitIndex}
                        </span>
                        <div>
                          <h3 className="font-display text-sm font-bold text-ink">
                            {unit.title}
                          </h3>
                          {unit.description && (
                            <p className="text-xs text-muted">
                              {unit.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-muted">
                        {unit.lessons?.length || unit.lessonCount}{' '}
                        {t('courses.lessonsUnit')}
                      </span>
                    </button>

                    {isExpanded && unit.lessons && (
                      <div className="border-t border-border-subtle bg-surface p-4">
                        <ul className="space-y-2.5">
                          {unit.lessons.map((lesson) => (
                            <li
                              key={lesson.id}
                              className="flex items-center justify-between rounded-control p-2 text-xs hover:bg-subtle"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="font-mono text-muted">
                                  {lesson.lessonIndex}.
                                </span>
                                <span className="font-medium text-ink">
                                  {lesson.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {lesson.keysIntroduced?.length > 0 && (
                                  <span className="rounded bg-page px-1.5 py-0.5 font-mono text-[11px] text-muted border border-border-subtle">
                                    {lesson.keysIntroduced.join(' ')}
                                  </span>
                                )}
                                <span className="rounded-full bg-subtle px-2 py-0.5 text-[11px] font-semibold text-muted uppercase">
                                  {lesson.type}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Action Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-card border border-border-subtle bg-surface p-6 shadow-card">
            <h3 className="mb-4 font-display text-lg font-bold text-ink">
              {t('courses.enrollmentCardTitle')}
            </h3>

            {/* Error or Success Alert */}
            {enrollFeedback && (
              <div className="mb-4">
                {enrollFeedback.type === 'success' ? (
                  <div
                    role="status"
                    className="rounded-card border border-learning-accent/40 bg-learning-soft p-3 text-xs font-semibold text-learning-strong"
                  >
                    {enrollFeedback.message}
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

            {isEnrolled ? (
              <div className="space-y-4">
                <div className="rounded-control bg-learning-soft/60 p-4 border border-learning-accent/30">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-bold text-learning-strong">
                      {existingEnrollment.progressPercent >= 100
                        ? t('courses.statusCompleted')
                        : t('courses.statusEnrolled')}
                    </span>
                    <span className="font-bold text-learning-strong">
                      {existingEnrollment.progressPercent}%
                    </span>
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-border-subtle"
                    role="progressbar"
                    aria-valuenow={existingEnrollment.progressPercent}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div
                      className="h-full bg-learning-accent"
                      style={{ width: `${existingEnrollment.progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-muted">
                    {existingEnrollment.completedLessonsCount} /{' '}
                    {existingEnrollment.totalLessonsCount}{' '}
                    {t('courses.lessonsCompletedLabel')}
                  </p>
                </div>

                {existingEnrollment.currentLesson && (
                  <div className="rounded-control bg-page p-3 border border-border-subtle text-xs">
                    <div className="text-muted">{t('courses.nextUp')}:</div>
                    <div className="mt-1 font-semibold text-ink">
                      {existingEnrollment.currentLesson.title}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleResume}
                  className="w-full inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-action-primary px-6 py-3 font-bold text-action-foreground shadow-primary transition-colors hover:bg-action-hover focus:outline-none focus:ring-2 focus:ring-action-focus"
                >
                  <span>{t('courses.resumeAction')}</span>
                  <ArrowRightIcon size={18} aria-hidden="true" />
                </button>
              </div>
            ) : isArchived ? (
              <div className="space-y-4">
                <div className="rounded-control bg-subtle p-4 text-xs leading-relaxed text-muted">
                  <div className="mb-1 font-bold text-ink">
                    {t('courses.archivedNoticeTitle')}
                  </div>
                  {t('courses.archivedNoticeDesc')}
                </div>
                <button
                  type="button"
                  disabled
                  className="w-full min-h-12 rounded-full border border-border-subtle bg-subtle px-6 py-3 font-bold text-muted cursor-not-allowed opacity-60"
                >
                  {t('courses.enrollmentClosed')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs leading-relaxed text-muted">
                  {t('courses.enrollDescription')}
                </p>

                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={enrollMutation.isPending}
                  className="w-full inline-flex min-h-12 items-center justify-center rounded-full bg-action-primary px-6 py-3 font-bold text-action-foreground shadow-primary transition-colors hover:bg-action-hover disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-action-focus"
                >
                  {enrollMutation.isPending
                    ? t('courses.enrollingAction')
                    : t('courses.enrollAction')}
                </button>

                <div className="text-[11px] text-center text-muted">
                  {t('courses.enrollGuaranteeNotice')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetailPage;
