// Dashboard API boundary: fetch real account data without rendering or caching it.
import { request } from './client.js';

// TanStack supplies signal so logout/navigation cancellation reaches Fetch.
export const fetchDashboard = ({ signal } = {}) =>
  request('/dashboard', { signal });
