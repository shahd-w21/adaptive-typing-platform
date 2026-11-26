// Preserves the teammate's explainable placement/practice/timed recommendations.
export function recommendNext({ placementDone, completedSessions, keys }) {
  if (!placementDone && completedSessions === 0) return { activity: 'placement', reason: 'Find your starting level, or skip it and start at the home row.' };
  const active = keys.filter(item => item.status === 'in_progress');
  if (!active.length) return { activity: 'timed', reason: 'You have mastered every key. Try a timed test.' };
  const unknown = active.filter(item => item.accuracy === null || item.avgMs === null);
  if (unknown.length) return { activity: 'practice', reason: `Collect more evidence for: ${unknown.map(item => item.key).join(' ')}` };
  const weakest = [...active].sort((a, b) => a.accuracy - b.accuracy || b.avgMs - a.avgMs)[0];
  return { activity: 'practice', reason: `Your weakest key right now is "${weakest.key}" (${Math.round(weakest.accuracy)}% accuracy).`, weakestKey: weakest.key };
}
