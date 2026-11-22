// Forum transport boundary. No real routes are guessed while the DTO/access gate is open.
import { ApiError } from './client.js';

/**
 * Create a view-scoped adapter for one account. Development uses an explicitly
 * labelled in-memory fixture; production fails closed without making requests.
 * Replace this boundary with schema-validated HTTP calls after team agreement.
 */
export function createForumApi(user) {
  void user;

  async function invoke() {
    throw new ApiError('Forum API is not connected.', {
      code: 'FEATURE_UNAVAILABLE',
    });
  }

  return {
    source: 'unavailable',
    list: options => invoke('list', options),
    detail: options => invoke('detail', options),
    create: options => invoke('create', options),
    reply: options => invoke('reply', options),
    accept: options => invoke('accept', options),
    report: options => invoke('report', options),
  };
}
