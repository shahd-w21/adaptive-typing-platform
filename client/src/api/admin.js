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
  adminContentSchema,
  contentValidationSchema,
  learningSettingsSchema,
  activateLearningSettingsSchema,
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

// ---------------------------------------------------------------------------
// Draft FE-23 content and settings boundary
// ---------------------------------------------------------------------------

const INITIAL_ADMIN_CONTENT = {
  version: 'v1.2.0',
  wordLists: [
    {
      id: 'home-row-en',
      language: 'en',
      words: ['ask', 'sad', 'dad', 'fall', 'lass', 'salad'],
      source: 'team-authored',
    },
  ],
  blockedWords: {
    words: ['blocked-example'],
  },
  themes: [
    {
      id: 'everyday',
      label: 'Everyday words',
      wordListIds: ['home-row-en'],
    },
  ],
  keyGroups: [
    {
      id: 'home-row',
      label: 'Home row',
      keys: ['a', 's', 'd', 'f', 'j', 'k', 'l'],
      prerequisiteGroupIds: [],
    },
  ],
};

/**
 * Creates an explicit development-only content-authoring adapter.
 * Production fails closed because FE-23 route contracts and server validation
 * are still pending. The fixture never changes scoring or exercise assignments.
 *
 * @param {{ role?: string }} user
 * @param {{ mode?: 'fixture'|'unavailable', csrfToken?: string|null }} [options]
 * @returns {object}
 */
export function createAdminContentApi(
  user,
  { mode = import.meta.env?.DEV ? 'fixture' : 'unavailable', csrfToken = null } = {},
) {
  if (mode !== 'fixture') {
    const unavailable = async () => {
      throw new ApiError('Content management is not connected to an API yet.', {
        code: 'FEATURE_UNAVAILABLE',
      });
    };
    return {
      source: 'unavailable',
      get: unavailable,
      validate: unavailable,
      activate: unavailable,
    };
  }

  let content = {
    ...INITIAL_ADMIN_CONTENT,
    wordLists: INITIAL_ADMIN_CONTENT.wordLists.map((item) => ({
      ...item,
      words: [...item.words],
    })),
    blockedWords: {
      words: [...INITIAL_ADMIN_CONTENT.blockedWords.words],
    },
    themes: INITIAL_ADMIN_CONTENT.themes.map((item) => ({
      ...item,
      wordListIds: [...item.wordListIds],
    })),
    keyGroups: INITIAL_ADMIN_CONTENT.keyGroups.map((item) => ({
      ...item,
      keys: [...item.keys],
      prerequisiteGroupIds: [...item.prerequisiteGroupIds],
    })),
  };

  function requireWrite() {
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

  async function get() {
    const parsed = adminContentSchema.safeParse(content);
    if (!parsed.success) {
      throw new ApiError('Invalid content response from server.', {
        status: 500,
        code: 'CONTRACT_ERROR',
      });
    }
    return parsed.data;
  }

  function normalizeDraft(input) {
    return {
      version: input.version || content.version,
      wordLists: [
        {
          id: 'home-row-en',
          language: 'en',
          words: input.words,
          source: input.source || 'team-authored',
        },
      ],
      blockedWords: {
        words: input.blockedWords,
      },
      themes: [
        {
          id: 'everyday',
          label: input.themeLabel,
          wordListIds: ['home-row-en'],
        },
      ],
      keyGroups: [
        {
          id: 'home-row',
          label: 'Home row',
          keys: input.keys,
          prerequisiteGroupIds: input.prerequisites,
        },
      ],
    };
  }

  async function validate(input) {
    requireWrite();
    const draft = normalizeDraft(input);
    const errors = [];
    const parsed = adminContentSchema.safeParse(draft);
    if (!parsed.success) {
      errors.push('One or more content fields are missing or invalid.');
    }

    const uniqueKeys = new Set(draft.keyGroups[0].keys);
    if (uniqueKeys.size !== draft.keyGroups[0].keys.length) {
      errors.push('Key-group membership contains duplicates.');
    }
    for (const prerequisite of draft.keyGroups[0].prerequisiteGroupIds) {
      if (!draft.keyGroups.some((group) => group.id === prerequisite)) {
        errors.push(`Missing prerequisite group: ${prerequisite}.`);
      }
    }
    for (const word of draft.wordLists[0].words) {
      if ([...word].some((character) => !draft.keyGroups[0].keys.includes(character))) {
        errors.push(`Word is outside the active key alphabet: ${word}.`);
      }
      if (draft.blockedWords.words.includes(word)) {
        errors.push(`Blocked word is present in the word list: ${word}.`);
      }
    }

    const nextVersion = draft.version === 'v1.2.0' ? 'v1.2.1' : draft.version;
    const payload = {
      valid: errors.length === 0,
      version: nextVersion,
      errors,
      preview: {
        beginner: draft.wordLists[0].words.slice(0, 3).join(' '),
        advanced: draft.wordLists[0].words.slice(-3).join(' '),
      },
    };
    const validated = contentValidationSchema.safeParse(payload);
    if (!validated.success) {
      throw new ApiError('Invalid validation response from server.', {
        status: 500,
        code: 'CONTRACT_ERROR',
      });
    }
    return validated.data;
  }

  async function activate(input) {
    requireWrite();
    const validation = await validate(input);
    if (!validation.valid) {
      throw new ApiError('Correct the content validation errors before activation.', {
        status: 400,
        code: 'INVALID_REQUEST',
      });
    }

    content = normalizeDraft({
      ...input,
      version: validation.version,
    });
    const parsed = adminContentSchema.safeParse(content);
    if (!parsed.success) {
      throw new ApiError('Invalid content response from server.', {
        status: 500,
        code: 'CONTRACT_ERROR',
      });
    }
    content = parsed.data;
    return {
      activated: true,
      version: content.version,
    };
  }

  return {
    source: 'fixture',
    get,
    validate,
    activate,
  };
}

let fixtureLearningSettings = {
  currentVersion: 'v1.2.0',
  rawAccuracyGatePercent: 95,
  difficultyReductionPercent: 90,
  initialLatencyCutoffMs: 2000,
};

/**
 * Creates a development-only versioned learning-settings adapter.
 * It models expected-version conflicts and future-session-only activation.
 *
 * @param {{ role?: string }} user
 * @param {{ mode?: 'fixture'|'unavailable', csrfToken?: string|null }} [options]
 * @returns {object}
 */
export function createAdminSettingsApi(
  user,
  { mode = import.meta.env?.DEV ? 'fixture' : 'unavailable', csrfToken = null } = {},
) {
  if (mode !== 'fixture') {
    const unavailable = async () => {
      throw new ApiError('Learning settings are not connected to an API yet.', {
        code: 'FEATURE_UNAVAILABLE',
      });
    };
    return {
      source: 'unavailable',
      get: unavailable,
      activate: unavailable,
    };
  }

  async function get() {
    const parsed = learningSettingsSchema.safeParse(fixtureLearningSettings);
    if (!parsed.success) {
      throw new ApiError('Invalid learning settings response from server.', {
        status: 500,
        code: 'CONTRACT_ERROR',
      });
    }
    return parsed.data;
  }

  async function activate(input) {
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

    const parsed = activateLearningSettingsSchema.safeParse(input);
    if (!parsed.success) {
      throw new ApiError('Check the learning settings and try again.', {
        status: 400,
        code: 'INVALID_REQUEST',
      });
    }
    if (
      parsed.data.expectedCurrentVersion
      !== fixtureLearningSettings.currentVersion
    ) {
      throw new ApiError('The settings version changed. Refresh and review it again.', {
        status: 409,
        code: 'CONFLICT',
      });
    }
    if (
      parsed.data.difficultyReductionPercent
      >= parsed.data.rawAccuracyGatePercent
    ) {
      throw new ApiError(
        'The difficulty reduction boundary must remain below the raw accuracy gate.',
        {
          status: 400,
          code: 'INVALID_REQUEST',
        },
      );
    }

    const nextVersionNumber =
      Number(fixtureLearningSettings.currentVersion.match(/v(\d+)\.(\d+)\.(\d+)/)?.[3] || 0)
      + 1;
    const nextVersion = `v1.2.${nextVersionNumber}`;
    fixtureLearningSettings = {
      currentVersion: nextVersion,
      rawAccuracyGatePercent: parsed.data.rawAccuracyGatePercent,
      difficultyReductionPercent: parsed.data.difficultyReductionPercent,
      initialLatencyCutoffMs: parsed.data.initialLatencyCutoffMs,
    };
    return { activated: true, ...fixtureLearningSettings };
  }

  return {
    source: 'fixture',
    get,
    activate,
  };
}
