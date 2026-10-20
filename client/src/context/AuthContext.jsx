import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../api/client.js';
import { fetchCurrentSession, login, logout, register } from '../api/auth.js';
import { AuthContext } from './authContext.js';

const AUTH_QUERY_KEY = ['auth', 'me'];

async function clearProtectedQueries(queryClient) {
  await queryClient.cancelQueries();
  queryClient.removeQueries({ predicate: query => query.queryKey[0] !== 'auth' });
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchCurrentSession();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    retry: false,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const signIn = useCallback(async credentials => {
    const session = await login(credentials);
    await clearProtectedQueries(queryClient);
    queryClient.setQueryData(AUTH_QUERY_KEY, session);
    return session;
  }, [queryClient]);

  const signUp = useCallback(credentials => register(credentials), []);

  const clearSession = useCallback(async () => {
    await clearProtectedQueries(queryClient);
    queryClient.setQueryData(AUTH_QUERY_KEY, null);
  }, [queryClient]);

  const signOut = useCallback(async () => {
    const session = queryClient.getQueryData(AUTH_QUERY_KEY);
    try {
      if (session?.csrfToken) await logout(session.csrfToken);
    } finally {
      await clearSession();
    }
  }, [queryClient, clearSession]);

  const updateUser = useCallback(user => {
    queryClient.setQueryData(AUTH_QUERY_KEY, current => current ? { ...current, user } : current);
  }, [queryClient]);

  const retrySession = useCallback(() => sessionQuery.refetch(), [sessionQuery]);
  const session = sessionQuery.data ?? null;
  const status = sessionQuery.isPending
    ? 'loading'
    : sessionQuery.isError
      ? 'error'
      : session?.user
        ? 'authenticated'
        : 'anonymous';

  const value = useMemo(() => ({
    status,
    user: session?.user ?? null,
    csrfToken: session?.csrfToken ?? null,
    error: sessionQuery.error ?? null,
    retrySession,
    signIn,
    signUp,
    signOut,
    clearSession,
    updateUser,
  }), [status, session, sessionQuery.error, retrySession, signIn, signUp, signOut, clearSession, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
