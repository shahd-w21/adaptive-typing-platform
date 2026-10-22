/**
 * Converts recorder snapshots to the strict shared practice submission shape.
 * Recorder-only identifiers and diagnostics never cross the API boundary.
 */
import { submissionSchema } from '@typeflow/shared';

/**
 * Project recorder data to the agreed wire body and validate it before sending.
 *
 * @param {object} recording Raw recorder snapshot or canonical submission.
 * @returns {{ events: Array<object>, finishTimeMs: number }} Validated wire body.
 * @throws {TypeError|ZodError} When the input is not an object or fails the shared schema.
 */
export function toSessionPayload(recording) {
  if (
    recording === null ||
    typeof recording !== 'object' ||
    Array.isArray(recording)
  ) {
    throw new TypeError('A session recording object is required.');
  }

  const finishTimeMs = Object.hasOwn(recording, 'finishTimeMs')
    ? recording.finishTimeMs
    : recording.finishTime;

  return submissionSchema.parse({
    events: recording.events,
    finishTimeMs,
  });
}
