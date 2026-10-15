import { z } from 'zod';

export const eventSchema = z.discriminatedUnion('type', [
  z.object({ seq: z.number().int().nonnegative(), type: z.literal('insert'), t: z.number().finite().nonnegative(), char: z.string().length(1).regex(/^[ -~]$/) }).strict(),
  ...['backspace', 'pause', 'resume'].map(type => z.object({ seq: z.number().int().nonnegative(), type: z.literal(type), t: z.number().finite().nonnegative() }).strict()),
]);
export const submissionSchema = z.object({ events: z.array(eventSchema).min(1).max(5000), finishTimeMs: z.number().finite().nonnegative() }).strict();
export const startSessionSchema = z.object({ mode: z.literal('practice').default('practice') }).strict();
export const idSchema = z.uuid();
