import { useTranslation } from '../../../i18n/useTranslation.js';
import { RotateCcwIcon, XIcon } from '../../../components/ui/Icons.jsx';

/**
 * Filter and search controls for the published courses catalog.
 *
 * @param {object} props
 * @param {string} props.search Current search term
 * @param {(val: string) => void} props.onSearchChange Search handler
 * @param {string} props.level Selected level ('all' | 'beginner' | 'intermediate' | 'advanced')
 * @param {(val: string) => void} props.onLevelChange Level change handler
 * @param {string} props.topic Selected topic ('all' | 'foundations' | 'speed' | 'numbers_symbols' | 'code_prose')
 * @param {(val: string) => void} props.onTopicChange Topic change handler
 * @param {string} props.status Selected status ('all' | 'published' | 'archived')
 * @param {(val: string) => void} props.onStatusChange Status change handler
 * @param {() => void} props.onReset Reset handler
 * @param {string} [props.scenario] Active review scenario
 * @param {(scenario: string) => void} [props.onScenarioChange] Review scenario switch handler
 */
export function CourseFilters({
  search,
  onSearchChange,
  level,
  onLevelChange,
  topic,
  onTopicChange,
  status,
  onStatusChange,
  onReset,
  scenario = 'default',
  onScenarioChange,
}) {
  const { t, isRTL } = useTranslation();

  const levelOptions = [
    { id: 'all', label: t('courses.allLevels') },
    { id: 'beginner', label: t('courses.levelBeginner') },
    { id: 'intermediate', label: t('courses.levelIntermediate') },
    { id: 'advanced', label: t('courses.levelAdvanced') },
  ];

  const topicOptions = [
    { id: 'all', label: t('courses.allTopics') },
    { id: 'foundations', label: t('courses.topicFoundations') },
    { id: 'speed', label: t('courses.topicSpeed') },
    { id: 'numbers_symbols', label: t('courses.topicSymbols') },
    { id: 'code_prose', label: t('courses.topicCode') },
  ];

  const hasActiveFilters =
    Boolean(search) ||
    level !== 'all' ||
    topic !== 'all' ||
    (status && status !== 'all');

  return (
    <div className="mb-8 space-y-4 rounded-card border border-border-subtle bg-surface p-5 shadow-card sm:p-6">
      {/* Search Input and Primary Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('courses.searchPlaceholder')}
            className={`w-full rounded-control border border-border-subtle bg-page px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-learning-accent focus:outline-none focus:ring-2 focus:ring-learning-accent/20 ${
              search ? (isRTL ? 'ps-9' : 'pe-9') : ''
            }`}
            aria-label={t('courses.searchCourses')}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className={`absolute top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink ${
                isRTL ? 'start-2.5' : 'end-2.5'
              }`}
              aria-label={t('common.close')}
            >
              <XIcon size={16} />
            </button>
          )}
        </div>

        {/* Topic Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="course-topic-select" className="sr-only">
            {t('courses.topicLabel')}
          </label>
          <select
            id="course-topic-select"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="rounded-control border border-border-subtle bg-page px-3.5 py-2.5 text-sm font-medium text-ink focus:border-learning-accent focus:outline-none focus:ring-2 focus:ring-learning-accent/20"
          >
            {topicOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={status || 'all'}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-control border border-border-subtle bg-page px-3.5 py-2.5 text-sm font-medium text-ink focus:border-learning-accent focus:outline-none focus:ring-2 focus:ring-learning-accent/20"
            aria-label={t('courses.statusFilter')}
          >
            <option value="all">{t('courses.allStatuses')}</option>
            <option value="published">{t('courses.statusPublished')}</option>
            <option value="archived">{t('courses.statusArchived')}</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-control border border-border-subtle bg-subtle px-3 py-2 text-xs font-bold text-muted transition-colors hover:bg-border-subtle hover:text-ink"
              title={t('courses.resetFilters')}
            >
              <RotateCcwIcon size={13} aria-hidden="true" />
              <span>{t('courses.resetFilters')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Level Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-t-border-subtle/50">
        <span className="text-xs font-bold uppercase tracking-wider text-muted me-2">
          {t('courses.levelLabel')}:
        </span>
        {levelOptions.map((opt) => {
          const isActive = level === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onLevelChange(opt.id)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-learning-accent text-learning-foreground shadow-sm'
                  : 'bg-page text-muted hover:bg-subtle hover:text-ink border border-border-subtle'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Review & Fixture Verification Toolbar */}
      {onScenarioChange && (
        <div className="mt-3 rounded-control border border-dashed border-learning-accent/40 bg-learning-soft/30 p-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-learning-strong flex items-center gap-1.5">
              <span>🛠️</span>
              <span>{t('courses.reviewScenarioTitle')}:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'default', label: t('courses.scenarioDefault') },
                { id: 'empty_catalog', label: t('courses.scenarioEmptyCatalog') },
                { id: 'conflict_enroll', label: t('courses.scenarioConflict') },
                { id: 'error_enroll', label: t('courses.scenarioServerError') },
              ].map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => onScenarioChange(sc.id)}
                  className={`rounded-control px-2.5 py-1 font-semibold transition-colors ${
                    scenario === sc.id
                      ? 'bg-learning-accent text-learning-foreground'
                      : 'bg-surface text-ink border border-border-subtle hover:bg-subtle'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseFilters;
