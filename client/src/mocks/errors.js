// HTTP status is transport metadata; `body` is the JSON response payload.
export const errorResponses = {
  unauthenticated: { status: 401, body: { error: { code: 'UNAUTHENTICATED' } } },
  forbidden: { status: 403, body: { error: { code: 'FORBIDDEN' } } },
  notFound: { status: 404, body: { error: { code: 'NOT_FOUND' } } },
  sessionConflict: {
    status: 409,
    body: { error: { code: 'SESSION_CONFLICT', message: 'Session already has a different submission' } },
  },
  sessionUnavailable: {
    status: 409,
    body: { error: { code: 'SESSION_UNAVAILABLE', message: 'Session is abandoned or expired' } },
  },
  rateLimited: {
    status: 429,
    body: { error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' } },
  },
  contentNotReady: {
    status: 503,
    body: { error: { code: 'CONTENT_NOT_READY', message: 'No unlocked curriculum is available' } },
  },
};
