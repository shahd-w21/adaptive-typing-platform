// Validates the shape and mode-specific timing rules for authoritative replay.
import { eventSchema, modePolicyFor } from '@typeflow/shared';

/**
 * A replay failure with a stable internal reason code for tests and callers.
 * @param {string} code Machine-readable failure category.
 * @param {string} message Safe explanation of the invalid event stream.
 */
export class ReplayValidationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ReplayValidationError';
    this.code = code;
  }
}

/**
 * Checks event schemas, ordering, pause policy, and the captured mode deadline.
 * Timed modes use finishTimeMs as the fixed assignment duration; later client
 * events are structurally checked but ignored by replay.
 */
export function validateLog(text, events, finishTimeMs, rules = {}) {
  if (typeof text !== 'string' || text.length === 0) {
    throw new ReplayValidationError('INVALID_TEXT', 'Assigned text must not be empty');
  }
  if (!Array.isArray(events) || events.length === 0) {
    throw new ReplayValidationError('INVALID_EVENTS', 'At least one event is required');
  }
  if (!Number.isFinite(finishTimeMs) || finishTimeMs < 0) {
    throw new ReplayValidationError('INVALID_FINISH_TIME', 'Finish time must be a nonnegative number');
  }

  const mode = rules.mode ?? 'practice';
  let modePolicy;
  try {
    modePolicy = modePolicyFor(mode);
  } catch {
    throw new ReplayValidationError('INVALID_MODE', 'Scoring mode is not supported');
  }
  const pauseAllowed = rules.pauseAllowed ?? modePolicy.pauseAllowed;
  if (pauseAllowed !== modePolicy.pauseAllowed) {
    throw new ReplayValidationError('POLICY_MISMATCH', 'Pause policy does not match the scoring mode');
  }

  const isTimed = modePolicy.timed;
  const durationMs = isTimed ? (rules.durationMs ?? finishTimeMs) : null;
  if (isTimed && (!Number.isFinite(durationMs) || durationMs <= 0 || finishTimeMs !== durationMs)) {
    throw new ReplayValidationError('INVALID_DEADLINE', 'Timed scoring requires its captured full duration');
  }

  for (let index = 0; index < events.length; index += 1) {
    const parsed = eventSchema.safeParse(events[index]);
    if (!parsed.success) {
      throw new ReplayValidationError('INVALID_EVENT', 'An event does not match the shared event contract');
    }
    const event = parsed.data;
    if (event.seq !== index || (index > 0 && event.t < events[index - 1].t)) {
      throw new ReplayValidationError('INVALID_ORDER', 'Events must have contiguous sequence numbers and ordered timestamps');
    }
    if (!isTimed && event.t > finishTimeMs) {
      throw new ReplayValidationError('INVALID_FINISH_TIME', 'An event occurs after the submitted finish time');
    }
    if (!pauseAllowed && (event.type === 'pause' || event.type === 'resume')) {
      throw new ReplayValidationError('PAUSE_NOT_ALLOWED', 'This mode does not allow pausing');
    }
    if (event.type === 'focusLost' && !modePolicy.recordsFocusLoss) {
      throw new ReplayValidationError('FOCUS_LOSS_NOT_ALLOWED', 'Focus-loss events are recorded only in certified mode');
    }
  }

  if (events[0].type !== 'insert' || events[0].t !== 0) {
    throw new ReplayValidationError('INVALID_START', 'The first event must be an insert at zero');
  }

  if (!isTimed && finishTimeMs !== events.at(-1).t) {
    throw new ReplayValidationError('INVALID_FINISH_TIME', 'Practice finish time must match the final event');
  }
  return { mode, isTimed, durationMs, pauseAllowed };
}
