// Test-only forum data adapter. It is never loaded by the production application.
import { ApiError } from '../../src/api/client.js';

export function createForumFixture({ user, empty = false, readOnly = false, delay = 180 } = {}) {
  const canParticipate = user?.role === 'student' && !readOnly;
  const threads = empty
    ? []
    : [{
        id: 't1',
        ownerId: user?.id,
        title: 'Tips for overcoming the 50 WPM plateau on pinky reaches?',
        category: 'technique',
        author: user?.name ?? 'Omar S.',
        body: 'How do you practise pinky reaches without losing accuracy?',
        status: 'visible',
        acceptedReplyId: 'r1',
        replies: [
          { id: 'r1', author: 'Nour K.', body: 'Slow down and focus on accurate reaches.', status: 'visible' },
          { id: 'r2', author: 'Karim D.', body: 'Try short practice sessions.', status: 'visible' },
          { id: 'r3', author: 'Private author', body: 'HIDDEN_PRIVATE_TEXT', status: 'hidden' },
        ],
      }];
  const failures = new Map();

  async function run(method, action) {
    await new Promise(resolve => setTimeout(resolve, delay));
    const failure = failures.get(method);
    failures.delete(method);
    if (failure) {
      throw new ApiError('Forum fixture request failed.', { code: failure.code });
    }
    return structuredClone(action());
  }

  return {
    source: 'test-fixture',
    failNext(method, { code = 'NETWORK_ERROR' } = {}) {
      failures.set(method, { code });
    },
    list() {
      return run('list', () => ({
        items: threads.map(thread => ({
          id: thread.id,
          title: thread.title,
          category: thread.category,
          author: thread.author,
          status: thread.status,
          replyCount: thread.replies.length,
          acceptedReplyId: thread.acceptedReplyId,
          permissions: { canReply: canParticipate, canReport: canParticipate },
        })),
        page: 1,
        totalPages: 1,
        totalItems: threads.length,
        permissions: { canCreateThread: canParticipate },
      }));
    },
    detail({ threadId }) {
      return run('detail', () => {
        const thread = threads.find(item => item.id === threadId);
        if (!thread) {
          throw new ApiError('Forum fixture request failed.', { code: 'NOT_FOUND' });
        }
        return { ...thread, replies: thread.replies.filter(reply => reply.status === 'visible') };
      });
    },
  };
}
