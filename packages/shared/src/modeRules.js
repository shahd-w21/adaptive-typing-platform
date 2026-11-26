/** Captured rules attached to an implemented practice assignment. */
import { z } from 'zod';

// Future modes need an agreed rules shape before this practice contract expands.
export const sessionRulesSchema = z
  .object({
    pauseAllowed: z.literal(true),
    eventVersion: z.literal(1),
    settingsVersion: z.string(),
    targetWpm: z.number(),
  })
  .strict();
