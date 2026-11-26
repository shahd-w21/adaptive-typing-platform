// Summarizes replay observations into independent key and eligible-pair evidence.

/**
 * Aggregates expected-key attempts and adjacent-pair observations from replay.
 * A pair attempt requires the preceding expected key to be correct and no edit,
 * pause, or intervening mistake; a wrong second key then counts as a pair error.
 */
export function summarizeEvidence(observations) {
  const keyStats = {};
  const pairStats = {};

  for (const observation of observations) {
    const key = keyStats[observation.expectedKey] ??= createEvidenceRow();
    addAttempt(key, observation.correct, observation.latencyMs);

    if (observation.pair === null) continue;
    const pair = pairStats[observation.pair] ??= createEvidenceRow();
    addAttempt(pair, observation.correct, observation.latencyMs);
  }

  return { keyStats, pairStats };
}

/** Creates the stable evidence shape used by learning and reporting consumers. */
function createEvidenceRow() {
  return {
    attempts: 0,
    errors: 0,
    totalMs: 0,
    timed: 0,
  };
}

/** Updates count-based accuracy and independently sampled latency evidence. */
function addAttempt(row, correct, latencyMs) {
  row.attempts += 1;
  if (!correct) row.errors += 1;
  if (latencyMs !== null) {
    row.totalMs += latencyMs;
    row.timed += 1;
  }
}
