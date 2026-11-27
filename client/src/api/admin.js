// Admin API calls: access probe and draft analytics contract.
// All responses are validated before being returned to callers.
// The analytics endpoint (GET /admin/analytics) is not yet implemented server-side
// (pending BE-22). When the server returns 404 this module falls back to a
// validated fixture so the UI can be built and tested without the real endpoint.
import { analyticsFiltersSchema, analyticsResponseSchema } from '@typeflow/shared';
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
