/** Canonical client event and submission payload schemas for typing sessions. */
import { z } from 'zod';

// Shape validation runs at both boundaries; replay checks sequence semantics.
export const eventSchema = z.discriminatedUnion('type', [
  z
    .object({
      seq: z.number().int().nonnegative(),
      type: z.literal('insert'),
      t: z.number().finite().nonnegative(),
      char: z.string().length(1).regex(/^[ -~]$/),
    })
    .strict(),
  ...['backspace', 'pause', 'resume', 'focusLost'].map((type) =>
    z
      .object({
        seq: z.number().int().nonnegative(),
        type: z.literal(type),
        t: z.number().finite().nonnegative(),
      })
      .strict(),
  ),
]);

// Client scores and correctness claims are excluded from the canonical payload.
export const submissionSchema = z
  .object({
    events: z.array(eventSchema).min(1).max(10000),
    finishTimeMs: z.number().finite().nonnegative(),
  })
  .strict();
