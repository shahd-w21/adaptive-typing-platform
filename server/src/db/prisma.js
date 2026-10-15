import { PrismaClient } from '../../generated/client/index.js';
import { PrismaPg } from '@prisma/adapter-pg';

export function createDatabase(connectionString) {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString, connectionTimeoutMillis: 3000 }) });
}
