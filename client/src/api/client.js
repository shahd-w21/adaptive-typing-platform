/**
 * Shared HTTP boundary used by feature API modules.
 * Validates agreed payloads, sends cookie-authenticated requests and turns
 * failures into safe UI errors. Authentication state stays in AuthProvider;
 * rendering, caching and decisions about retrying belong to the callers.
 */
import {
  registerSchema,
  loginSchema,
  emailSchema,
  tokenSchema,
  resetPasswordSchema,
  profileSchema,
  changePasswordSchema,
  deleteAccountSchema,
  authResponseSchema,
  profileResponseSchema,
  acknowledgementSchema,
  apiErrorResponseSchema,
  startSessionSchema,
  submissionSchema,
  sessionAssignmentSchema,
  sessionResultSchema,
  sessionDetailSchema,
  sessionHistorySchema,
  sessionAbandonmentSchema,
  idSchema,
  emptyRequestSchema,
} from '@typeflow/shared';

const API_BASE_URL = (
  import.meta.env?.VITE_API_URL || 'http://localhost:5000/api/v1'
).replace(/\/$/, '');

// English fallbacks for callers that do not yet use error.messageKey with t().
// Never display arbitrary server error messages: they may contain private data.
const messages = {
  INVALID_REQUEST: 'Check the request fields and try again.',
  INVALID_CREDENTIALS: 'The email or password is incorrect.',
  INVALID_PASSWORD: 'The current password is incorrect.',
  INVALID_TOKEN: 'This link is invalid or expired.',
  EMAIL_REGISTERED: 'This email is already registered.',
  EMAIL_NOT_VERIFIED: 'Verify your email before signing in.',
  ACCOUNT_INACTIVE: 'This account is inactive.',
  LAST_ADMIN:
    'Another active administrator is required before deleting this account.',
  ACCOUNT_CHANGED: 'Your account changed. Please sign in again.',
  UNAUTHENTICATED: 'Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  ORIGIN_FORBIDDEN: 'This website origin is not allowed.',
  CSRF_FAILED:
    'Your security token is missing or invalid. Restore your session and try again.',
  NOT_FOUND: 'The requested resource is unavailable.',
  SESSION_CONFLICT: 'This session already has a different result.',
  SESSION_UNAVAILABLE: 'This session is no longer available.',
  CONFLICT: 'The request conflicts with the current state.',
  INVALID_SUBMISSION: 'The typing submission was rejected.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  CONTENT_NOT_READY: 'Practice content is not ready yet.',
  EMAIL_UNAVAILABLE: 'Email delivery is temporarily unavailable.',
  SERVICE_UNAVAILABLE: 'The service is temporarily unavailable.',
  NETWORK_ERROR: 'The service could not be reached.',
  CONTRACT_ERROR: 'The service returned an unexpected response.',
  REQUEST_FAILED: 'The request could not be completed.',
  FEATURE_UNAVAILABLE: 'This feature is not connected to an API yet.',
};

/**
 * Common error shape for feature hooks and screens.
 * status identifies an HTTP failure (or the local CSRF guard's 403); ordinary
 * local validation/network failures have no status. messageKey selects an
 * English/Arabic dictionary entry. cause is diagnostic, not display text.
 */
export class ApiError extends Error {
  constructor(
    message,
    { status, code = 'REQUEST_FAILED', cause, retryAfterMs = null } = {},
  ) {
    super(message, { cause });
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.messageKey = `apiErrors.${code}`;
    this.retryAfterMs = retryAfterMs;
    // Recoverable failure, never permission to replay a write automatically.
    this.retryable =
      code === 'NETWORK_ERROR' || status === 429 || status >= 500;
    // Signal session recovery to the auth owner without clearing a newer login
    // when an older request fails. Incorrect login credentials are separate.
    this.authenticationRequired =
      status === 401 && code !== 'INVALID_CREDENTIALS';
  }
}

/** Build a safe error from a code that belongs to the local message allowlist. */
const failure = (code, options) =>
  new ApiError(messages[code], { ...options, code });

// Current implemented endpoints only; future DTOs require feature-owner review.
// Each entry is [request schema, response schema, requires CSRF on writes].
// null means no request-body schema; a missing third item means no CSRF flag.
// These rules describe client validation, not server access-control enforcement.
const contracts = {
  'POST /auth/register': [registerSchema, acknowledgementSchema],
  'POST /auth/verify-email': [tokenSchema, acknowledgementSchema],
  'POST /auth/resend-verification': [emailSchema, acknowledgementSchema],
  'POST /auth/login': [loginSchema, authResponseSchema],
  'GET /auth/me': [null, authResponseSchema],
  'POST /auth/logout': [emptyRequestSchema, acknowledgementSchema, true],
  'POST /auth/forgot-password': [emailSchema, acknowledgementSchema],
  'POST /auth/reset-password': [resetPasswordSchema, acknowledgementSchema],
  'GET /users/me': [null, profileResponseSchema],
  'PATCH /users/me': [profileSchema, profileResponseSchema, true],
  'POST /users/me/password': [
    changePasswordSchema,
    acknowledgementSchema,
    true,
  ],
  'DELETE /users/me': [deleteAccountSchema, acknowledgementSchema, true],
  'POST /sessions': [startSessionSchema, sessionAssignmentSchema, true],
  'POST /sessions/start': [startSessionSchema, sessionAssignmentSchema, true],
  'GET /sessions': [null, sessionHistorySchema],
  'GET /sessions/:id': [null, sessionDetailSchema],
  'POST /sessions/:id/submit': [submissionSchema, sessionResultSchema, true],
  'POST /sessions/:id/abandon': [
    emptyRequestSchema,
    sessionAbandonmentSchema,
    true,
  ],
};

/**
 * Look up a route's contract after replacing a concrete session UUID with :id.
 * Returns undefined for reads whose feature DTO has not been agreed yet.
 * The static /sessions/start alias must not be mistaken for a UUID.
 */
function contractFor(path, method) {
  const session = path.match(/^\/sessions\/([^/]+)(\/(?:submit|abandon))?$/);
  if (session && session[1] !== 'start') {
    if (!idSchema.safeParse(session[1]).success) {
      throw failure('INVALID_REQUEST');
    }
    path = `/sessions/:id${session[2] || ''}`;
  }
  return contracts[`${method} ${path}`];
}

/** Convert Retry-After seconds or an HTTP date to milliseconds; absent/invalid is null. */
function retryDelay(value) {
  if (!value) {
    return null;
  }
  if (/^\d+$/.test(value)) {
    return Number(value) * 1000;
  }
  const instant = Date.parse(value);
  return Number.isFinite(instant) ? Math.max(0, instant - Date.now()) : null;
}

/**
 * Send one request and return its parsed response, or throw ApiError/AbortError.
 *
 * @param {string} path Relative API path, for example '/users/me'.
 * @param {object} options Fetch options plus the boundary options below.
 * @param {string} [options.csrfToken] Real token returned by login or /auth/me.
 * @param {object} [options.requestSchema] Reviewed Zod schema overriding the route default.
 * @param {object} [options.responseSchema] Reviewed Zod schema overriding the route default.
 * @param {boolean} [options.authenticated] Require CSRF for a new authenticated write.
 * @param {boolean} [options.available] false marks a deliberately unavailable feature.
 * @param {Function} [options.fetchImpl] Fetch implementation; injected by tests.
 *
 * body may be a legacy JSON string or a schema-backed plain object. Pass signal
 * to cancel a request. No token storage, auth refresh, fixture fallback or
 * automatic retry happens here, especially after an uncertain write outcome.
 */
export async function request(
  path,
  {
    csrfToken,
    headers,
    requestSchema,
    responseSchema,
    authenticated = false,
    available = true,
    fetchImpl = globalThis.fetch,
    ...options
  } = {},
) {
  if (!available) {
    throw failure('FEATURE_UNAVAILABLE');
  }
  // Do not send cookies/CSRF to caller-supplied external URLs. Query strings
  // also remain unsupported until the relevant filter contract is agreed.
  if (typeof path !== 'string' || !/^\/(?!\/)[A-Za-z0-9/_-]*$/.test(path)) {
    throw failure('INVALID_REQUEST');
  }
  const method = (options.method || 'GET').toUpperCase();
  const contract = contractFor(path, method);
  requestSchema ??= contract?.[0];
  responseSchema ??= contract?.[1];
  const needsCsrf =
    !['GET', 'HEAD', 'OPTIONS'].includes(method) &&
    (authenticated || contract?.[2]);

  // Fail locally when possible; the server independently checks the real token.
  if (needsCsrf && !/^[a-f0-9]{64}$/.test(csrfToken ?? '')) {
    throw failure('CSRF_FAILED', { status: 403 });
  }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && !requestSchema) {
    throw failure('INVALID_REQUEST');
  }

  // Serialize parsed data, not the original UI object. Zod either strips extra
  // fields or rejects them according to that request's existing shared schema.
  let body = options.body;
  if (requestSchema) {
    let input;
    try {
      input = typeof body === 'string' ? JSON.parse(body) : (body ?? {});
    } catch {
      throw failure('INVALID_REQUEST');
    }
    const parsed = requestSchema.safeParse(input);
    if (!parsed.success) {
      throw failure('INVALID_REQUEST');
    }
    body = JSON.stringify(parsed.data);
  } else if (body !== undefined && typeof body !== 'string') {
    throw failure('INVALID_REQUEST');
  }

  // Authentication uses the httpOnly cookie. Only the explicit CSRF argument
  // controls that header; arbitrary caller headers cannot replace it.
  const outgoingHeaders = new Headers(headers);
  outgoingHeaders.delete('Authorization');
  outgoingHeaders.delete('X-CSRF-Token');
  if (body !== undefined) {
    outgoingHeaders.set('Content-Type', 'application/json');
  }
  outgoingHeaders.set('Accept', 'application/json');
  if (needsCsrf) {
    outgoingHeaders.set('X-CSRF-Token', csrfToken);
  }

  let response;
  try {
    response = await fetchImpl(`${API_BASE_URL}${path}`, {
      ...options,
      method,
      body,
      credentials: 'include',
      headers: outgoingHeaders,
    });
  } catch (cause) {
    // Query cancellation is normal lifecycle behavior, not a connectivity error.
    if (options.signal?.aborted || cause?.name === 'AbortError') {
      throw cause;
    }
    throw failure('NETWORK_ERROR', { cause });
  }

  // A failed response may be HTML or empty. Preserve its HTTP failure category;
  // malformed JSON on a successful response is instead a contract violation.
  let data = null;
  if (response.status !== 204) {
    try {
      data = await response.json();
    } catch (cause) {
      if (options.signal?.aborted || cause?.name === 'AbortError') {
        throw cause;
      }
      if (response.ok) {
        throw failure('CONTRACT_ERROR', { status: response.status });
      }
    }
  }
  if (!response.ok) {
    const parsed = apiErrorResponseSchema.safeParse(data);
    const received = parsed.success ? parsed.data.error.code : null;
    // Unknown server codes use status-based messages, never server text.
    const fallback =
      {
        400: 'INVALID_REQUEST',
        401: 'UNAUTHENTICATED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        409: 'CONFLICT',
        422: 'INVALID_SUBMISSION',
        429: 'RATE_LIMITED',
      }[response.status] ||
      (response.status >= 500 ? 'SERVICE_UNAVAILABLE' : 'REQUEST_FAILED');
    const code = Object.hasOwn(messages, received) ? received : fallback;
    throw failure(code, {
      status: response.status,
      retryAfterMs: retryDelay(response.headers.get('Retry-After')),
    });
  }
  // Parsed DTOs are the only values allowed across reviewed response boundaries.
  // Legacy feature reads without a schema still return their existing JSON.
  if (responseSchema) {
    const parsed = responseSchema.safeParse(data);
    if (!parsed.success) {
      throw failure('CONTRACT_ERROR', { status: response.status });
    }
    return parsed.data;
  }
  return data;
}
