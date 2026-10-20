const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function request(path, { csrfToken, headers, ...options } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        ...headers,
      },
    });
  } catch (cause) {
    throw new ApiError('The service could not be reached.', { code: 'NETWORK_ERROR', cause });
  }

  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(body?.error?.message || 'The request could not be completed.', {
      status: response.status,
      code: body?.error?.code || 'REQUEST_FAILED',
      details: body?.error?.details,
    });
  }
  return body;
}
