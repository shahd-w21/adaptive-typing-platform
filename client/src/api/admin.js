// Current admin access probe only; this is not the future admin-management API.
import { request } from './client.js';

// The server checks the cookie and Admin role; a frontend role check is not proof.
export const checkAdminAccess = ({ signal } = {}) =>
  request('/admin/ping', { signal });
