// Admin API calls: access probe and draft analytics contract.
// All responses are validated before being returned to callers.
// The analytics endpoint (GET /admin/analytics) is not yet implemented server-side
// (pending BE-22). When the server returns 404 this module falls back to a
// validated fixture so the UI can be built and tested without the real endpoint.
import {
  analyticsFiltersSchema,
  analyticsResponseSchema,
  adminUserFiltersSchema,
  adminUserListSchema,
  adminUserSchema,
  createAdminSchema,
} from '@typeflow/shared';
import { request, ApiError } from './client.js';

// ---------------------------------------------------------------------------
// Admin access probe
// ---------------------------------------------------------------------------

/**
 * Verifies that the current session has admin access.
 * The server checks the cookie and the Admin role; a frontend role check is not proof.
 *
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ message: string }>}
 */
export const checkAdminAccess = ({ signal } = {}) =>
  request('/admin/ping', { signal });

// ---------------------------------------------------------------------------
// Draft analytics fixture — used until BE-22 delivers real aggregates
// ---------------------------------------------------------------------------

/** ISO datetime two days before a fixed reference point for deterministic tests. */
const FIXTURE_WINDOW_START = '2026-11-19T00:00:00.000Z';
const FIXTURE_WINDOW_END = '2026-11-26T00:00:00.000Z';

/**
 * Minimal valid analytics fixture that represents a fresh TypeFlow instance:
 *   - No AI text generation yet (fallback only), so aiPassRate is null.
 *   - Only practice mode is implemented, so only one speedByMode entry.
 *   - Rates with zero denominators are explicitly null.
 *
 * @param {string} window - '7d' | '30d' | '90d'
 * @returns {object} Raw analytics payload matching analyticsResponseSchema.
 */
function buildAnalyticsFixture(window) {
  const windowDays = window === '90d' ? 90 : window === '30d' ? 30 : 7;
  return {
    window,
    windowStart: FIXTURE_WINDOW_START,
    windowEnd: FIXTURE_WINDOW_END,
    activeUsers: { count: 0, windowDays },
    sessions: {
      total: 0,
      byMode: {},
      completionRate: null,
    },
    speedByMode: [],
    problemKeys: [],
    generation: {
      totalAssignments: 0,
      aiPassCount: 0,
      fallbackCount: 0,
      // Both rates are null because totalAssignments === 0 (zero denominator).
      aiPassRate: null,
      fallbackRate: null,
    },
    pagination: { page: 1, pageSize: 20, total: 0 },
  };
}

// ---------------------------------------------------------------------------
// fetchAnalytics
// ---------------------------------------------------------------------------

/**
 * Fetch platform analytics for the given reporting window.
 *
 * The endpoint GET /admin/analytics is a draft contract; it falls back to a
 * validated fixture with an explicit `_fixture: true` marker when the server
 * returns 404 (endpoint not yet deployed — BE-22 pending).
 *
 * @param {object} [filters={}] - Validated against analyticsFiltersSchema.
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<object>} Validated analytics payload, possibly with `_fixture: true`.
 * @throws {ApiError} with code CONTRACT_ERROR if the server response is invalid.
 */
export async function fetchAnalytics(filters = {}, { signal } = {}) {
  // Validate and normalise filter params before building the query string.
  const parsedFilters = analyticsFiltersSchema.safeParse(filters);
  if (!parsedFilters.success) {
    throw new ApiError('Invalid analytics filter parameters.', {
      status: 400,
      code: 'INVALID_REQUEST',
    });
  }

  const { window: win } = parsedFilters.data;

  let raw;
  let isFixture = false;

  try {
    // client.js intentionally rejects query strings until backend filter contracts
    // are agreed (BE-22). Call the base draft path without query params for now.
    raw = await request('/admin/analytics', { signal });
  } catch (err) {
    // Fall back to fixture when the endpoint is not yet deployed (404).
    // Any other error (401, 500, network) is re-thrown so the UI shows it.
    if (err instanceof ApiError && err.status === 404) {
      raw = buildAnalyticsFixture(win);
      isFixture = true;
    } else {
      throw err;
    }
  }

  // Validate the payload (or fixture) against the agreed contract.
  const parsed = analyticsResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError('Invalid analytics response from server.', {
      status: 500,
      code: 'CONTRACT_ERROR',
    });
  }

  // Attach fixture marker so the UI can display a development-data notice.
  if (isFixture) {
    return { ...parsed.data, _fixture: true };
  }

  return parsed.data;
}

// ---------------------------------------------------------------------------
// Draft FE-18 user-management boundary
// ---------------------------------------------------------------------------

const INITIAL_ADMIN_USERS = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Omar Salah',
    email: 'omar@example.test',
    role: 'student',
    isActive: true,
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    name: 'Layla Mahmoud',
    email: 'layla@example.test',
    role: 'student',
    isActive: true,
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    name: 'Karim Diaa',
    email: 'karim@example.test',
    role: 'student',
    isActive: false,
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    name: 'System Root',
    email: 'admin@typeflow.edu',
    role: 'admin',
    isActive: true,
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    name: 'Mina Adel',
    email: 'mina@example.test',
    role: 'student',
    isActive: true,
  },
];

/**
 * Creates a development-only, account-scoped user-management adapter.
 * Production deliberately fails closed and never substitutes fixture state
 * for real authorization. Shared/public DTOs never include secrets or credentials.
 *
 * @param {{ id?: string, role?: string }} user
 * @param {{ mode?: 'fixture'|'unavailable', csrfToken?: string|null }} [options]
 * @returns {object} User list and state-changing methods.
 */
export function createAdminUsersApi(
  user,
  { mode = import.meta.env?.DEV ? 'fixture' : 'unavailable', csrfToken = null } = {},
) {
  if (mode !== 'fixture') {
    const unavailable = async () => {
      throw new ApiError('User management is not connected to an API yet.', {
        code: 'FEATURE_UNAVAILABLE',
      });
    };
    return {
      source: 'unavailable',
      list: unavailable,
      deactivate: unavailable,
      delete: unavailable,
      createAdmin: unavailable,
    };
  }

  let users = INITIAL_ADMIN_USERS.map((item) => ({
    ...item,
  }));
  const failedOnce = new Set();

  function decorate(items) {
    const activeAdmins = users.filter(
      (item) => item.role === 'admin' && item.isActive,
    );
    return items.map((item) => ({
      ...item,
      isLastActiveAdmin:
        item.role === 'admin'
        && item.isActive
        && activeAdmins.length === 1,
    }));
  }

  function requireFixtureWrite() {
    if (user?.role?.toLowerCase() !== 'admin') {
      throw new ApiError('You do not have permission to perform this action.', {
        status: 403,
        code: 'FORBIDDEN',
      });
    }
    if (!csrfToken) {
      throw new ApiError('Your security token is missing or invalid.', {
        status: 403,
        code: 'CSRF_FAILED',
      });
    }
  }

  function validateWriteFailure(input) {
    if (
      input?.email === 'retry@example.test'
      || input?.id === '10000000-0000-4000-8000-000000000005'
    ) {
      const key = input.email || input.id;
      if (!failedOnce.has(key)) {
        failedOnce.add(key);
        throw new ApiError('The request could not be completed.', {
          status: 503,
          code: 'SERVICE_UNAVAILABLE',
        });
      }
    }
  }

  async function list(filters = {}) {
    const parsed = adminUserFiltersSchema.safeParse(filters);
    if (!parsed.success) {
      throw new ApiError('Invalid user search parameters.', {
        status: 400,
        code: 'INVALID_REQUEST',
      });
    }

    const { search, page, pageSize } = parsed.data;
    const query = search.toLowerCase();
    const filtered = users.filter((item) =>
      `${item.name} ${item.email} ${item.role}`
        .toLowerCase()
        .includes(query),
    );
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(page, totalPages);
    const items = decorate(
      filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    );
    const payload = {
      items,
      page: safePage,
      pageSize,
      totalItems,
      totalPages,
    };
    const validated = adminUserListSchema.safeParse(payload);
    if (!validated.success) {
      throw new ApiError('Invalid user response from server.', {
        status: 500,
        code: 'CONTRACT_ERROR',
      });
    }
    return Promise.resolve(validated.data);
  }

  async function deactivate(id) {
    requireFixtureWrite();
    const target = users.find((item) => item.id === id);
    if (!target) {
      throw new ApiError('The requested resource is unavailable.', {
        status: 404,
        code: 'NOT_FOUND',
      });
    }
    validateWriteFailure({ id });
    if (target.role === 'admin' && target.isActive) {
      const otherActiveAdmins = users.filter(
        (item) => item.id !== id
          && item.role === 'admin'
          && item.isActive,
      );
      if (otherActiveAdmins.length === 0) {
        throw new ApiError('Another active administrator is required.', {
          status: 409,
          code: 'LAST_ADMIN',
        });
      }
    }
    users = users.map((item) =>
      item.id === id ? { ...item, isActive: false } : item,
    );
    const updated = users.find((item) => item.id === id);
    const validated = adminUserSchema.safeParse(decorate([updated])[0]);
    if (!validated.success) {
      throw new ApiError('Invalid user response from server.', {
        status: 500,
        code: 'CONTRACT_ERROR',
      });
    }
    return Promise.resolve(validated.data);
  }

  async function deleteUser(id) {
    requireFixtureWrite();
    const target = users.find((item) => item.id === id);
    if (!target) {
      throw new ApiError('The requested resource is unavailable.', {
        status: 404,
        code: 'NOT_FOUND',
      });
    }
    validateWriteFailure({ id });
    if (target.role === 'admin' && target.isActive) {
      const otherActiveAdmins = users.filter(
        (item) => item.id !== id
          && item.role === 'admin'
          && item.isActive,
      );
      if (otherActiveAdmins.length === 0) {
        throw new ApiError('Another active administrator is required.', {
          status: 409,
          code: 'LAST_ADMIN',
        });
      }
    }
    users = users.filter((item) => item.id !== id);
    return Promise.resolve({ id, deleted: true });
  }

  async function createAdmin(input) {
    requireFixtureWrite();
    const parsed = createAdminSchema.safeParse(input);
    if (!parsed.success) {
      throw new ApiError('Check the administrator fields and try again.', {
        status: 400,
        code: 'INVALID_REQUEST',
      });
    }
    validateWriteFailure(parsed.data);
    if (users.some(
      (item) => item.email.toLowerCase() === parsed.data.email.toLowerCase(),
    )) {
      throw new ApiError('This email is already registered.', {
        status: 409,
        code: 'EMAIL_REGISTERED',
      });
    }
    const created = {
      id: crypto.randomUUID(),
      name: parsed.data.name,
      email: parsed.data.email,
      role: 'admin',
      isActive: true,
    };
    users = [created, ...users];
    const validated = adminUserSchema.safeParse(decorate([created])[0]);
    if (!validated.success) {
      throw new ApiError('Invalid user response from server.', {
        status: 500,
        code: 'CONTRACT_ERROR',
      });
    }
    return Promise.resolve(validated.data);
  }

  return {
    source: 'fixture',
    list,
    deactivate,
    delete: deleteUser,
    createAdmin,
  };
}
