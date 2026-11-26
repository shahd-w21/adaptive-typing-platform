// Account-scoped rewards query and pure progress helpers shared by views
// that display saved XP, level, streak, and daily goal totals.
import { useQuery } from '@tanstack/react-query';
import { fetchGamification } from '../../../api/gamification.js';
import { queryKeys } from '../../../lib/queryKeys.js';
import { useAuth } from '../../../hooks/useAuth.js';

/**
 * Captured starter policy value from server/src/modules/settings/starter.js.
 * Used only when /gamification does not yet include an explicit xpPerLevel field.
 */
export const CAPTURED_XP_PER_LEVEL = 500;

/**
 * Compute level-bar progress from server-owned XP and level using the
 * captured XP-per-level policy (never hardcoded Figma numbers).
 */
export function computeLevelProgress(
  xp = 0,
  level = 1,
  xpPerLevel = CAPTURED_XP_PER_LEVEL,
) {
  const safePerLevel =
    Number.isFinite(xpPerLevel) && xpPerLevel > 0
      ? xpPerLevel
      : CAPTURED_XP_PER_LEVEL;
  const safeXp = Number.isFinite(xp) && xp >= 0 ? xp : 0;
  const safeLevel = Number.isFinite(level) && level >= 1 ? level : 1;
  const xpIntoLevel = safeXp % safePerLevel;
  const xpToNextLevel = safePerLevel - xpIntoLevel;
  const percent = Math.min(
    100,
    Math.max(0, Math.round((xpIntoLevel / safePerLevel) * 100)),
  );

  return {
    xp: safeXp,
    level: safeLevel,
    nextLevel: safeLevel + 1,
    xpPerLevel: safePerLevel,
    xpIntoLevel,
    xpToNextLevel,
    percent,
  };
}

/**
 * Compute daily-goal progress in minutes without inventing missing values.
 */
export function computeDailyGoalProgress(dailyGoal) {
  const goalMinutes =
    Number.isFinite(dailyGoal?.goalMinutes) && dailyGoal.goalMinutes > 0
      ? dailyGoal.goalMinutes
      : 0;
  const minutesToday =
    Number.isFinite(dailyGoal?.minutesToday) && dailyGoal.minutesToday >= 0
      ? dailyGoal.minutesToday
      : 0;
  const remainingMinutes = Math.max(0, goalMinutes - minutesToday);
  const percent =
    goalMinutes > 0
      ? Math.min(100, Math.max(0, Math.round((minutesToday / goalMinutes) * 100)))
      : 0;

  return {
    goalMinutes,
    minutesToday,
    remainingMinutes,
    percent,
    done: Boolean(dailyGoal?.done),
  };
}

/** Allow a view to defer fetching, but never fetch without a confirmed user. */
export function useGamification(enabled = true) {
  const { user } = useAuth();
  return useQuery({
    queryKey: user
      ? queryKeys.gamification(user.id)
      : ['disabled', 'gamification'],
    queryFn: fetchGamification,
    enabled: enabled && Boolean(user),
  });
}
