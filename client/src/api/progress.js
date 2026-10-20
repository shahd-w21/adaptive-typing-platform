import { request } from './client.js';

export const fetchProgress = () => request('/progress');
