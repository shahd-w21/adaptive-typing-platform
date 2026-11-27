// Hook for reading and dismissing deduplicated official reward notifications.
import { useContext } from 'react';
import { RewardsContext } from '../context/rewards.js';

/**
 * Access official reward notifications and recording/dismissal actions.
 * Returns a safe no-op fallback when rendered outside RewardsProvider (e.g. isolated tests).
 */
export function useRewards() {
  const context = useContext(RewardsContext);
  if (!context) {
    return {
      notifications: [],
      recordSessionRewards: () => [],
      dismissNotification: () => {},
      clearNotifications: () => {},
    };
  }
  return context;
}
