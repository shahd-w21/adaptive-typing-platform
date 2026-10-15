import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

function hasProtocol(value, protocols) {
  try {
    return protocols.includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function loadEnvironment() {
  dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });
  return parseEnvironment(process.env);
}

export function parseEnvironment(input) {
  const schema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(5000),
    CLIENT_URL: z.url().refine(value => hasProtocol(value, ['http:', 'https:'])),
    DATABASE_URL: z.url().refine(value => hasProtocol(value, ['postgres:', 'postgresql:'])),
    JWT_SECRET: z.string().min(32).refine(value => value !== 'replace-with-a-generated-local-secret'),
    SMTP_HOST: z.string().min(1).default('localhost'),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(1025),
    SMTP_USER: z.string().default(''),
    SMTP_PASSWORD: z.string().default(''),
    MAIL_FROM: z.string().min(1).default('TypeFlow <no-reply@typeflow.local>'),
  });
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid environment: ${[...new Set(result.error.issues.map(issue => issue.path.join('.')))].join(', ')}`);
  }
  return result.data;
}
