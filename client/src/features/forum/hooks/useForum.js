// Account/view-scoped forum queries, list search/filters and explicit participation writes.
import {
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { createForumApi } from '../../../api/forum.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { queryKeys } from '../../../lib/queryKeys.js';

/**
 * Own list/detail pages and one write at a time. Theme/locale are deliberately
 * absent from keys so presentation changes preserve pages and form drafts.
 * The injected adapter is for isolated review/test fixtures, never a policy override.
 */
export function useForum(providedApi) {
  const { user } = useAuth();
  const accountId = user?.id;
  const role = user?.role;
  const name = user?.name;
  const instanceId = useId();
  const api = useMemo(() => providedApi ?? createForumApi({
    id: accountId,
    role,
    name,
  }), [providedApi, accountId, role, name]);
  const queryClient = useQueryClient();
  const [listOptions, setListOptions] = useState({
    page: 1,
    search: '',
    category: 'all',
    answerStatus: 'all',
  });
  const [selection, setSelection] = useState({
    threadId: null,
    page: 1,
  });
  const busy = useRef(false);
  const prefix = [
    ...(accountId ? queryKeys.owner(accountId) : ['disabled']),
    'forum',
    instanceId,
  ];
  const list = useQuery({
    queryKey: [...prefix, 'list', listOptions],
    queryFn: ({ signal }) => api.list({
      ...listOptions,
      signal,
    }),
    enabled: Boolean(accountId),
    retry: false,
    gcTime: 0,
  });
  const detail = useQuery({
    queryKey: [...prefix, 'detail', selection.threadId, selection.page],
    queryFn: ({ signal }) => api.detail({
      ...selection,
      signal,
    }),
    enabled: Boolean(accountId && selection.threadId),
    retry: false,
    gcTime: 0,
    staleTime: 0,
  });
  const mutation = useMutation({
    mutationFn: ({ method, input }) => api[method](input),
    retry: false,
    onSuccess: async (result, { method }) => {
      if (method === 'create' || method === 'reply') {
        setSelection({
          threadId: result.threadId,
          page: result.page ?? 1,
        });
      }
      // Keep controls pending through DTO refresh so a second action cannot race it.
      await queryClient.invalidateQueries({ queryKey: prefix });
    },
  });

  /** Select metadata/reply page together, avoiding a stale reply-page request on navigation. */
  function openThread(threadId) {
    mutation.reset();
    setSelection({
      threadId,
      page: 1,
    });
  }

  /** Apply list criteria and reset the page together; each combination owns its cache key. */
  function updateFilters(patch) {
    setListOptions(current => ({
      ...current,
      ...patch,
      page: 1,
    }));
  }

  /** Clear all list criteria without altering the selected thread or its reply draft. */
  function clearFilters() {
    updateFilters({
      search: '',
      category: 'all',
      answerStatus: 'all',
    });
  }

  /**
   * Submit exactly once per click; forms retain requestId on retry after a lost
   * response. Only acknowledged writes refresh DTOs; no invented success/counts.
   */
  async function perform(method, input) {
    if (busy.current) {
      return false;
    }
    busy.current = true;
    try {
      await mutation.mutateAsync({ method, input });
      return true;
    } catch {
      // The safe error is exposed by the mutation; drafts and retry keys stay intact.
      return false;
    } finally {
      busy.current = false;
    }
  }

  return {
    source: api.source,
    list,
    detail,
    listOptions,
    hasFilters: Boolean(
      listOptions.search.trim() ||
      listOptions.category !== 'all' ||
      listOptions.answerStatus !== 'all'
    ),
    updateFilters,
    clearFilters,
    setListPage: page => setListOptions(current => ({
      ...current,
      page,
    })),
    selection,
    openThread,
    setReplyPage: page => setSelection(current => ({
      ...current,
      page,
    })),
    mutation,
    perform,
  };
}
