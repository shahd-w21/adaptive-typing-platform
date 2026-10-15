import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

export function loadEnvironment() {
  dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });
  return parseEnvironment(process.env);
}

export function parseEnvironment(input) {
  const schema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(5000),
    CLIENT_URL: z.url().refine(value => ['http:', 'https:'].includes(new URL(value).protocol)),
    DATABASE_URL: z.url().refine(value => ['postgres:', 'postgresql:'].includes(new URL(value).protocol)),
  });
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid environment: ${[...new Set(result.error.issues.map(issue => issue.path.join('.')))].join(', ')}`);
  }
  return result.data;
}
