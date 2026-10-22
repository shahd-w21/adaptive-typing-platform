import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth.js';
import { queryKeys } from '../../../lib/queryKeys.js';
import {
  fetchCourses,
  fetchCourseById,
  fetchMyEnrollments,
  enrollCourse,
} from '../../../api/courses.js';

/**
 * Hook to query published courses catalog with filters.
 *
 * @param {object} [filters={}] Filter options (search, level, topic, status)
 */
export function useCourses(filters = {}) {
  return useQuery({
    queryKey: queryKeys.courses(filters),
    queryFn: () => fetchCourses(filters),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to query a single course detail by ID or slug.
 *
 * @param {string} courseId Course identifier
 */
export function useCourseDetail(courseId) {
  return useQuery({
    queryKey: queryKeys.course(courseId),
    queryFn: () => fetchCourseById(courseId),
    enabled: Boolean(courseId),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to query student's enrolled courses.
 */
export function useMyCourses() {
  const { user } = useAuth();
  const ownerId = user?.id || 'student-demo';

  return useQuery({
    queryKey: queryKeys.myCourses(ownerId),
    queryFn: () => fetchMyEnrollments(),
    staleTime: 30 * 1000,
  });
}

/**
 * Mutation hook to enroll in a course.
 */
export function useEnrollCourse() {
  const queryClient = useQueryClient();
  const { csrfToken, user } = useAuth();
  const ownerId = user?.id || 'student-demo';

  return useMutation({
    mutationFn: (courseId) => enrollCourse(courseId, { csrfToken }),
    onSuccess: () => {
      // Invalidate enrollments and course queries so UI refreshes immediately
      queryClient.invalidateQueries({
        queryKey: queryKeys.myCourses(ownerId),
      });
      queryClient.invalidateQueries({
        queryKey: ['public', 'courses'],
      });
    },
  });
}
