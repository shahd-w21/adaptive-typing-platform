// Cross-page official reward notifications deduplicated by server event ID.
// Never celebrates retries, recovered results, or placement attempts, and resets
// immediately when the authenticated account changes or logs out.
import { useCallback, useMemo, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { buildSessionRewardEvents, RewardsContext } from './rewards.js';

function RewardsProviderInner({ ownerId, children }) {
  const seenIdsRef = useRef(new Set());
  const [notifications, setNotifications] = useState([]);

  const recordSessionRewards = useCallback(
    (result, options = {}) => {
      if (!ownerId) {
        return [];
      }
      const events = buildSessionRewardEvents(result, {
        ...options,
        seenIds: seenIdsRef.current,
      });
      if (events.length > 0) {
        setNotifications((prev) => [...prev, ...events]);
      }
      return events;
    },
    [ownerId],
  );

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      recordSessionRewards,
      dismissNotification,
      clearNotifications,
    }),
    [
      notifications,
      recordSessionRewards,
      dismissNotification,
      clearNotifications,
    ],
  );

  return (
    <RewardsContext.Provider value={value}>{children}</RewardsContext.Provider>
  );
}

export function RewardsProvider({ children }) {
  const { user } = useAuth();
  const ownerId = user?.id ?? null;
  // Keying by ownerId resets seen IDs and pending notifications on account switch/logout.
  return (
    <RewardsProviderInner key={ownerId ?? 'guest'} ownerId={ownerId}>
      {children}
    </RewardsProviderInner>
  );
}
