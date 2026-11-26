// Coordinates validated replay and evidence derivation for one submitted session.
import { replay } from './replay.js';

export const SCORING_VERSION = 'replay-v1';

/**
 * Scores one assignment using its captured mode policy and immutable text.
 * @param {{text: string, events: Array, finishTimeMs: number, rules?: object}} input
 * @returns {ReturnType<typeof replay>} Server-derived metrics and evidence.
 */
export function scoreSession({ text, events, finishTimeMs, rules = {} }) {
  return replay(text, events, finishTimeMs, rules);
}
