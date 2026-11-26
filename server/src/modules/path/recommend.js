// Produces explainable next steps and the same per-user focus set used at start.
import { keyWeight, selectPracticeFocus } from '../generation/fallbackGenerator.js';

export function recommendNext({ placementDone, completedSessions, keys, targetWpm = 40, dueReviews = [] }) {
  if (!placementDone && completedSessions === 0) return { activity: 'placement', reason: 'Find your starting level, or skip it and start at the home row.' };
  const active = keys.filter(item => item.status === 'in_progress');
  if (!active.length) return { activity: 'timed', reason: 'You have mastered every key. Try a timed test.' };
  const focusKeys = selectPracticeFocus(keys, targetWpm, dueReviews);
  const weakest = [...active].sort((left, right) =>
    keyWeight(right, targetWpm) - keyWeight(left, targetWpm)
    || (left.attempts ?? 0) - (right.attempts ?? 0)
    || left.key.localeCompare(right.key))[0];
  return {
    activity: 'practice',
    reason: `Practice unlocked focus keys: ${focusKeys.join(' ')}`,
    weakestKey: weakest.key,
    focusKeys,
  };
}
