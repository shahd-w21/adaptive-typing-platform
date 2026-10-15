export function updateKeyEvidence(row, sample, rules) {
  const smooth = (old, value) => old === null ? value : old * (1 - rules.alpha) + value * rules.alpha;
  const next = {
    attempts: row.attempts + sample.attempts,
    latencySamples: row.latencySamples + sample.timed,
    sessions: row.sessions + Number(sample.timed > 0),
    accuracy: smooth(row.accuracy, 100 * (sample.attempts - sample.errors) / sample.attempts),
    avgMs: sample.timed ? smooth(row.avgMs, sample.totalMs / sample.timed) : row.avgMs,
    status: row.status,
  };
  if (row.status === 'in_progress' && next.attempts >= rules.masteryAttempts && next.latencySamples >= rules.masteryLatencySamples
    && next.sessions >= rules.masterySessions && next.accuracy >= rules.masteryAccuracy && next.avgMs !== null
    && next.avgMs <= 1.2 * 60000 / (5 * rules.targetWpm) && rules.passed) next.status = 'mastered';
  return next;
}

export function eligibleUnlocks(groups, stats) {
  const mastered = new Set(stats.filter(row => row.status === 'mastered').map(row => row.key));
  return groups.filter(group => {
    const prerequisite = groups.find(item => item.id === group.prerequisiteId);
    return prerequisite && [...prerequisite.keys].every(key => mastered.has(key));
  }).flatMap(group => [...group.keys]);
}
