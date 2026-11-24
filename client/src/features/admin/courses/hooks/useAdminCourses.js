/**
 * TanStack Query hooks for admin course authoring and version management.
 * Scoped by admin owner to ensure isolation and prevent cache collisions.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../../hooks/useAuth.js';
import { queryKeys } from '../../../../lib/queryKeys.js';
import {
  fetchAdminCourses,
  fetchAdminCourseById,
  saveAdminCourseDraft,
  createSuccessorDraft,
  archiveCourse,
  setAdminCourseScenario,
  getAdminCourseScenario,
  resetAdminCourseFixtureState,
} from '../../../../api/adminCourses.js';

/**
 * Hook to fetch the filtered list of admin courses (drafts, published, archived).
 *
 * @param {object} [filters={}]
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useAdminCourses(filters = {}) {
  const { user } = useAuth();
  const ownerId = user?.id || 'admin-default';

  return useQuery({
    queryKey: queryKeys.adminCourses(ownerId, filters),
    queryFn: ({ signal }) => fetchAdminCourses(filters, signal),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch a single course draft or published course detail by ID.
 *
 * @param {string} courseId
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useAdminCourse(courseId) {
  const { user } = useAuth();
  const ownerId = user?.id || 'admin-default';
  const isNew = !courseId || courseId === 'new';

  return useQuery({
    queryKey: isNew ? ['admin-course-new'] : queryKeys.adminCourse(ownerId, courseId),
    queryFn: ({ signal }) => (isNew ? null : fetchAdminCourseById(courseId, signal)),
    enabled: !isNew,
    staleTime: 10 * 1000,
  });
}

/**
 * Mutation hook to save or update a course draft with optimistic concurrency support.
 */
export function useSaveCourseDraft() {
  const queryClient = useQueryClient();
  const { user, csrfToken } = useAuth();
  const ownerId = user?.id || 'admin-default';

  return useMutation({
    mutationFn: ({ courseData, options }) =>
      saveAdminCourseDraft(courseData, csrfToken, options),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['owner', ownerId, 'admin-courses'],
      });
      if (data?.course?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.adminCourse(ownerId, data.course.id),
        });
      }
    },
  });
}

/**
 * Mutation hook to branch a successor draft from an immutable published course.
 */
export function useCreateSuccessorDraft() {
  const queryClient = useQueryClient();
  const { user, csrfToken } = useAuth();
  const ownerId = user?.id || 'admin-default';

  return useMutation({
    mutationFn: (courseId) => createSuccessorDraft(courseId, csrfToken),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['owner', ownerId, 'admin-courses'],
      });
      if (data?.course?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.adminCourse(ownerId, data.course.id),
        });
      }
    },
  });
}

/**
 * Mutation hook to archive an active course draft or published course.
 */
export function useArchiveCourse() {
  const queryClient = useQueryClient();
  const { user, csrfToken } = useAuth();
  const ownerId = user?.id || 'admin-default';

  return useMutation({
    mutationFn: (courseId) => archiveCourse(courseId, csrfToken),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['owner', ownerId, 'admin-courses'],
      });
      if (data?.course?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.adminCourse(ownerId, data.course.id),
        });
      }
    },
  });
}

/**
 * Hook to manage reviewer verification scenarios for courses administration.
 */
export function useAdminCourseScenario() {
  const [scenario, setScenarioState] = useState(getAdminCourseScenario());
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const ownerId = user?.id || 'admin-default';

  const setScenario = (newScenario) => {
    setAdminCourseScenario(newScenario);
    setScenarioState(newScenario);
    queryClient.invalidateQueries({
      queryKey: ['owner', ownerId, 'admin-courses'],
    });
  };

  const resetFixture = () => {
    resetAdminCourseFixtureState();
    setScenarioState('default');
    queryClient.invalidateQueries({
      queryKey: ['owner', ownerId, 'admin-courses'],
    });
  };

  return {
    scenario,
    setScenario,
    resetFixture,
  };
}
