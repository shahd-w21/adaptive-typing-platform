// Replays accepted keystroke events against server-assigned text and derives metrics.
import { calculateMetrics } from '@typeflow/shared';
import { ReplayValidationError, validateLog } from './logValidator.js';
import { summarizeEvidence } from './evidence.js';

/**
 * Replays a canonical event stream without consulting client scores or mutable state.
 * Untimed learning sessions must finish the passage; timed sessions score only
 * events before the captured deadline and retain the full selected duration.
 */
export function replay(text, events, finishTimeMs, rules = {}) {
  const policy = validateLog(text, events, finishTimeMs, rules);
  const scoredEvents = policy.isTimed
    ? events.filter((event) => event.t <= policy.durationMs)
    : events;
  const buffer = [];
  const observations = [];
  let inserts = 0;
  let correctInserts = 0;
  let previous = null;
  let pausedAt = null;
  let pausedMs = 0;
  let focusLossCount = 0;

  for (const event of scoredEvents) {
    if (buffer.length === text.length && event.type !== 'backspace') {
      if (policy.isTimed && event.t > policy.durationMs) break;
      throw new ReplayValidationError('EVENTS_AFTER_COMPLETION', 'Events follow passage completion');
    }

    if (event.type === 'pause') {
      if (pausedAt !== null) {
        throw new ReplayValidationError('INVALID_PAUSE', 'Session is already paused');
      }
      pausedAt = event.t;
      previous = null;
      continue;
    }
    if (event.type === 'resume') {
      if (pausedAt === null) {
        throw new ReplayValidationError('INVALID_RESUME', 'Session is not paused');
      }
      pausedMs += event.t - pausedAt;
      pausedAt = null;
      previous = null;
      continue;
    }
    if (event.type === 'focusLost') {
      focusLossCount += 1;
      previous = null;
      continue;
    }
    if (pausedAt !== null) {
      throw new ReplayValidationError('INPUT_WHILE_PAUSED', 'Input is not allowed while paused');
    }
    if (event.type === 'backspace') {
      buffer.pop();
      previous = null;
      continue;
    }

    const position = buffer.length;
    const expectedKey = text[position];
    const correct = event.char === expectedKey;
    const delta = previous ? event.t - previous.t : null;
    const adjacentPair = previous?.correct && previous.position + 1 === position
      && isLetter(previous.expectedKey) && isLetter(expectedKey);
    const hasLatency = correct && adjacentPair && delta > 0
      && delta <= (rules.latencyCutoffMs ?? 2000);

    inserts += 1;
    if (correct) correctInserts += 1;
    observations.push({
      expectedKey,
      correct,
      pair: adjacentPair ? `${previous.expectedKey}${expectedKey}` : null,
      latencyMs: hasLatency ? delta : null,
    });
    previous = {
      correct,
      position,
      expectedKey,
      t: event.t,
    };
    buffer.push(event.char);

    if (policy.isTimed && buffer.length === text.length && event.t < policy.durationMs) {
      throw new ReplayValidationError('CONTENT_FAILURE', 'Assigned text ended before the timed deadline');
    }
  }

  if (pausedAt !== null) {
    throw new ReplayValidationError('INVALID_PAUSE', 'Session ended while paused');
  }
  if (!policy.isTimed && buffer.length !== text.length) {
    throw new ReplayValidationError('INCOMPLETE_PASSAGE', 'Exercise is not finished');
  }
  const finalCorrect = buffer.reduce(
    (sum, char, index) => sum + Number(char === text[index]),
    0,
  );
  const activeDurationMs = policy.isTimed
    ? policy.durationMs
    : finishTimeMs - pausedMs;
  const metrics = calculateMetrics({
    inserts,
    correctInserts,
    bufferLength: buffer.length,
    finalCorrect,
    activeDurationMs,
  });
  const evidence = summarizeEvidence(observations);

  return {
    metrics,
    keyStats: evidence.keyStats,
    pairStats: evidence.pairStats,
    focusLossCount,
    inserts,
    correctInserts,
    finalCorrect,
  };
}

/** Pair evidence covers English letters; punctuation and spaces break a pair. */
function isLetter(character) {
  return /^[a-z]$/i.test(character);
}
