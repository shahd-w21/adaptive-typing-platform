// Read the server's current keyboard/path state; never calculate unlocks here.
import { request } from './client.js';

// Optional AbortSignal lets the query owner cancel an in-flight read.
export const fetchLearningPath = ({ signal } = {}) =>
  request('/path', { signal });
