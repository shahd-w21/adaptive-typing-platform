// Dashboard API boundary: fetch real account data without rendering or caching it.
import { request } from './client.js';
import { dashboardResponseSchema } from '@typeflow/shared';

// TanStack supplies signal so logout/navigation cancellation reaches Fetch.
export const fetchDashboard = ({ signal } = {}) =>
  request('/dashboard', { signal, responseSchema: dashboardResponseSchema });
