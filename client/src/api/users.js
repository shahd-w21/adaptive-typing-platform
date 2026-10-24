import { request } from './client.js';

export const fetchMyProfile = () => request('/users/me');

export const updateMyProfile = (profile, csrfToken) => request('/users/me', {
  method: 'PATCH',
  csrfToken,
  body: JSON.stringify(profile),
});

export const changeMyPassword = (values, csrfToken) => request('/users/me/password', {
  method: 'POST',
  csrfToken,
  body: JSON.stringify(values),
});

export const deleteMyAccount = (password, csrfToken) => request('/users/me', {
  method: 'DELETE',
  csrfToken,
  body: JSON.stringify({ password }),
});
