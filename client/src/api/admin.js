import { request } from './client.js';

export const checkAdminAccess = () => request('/admin/ping');
