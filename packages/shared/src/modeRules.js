/** Captured policy versions and SRS session-mode behavior. */
import { z } from 'zod';

export const SESSION_MODE_POLICY_VERSION = 'session-modes-v1';

const modePolicies = Object.freeze({
  placement: Object.freeze({
    pauseAllowed: false,
    timed: false,
    updatesLearning: false,
    earnsRewards: false,
    recordsFocusLoss: false,
  }),
  lesson: Object.freeze({
    pauseAllowed: true,
    timed: false,
    updatesLearning: true,
    earnsRewards: true,
    recordsFocusLoss: false,
  }),
  practice: Object.freeze({
    pauseAllowed: true,
    timed: false,
    updatesLearning: true,
    earnsRewards: true,
    recordsFocusLoss: false,
  }),
  review: Object.freeze({
    pauseAllowed: true,
    timed: false,
    updatesLearning: true,
    earnsRewards: true,
    recordsFocusLoss: false,
  }),
  timed: Object.freeze({
    pauseAllowed: false,
    timed: true,
    updatesLearning: false,
    earnsRewards: true,
    recordsFocusLoss: false,
  }),
  certified: Object.freeze({
    pauseAllowed: false,
    timed: true,
    updatesLearning: false,
    earnsRewards: true,
    recordsFocusLoss: true,
  }),
});

/**
 * Returns the fixed SRS lifecycle behavior for a known session mode.
 * @param {string} mode Persisted machine mode.
 * @returns {{pauseAllowed: boolean, timed: boolean, updatesLearning: boolean, earnsRewards: boolean, recordsFocusLoss: boolean}}
 * @throws {RangeError} When a persisted session has an unsupported mode.
 */
export function modePolicyFor(mode) {
  if (!Object.hasOwn(modePolicies, mode)) {
    throw new RangeError(`Unsupported session mode: ${mode}`);
  }
  return modePolicies[mode];
}

export const sessionRulesSchema = z
  .object({
    modePolicyVersion: z.literal(SESSION_MODE_POLICY_VERSION),
    pauseAllowed: z.boolean(),
    eventVersion: z.literal(1),
    scoringVersion: z.literal('replay-v1'),
    settingsVersion: z.string(),
    targetWpm: z.number().positive(),
    timezone: z.string(),
    durationMs: z.number().int().positive().optional(),
    maxKeystrokes: z.number().int().positive(),
    focusKeys: z.array(z.string().length(1)).max(5).optional(),
    lessonGroupId: z.number().int().positive().optional(),
    reviewKeys: z.array(z.string().length(1)).optional(),
    certifiedMinNetWpm: z.number().positive().optional(),
    certifiedMinRawAccuracy: z.number().min(0).max(100).optional(),
  })
  .strict()
  .superRefine((rules, context) => {
    if (rules.durationMs !== undefined && rules.durationMs % 60_000 !== 0) {
      context.addIssue({ code: 'custom', path: ['durationMs'], message: 'Duration must be a whole minute' });
    }
    if (rules.reviewKeys && new Set(rules.reviewKeys).size !== rules.reviewKeys.length) {
      context.addIssue({ code: 'custom', path: ['reviewKeys'], message: 'Review keys must be unique' });
    }
    if (rules.focusKeys && new Set(rules.focusKeys).size !== rules.focusKeys.length) {
      context.addIssue({ code: 'custom', path: ['focusKeys'], message: 'Focus keys must be unique' });
    }
  });
