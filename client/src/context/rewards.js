// Shared RewardsContext and pure event-deduplication helper.
// Kept in a .js module so React Fast Refresh and Node unit tests can both import it.
import { createContext } from 'react';

export const RewardsContext = createContext(null);

/**
 * Build deduplicated official reward notification events from a completed
 * server session result. Pure helper for unit testing and context reuse.
 */
export function buildSessionRewardEvents(
  result,
  {
    recovered = false,
    newRewards = [],
    seenIds = new Set(),
    mode = 'practice',
  } = {},
) {
  if (!result || recovered || mode === 'placement') {
    return [];
  }

  const events = [];
  const register = (event) => {
    if (!event?.id || seenIds.has(event.id)) {
      return;
    }
    seenIds.add(event.id);
    events.push(event);
  };

  for (const reward of newRewards) {
    if (reward.type === 'xp' && reward.amount > 0) {
      register({
        id: reward.id,
        type: 'xp',
        amount: reward.amount,
      });
    }
  }

  if (result.leveledUp && Number.isFinite(result.level)) {
    register({
      id: `level:${result.sessionId}:${result.level}`,
      type: 'level',
      level: result.level,
    });
  }

  if (
    result.xpEarned > 0 &&
    Number.isFinite(result.streak) &&
    result.streak > 0
  ) {
    register({
      id: `streak:${result.sessionId}:${result.streak}`,
      type: 'streak',
      streak: result.streak,
    });
  }

  return events;
}
