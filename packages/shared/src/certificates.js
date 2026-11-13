// Public certificate contracts keep verification responses separate from owner and session data.
import { z } from 'zod';

export const certificateCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^TF-[0-9]{4}-[A-Z0-9]{4,16}$/);

export const publicCertificateSchema = z.object({
  code: certificateCodeSchema,
  name: z.string().min(1).max(100),
  issueDate: z.string().date(),
  netWpm: z.number().finite().nonnegative(),
  rawAccuracy: z.number().finite().min(0).max(100),
});
