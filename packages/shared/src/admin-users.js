// Draft public/admin user DTO schemas for FE-18.
// These shapes exclude credentials, private keystroke data and session secrets.
import { z } from 'zod';

export const adminUserRoleSchema = z.enum(['admin', 'student']);

export const adminUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(254),
  role: adminUserRoleSchema,
  isActive: z.boolean(),
  isLastActiveAdmin: z.boolean(),
});

export const adminUserFiltersSchema = z.object({
  search: z.string().trim().max(254).default(''),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminUserListSchema = z.object({
  items: z.array(adminUserSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  totalItems: z.number().int().min(0),
  totalPages: z.number().int().min(1),
});

export const createAdminSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
}).strict();
