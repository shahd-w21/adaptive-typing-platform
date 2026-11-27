// Own progress query state and pure client-side filtering/trend helpers.
import { useQuery } from '@tanstack/react-query';
import {
  isAssessmentMode,
  isLearningMode,
  progressFiltersSchema,
} from '@typeflow/shared';
import { fetchProgress } from '../../../api/progress.js';
import { queryKeys } from '../../../lib/queryKeys.js';
import { useAuth } from '../../../hooks/useAuth.js';

const TIME_RANGE_DAYS = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

/**
 * Filter completed sessions against validated draft filter parameters.
 * Current GET /progress does not accept server query params; this helper
 * applies the agreed filter contract locally without mutating input arrays.
 */
export function filterProgressSessions(
  sessions = [],
  rawFilters = {},
  now = new Date(),
) {
  const filters = progressFiltersSchema.parse(rawFilters);
  const cutoffMs =
    filters.timeRange === 'all'
      ? null
      : now.getTime() - TIME_RANGE_DAYS[filters.timeRange] * 86400000;

  return sessions.filter((session) => {
    if (filters.mode === 'learning' && !isLearningMode(session.mode)) {
      return false;
    }
    if (filters.mode === 'assessment' && !isAssessmentMode(session.mode)) {
      return false;
    }
    if (
      filters.mode !== 'all' &&
      filters.mode !== 'learning' &&
      filters.mode !== 'assessment' &&
      session.mode !== filters.mode
    ) {
      return false;
    }

    if (filters.difficulty !== 'all') {
      const difficultyValue =
        session.difficulty == null ? null : String(session.difficulty);
      if (difficultyValue !== filters.difficulty) {
        return false;
      }
    }

    if (cutoffMs !== null) {
      const completedTime = Date.parse(session.completedAt);
      if (!Number.isFinite(completedTime) || completedTime < cutoffMs) {
        return false;
      }
    }

    return true;
  });
}

/** Paginate filtered sessions while clamping the requested page to valid bounds. */
export function paginateProgressSessions(
  sessions = [],
  page = 1,
  pageSize = 10,
) {
  const safePageSize = Math.max(1, pageSize);
  const totalItems = sessions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safePageSize;
  return {
    items: sessions.slice(start, start + safePageSize),
    page: safePage,
    pageSize: safePageSize,
    totalPages,
    totalItems,
  };
}

/** Compute averages for one mode group; unavailable metrics remain null. */
export function summarizeModeGroup(sessions = []) {
  const average = (field) => {
    const values = sessions
      .map((session) => session[field])
      .filter((value) => Number.isFinite(value));
    return values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : null;
  };

  return {
    count: sessions.length,
    averageNetWpm: average('netWpm'),
    averageRawAccuracy: average('rawAccuracy'),
  };
}

/** Fetch only after identity is known; switching accounts selects a different cache. */
export function useProgress() {
  const { user } = useAuth();
  return useQuery({
    queryKey: user ? queryKeys.progress(user.id) : ['disabled', 'progress'],
    queryFn: fetchProgress,
    enabled: Boolean(user),
  });
}
