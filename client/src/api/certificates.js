import { request } from './client.js';

export const verifyCertificate = code =>
  request(`/certificates/verify/${encodeURIComponent(code)}`);
