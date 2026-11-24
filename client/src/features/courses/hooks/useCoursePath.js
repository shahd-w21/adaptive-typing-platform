// Custom hook for querying and managing owned course learning paths with TanStack Query.
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth.js';
import { queryKeys } from '../../../lib/queryKeys.js';
import {
  fetchCoursePath,
  setCoursePathScenario,
  getCoursePathScenario,
} from '../../../api/courses.js';

/**
 * Fetch and observe an enrolled course's learning path, units, and lesson states.
 *
 * @param {string} courseId Unique identifier or slug of the course
 * @returns {object} Query state, course path data, and reviewer scenario controls
 */
export function useCoursePath(courseId) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const ownerId = user?.id;

  const [scenario, setScenarioState] = useState(() => getCoursePathScenario());

  const queryKey = ownerId && courseId
    ? queryKeys.coursePath(ownerId, courseId)
    : ['course-path', courseId];

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchCoursePath(courseId, { ownerId }),
    enabled: Boolean(courseId),
    staleTime: 60 * 1000,
  });

  const setScenario = useCallback(
    async (nextScenario) => {
      setCoursePathScenario(nextScenario);
      setScenarioState(nextScenario);
      if (ownerId && courseId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.coursePath(ownerId, courseId),
        });
      }
    },
    [ownerId, courseId, queryClient],
  );

  return {
    path: data?.path ?? null,
    isFixture: data?.isFixture ?? false,
    isPending,
    isError,
    error,
    refetch,
    scenario,
    setScenario,
  };
}
