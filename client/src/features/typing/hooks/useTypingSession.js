/** Own one real practice controller above route/presentation changes. */
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth.js';
import * as api from '../../../api/sessions.js';
import { queryKeys } from '../../../lib/queryKeys.js';
import {
  createSessionController,
  SESSION_POINTER_KEY,
} from '../sessionController.js';

/** Browser privacy settings may deny storage; in-memory sessions still work. */
function tabStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

/** Bind ownership/cache refresh without mixing presentation into session identity. */
export function useTypingSession() {
  const { user, csrfToken, status } = useAuth();
  const queryClient = useQueryClient();
  const ownerId = user?.id;
  const controller = useMemo(
    () =>
      createSessionController({
        ownerId,
        csrfToken,
        api,
        storage: ownerId ? tabStorage() : undefined,
        onResult: (result) => {
          queryClient.setQueryData(
            queryKeys.session(ownerId, result.sessionId),
            result,
          );
          // The shared shell reads XP/level from /auth/me, not /dashboard.
          // Refetch that public DTO too so both surfaces show server-owned values.
          void queryClient
            .invalidateQueries({ queryKey: queryKeys.auth.current })
            .catch(() => {});
          for (const factory of [
            queryKeys.dashboard,
            queryKeys.path,
            queryKeys.progress,
            queryKeys.gamification,
            queryKeys.sessions,
          ]) {
            // A refresh failure cannot erase an officially committed result.
            void queryClient
              .invalidateQueries({ queryKey: factory(ownerId) })
              .catch(() => {});
          }
        },
      }),
    [ownerId, csrfToken, queryClient],
  );
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
  );

  useEffect(() => {
    controller.activate();
    if (ownerId) {
      void controller.recover();
    } else if (status === 'anonymous') {
      // Never clear a reload pointer while authentication is still bootstrapping.
      try {
        tabStorage()?.removeItem(SESSION_POINTER_KEY);
      } catch {
        // Optional storage may be unavailable.
      }
    }
    return () => controller.deactivate();
  }, [controller, ownerId, status]);

  return { ...snapshot, controller };
}
