import { request } from './client.js';

export const fetchCurrentSession = () => request('/auth/me');

export const register = credentials => request('/auth/register', {
  method: 'POST',
  body: JSON.stringify(credentials),
});

export const verifyEmail = token => request('/auth/verify-email', {
  method: 'POST',
  body: JSON.stringify({ token }),
});

export const resendVerification = email => request('/auth/resend-verification', {
  method: 'POST',
  body: JSON.stringify({ email }),
});

export const login = credentials => request('/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials),
});

export const logout = csrfToken => request('/auth/logout', {
  method: 'POST',
  csrfToken,
});

export const forgotPassword = email => request('/auth/forgot-password', {
  method: 'POST',
  body: JSON.stringify({ email }),
});

export const resetPassword = values => request('/auth/reset-password', {
  method: 'POST',
  body: JSON.stringify(values),
});
