// Disposable forum DTO fixture; permissions demonstrate UI states, never server policy.
import { ApiError } from '../api/client.js';

const categories = ['technique', 'adaptive', 'hardware', 'general'];

/** Reject demo input with a stable code; exception text is never interface copy. */
function reject(code) {
  throw new ApiError('Forum fixture request failed.', { code });
}

/** Validate required text without rewriting or translating authored characters. */
function validText(value, maximum) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maximum;
}

/**
 * Build isolated draft DTOs for one account/view. Scenario options support
 * browser checks; no storage, database or network is used. Changes disappear
 * when the forum view unmounts or the page reloads.
 */
export function createForumFixture({ user, empty = false, readOnly = false, delay = 180 } = {}) {
  const threads = empty ? [] : [
    {
      id: 't1',
      ownerId: user?.id,
      title: 'Tips for overcoming the 50 WPM plateau on pinky reaches?',
      category: 'technique',
      author: user?.name ?? 'Omar S.',
      body: 'How do you practise pinky reaches without losing accuracy?',
      status: 'visible',
      acceptedReplyId: 'r1',
      replies: [
        {
          id: 'r1',
          author: 'Nour K.',
          body: 'Slow down and focus on comfortable, accurate reaches.',
          status: 'visible',
        },
        {
          id: 'r2',
          author: 'Karim D.',
          body: 'Try short practice sessions with regular breaks.',
          status: 'visible',
        },
        {
          id: 'r3',
          author: 'Private author',
          body: 'HIDDEN_PRIVATE_TEXT',
          status: 'hidden',
        },
        {
          id: 'r4',
          author: 'Deleted author',
          body: 'DELETED_PRIVATE_TEXT',
          status: 'unavailable',
        },
      ],
    },
    {
      id: 't2',
      ownerId: 'another-student',
      title: 'How does the Raw Accuracy gate calculate backspaced errors?',
      category: 'adaptive',
      author: 'Nour K.',
      body: 'Do corrected errors still count in raw accuracy?',
      status: 'visible',
      acceptedReplyId: null,
      replies: [],
    },
    {
      id: 't3',
      ownerId: 'another-student',
      title: 'Mechanical vs laptop keyboard for learning touch typing',
      category: 'hardware',
      author: 'Karim D.',
      body: 'What helps you stay comfortable while practising?',
      status: 'visible',
      acceptedReplyId: null,
      replies: [],
    },
    {
      id: 't4',
      ownerId: 'another-student',
      title: 'HIDDEN_PRIVATE_TITLE',
      author: 'Private author',
      body: 'HIDDEN_PRIVATE_THREAD',
      status: 'hidden',
      acceptedReplyId: null,
      replies: [],
    },
  ];
  const receipts = new Map();
  const reports = new Set();
  const failures = new Map();
  let sequence = 10;
  const canParticipate = user?.role === 'student' && !readOnly;

  /** Omit hidden/deleted text and identity entirely from structural placeholders. */
  function postDto(post) {
    if (post.status !== 'visible') {
      return { id: post.id, status: post.status };
    }
    return {
      id: post.id,
      status: post.status,
      author: post.author,
      body: post.body,
      permissions: { canReport: canParticipate && !reports.has(post.id) },
    };
  }

  /** Project the current state and explicit viewer permissions into draft DTOs. */
  function threadDto(thread) {
    if (thread.status !== 'visible') {
      return { id: thread.id, status: thread.status };
    }
    return {
      ...postDto(thread),
      title: thread.title,
      category: thread.category,
      replyCount: thread.replies.length,
      acceptedReplyId: thread.acceptedReplyId,
      permissions: {
        canReply: canParticipate,
        canAcceptAnswer: canParticipate && thread.ownerId === user.id,
        canReport: canParticipate && !reports.has(thread.id),
      },
      replies: thread.replies.map(postDto),
    };
  }

  /** Reject stale/unavailable targets rather than exposing their authored content. */
  function visibleThread(id) {
    const thread = threads.find(item => item.id === id);
    if (!thread || thread.status !== 'visible') {
      reject('NOT_FOUND');
    }
    return thread;
  }

  /**
   * Simulate latency/cancellation and one-shot failures. requestId deduplicates
   * uncertain writes and rejects changed payloads. Real integration needs a
   * server-owned atomic implementation; this is only a retry demonstration.
   */
  async function run(method, options, action) {
    await new Promise(resolve => setTimeout(resolve, delay));
    options.signal?.throwIfAborted();
    const failure = failures.get(method);
    failures.delete(method);
    if (failure && !failure.afterCommit) {
      reject(failure.code);
    }
    let result;
    if (['create', 'reply', 'report', 'accept'].includes(method)) {
      if (!canParticipate) {
        reject('FORBIDDEN');
      }
      if (!options.requestId) {
        reject('INVALID_REQUEST');
      }
      const signature = JSON.stringify({ method, ...options });
      const previous = receipts.get(options.requestId);
      if (previous && previous.signature !== signature) {
        reject('CONFLICT');
      }
      result = previous ? previous.result : action();
      receipts.set(options.requestId, { signature, result });
    } else {
      result = action();
    }
    if (failure) {
      reject(failure.code);
    }
    return structuredClone(result);
  }

  return {
    source: 'development-fixture',
    /** Schedule one failure; afterCommit simulates a lost write response. */
    failNext(method, { code = 'NETWORK_ERROR', afterCommit = false } = {}) {
      failures.set(method, { code, afterCommit });
    },
    /**
     * Search visible titles/bodies and combine category/acceptance filters before
     * pagination. Never inspect hidden text for matches or reveal it in counts.
     * Unfiltered browsing retains the existing structural placeholders.
     */
    list(options = {}) {
      return run('list', options, () => {
        const pageSize = 3;
        const requestedPage = options.page ?? 1;
        const search = options.search ?? '';
        const category = options.category ?? 'all';
        const answerStatus = options.answerStatus ?? 'all';
        if (
          typeof search !== 'string' ||
          !['all', ...categories].includes(category) ||
          !['all', 'accepted', 'unaccepted'].includes(answerStatus) ||
          !Number.isInteger(requestedPage) ||
          requestedPage < 1
        ) {
          reject('INVALID_REQUEST');
        }

        const query = search.trim().toLowerCase();
        const hasFilters = Boolean(query || category !== 'all' || answerStatus !== 'all');
        const matchingThreads = threads.filter(thread => {
          if (!hasFilters) {
            return true;
          }
          if (thread.status !== 'visible') {
            return false;
          }
          if (category !== 'all' && thread.category !== category) {
            return false;
          }
          if (answerStatus === 'accepted' && !thread.acceptedReplyId) {
            return false;
          }
          if (answerStatus === 'unaccepted' && thread.acceptedReplyId) {
            return false;
          }
          return thread.title.toLowerCase().includes(query) || thread.body.toLowerCase().includes(query);
        });
        const totalPages = Math.max(1, Math.ceil(matchingThreads.length / pageSize));
        // Writes can remove the last match on a page. Return the last valid page.
        const page = Math.min(requestedPage, totalPages);
        return {
          items: matchingThreads.slice((page - 1) * pageSize, page * pageSize).map(thread => {
            const summary = threadDto(thread);
            delete summary.replies;
            delete summary.body;
            return summary;
          }),
          page,
          totalPages,
          totalItems: matchingThreads.length,
          permissions: { canCreateThread: canParticipate },
        };
      });
    },
    /** Return metadata/reply page; acceptedReplyId always describes the whole thread. */
    detail(options) {
      return run('detail', options, () => {
        const thread = threads.find(item => item.id === options.threadId);
        if (!thread) {
          reject('NOT_FOUND');
        }
        const dto = threadDto(thread);
        const page = options.page ?? 1;
        return {
          ...dto,
          replies: dto.replies?.slice((page - 1) * 3, page * 3) ?? [],
          page,
          totalPages: Math.max(1, Math.ceil(thread.replies.length / 3)),
        };
      });
    },
    /** Create a thread with authored title/body and an allowlisted category. */
    create(options) {
      return run('create', options, () => {
        if (!validText(options.title, 180) || !validText(options.body, 5000) || !categories.includes(options.category)) {
          reject('INVALID_REQUEST');
        }
        const thread = {
          id: `t${sequence++}`,
          ownerId: user.id,
          author: user.name,
          title: options.title,
          body: options.body,
          category: options.category,
          status: 'visible',
          acceptedReplyId: null,
          replies: [],
        };
        threads.unshift(thread);
        return { threadId: thread.id };
      });
    },
    /** Add one reply and return its page so the caller can reveal it. */
    reply(options) {
      return run('reply', options, () => {
        const thread = visibleThread(options.threadId);
        if (!validText(options.body, 5000)) {
          reject('INVALID_REQUEST');
        }
        thread.replies.push({
          id: `r${sequence++}`,
          author: user.name,
          body: options.body,
          status: 'visible',
        });
        return { threadId: thread.id, page: Math.ceil(thread.replies.length / 3) };
      });
    },
    /** Set the single accepted ID for this fixture's owner and a visible reply. */
    accept(options) {
      return run('accept', options, () => {
        const thread = visibleThread(options.threadId);
        if (thread.ownerId !== user.id) {
          reject('FORBIDDEN');
        }
        if (!thread.replies.some(reply => reply.id === options.replyId && reply.status === 'visible')) {
          reject('NOT_FOUND');
        }
        thread.acceptedReplyId = options.replyId;
        return { threadId: thread.id };
      });
    },
    /** Acknowledge a report without changing visibility or applying moderation. */
    report(options) {
      return run('report', options, () => {
        const thread = visibleThread(options.threadId);
        const target = options.postId === thread.id ? thread : thread.replies.find(reply => reply.id === options.postId);
        if (!target || target.status !== 'visible') {
          reject('NOT_FOUND');
        }
        if (!validText(options.reason, 1000)) {
          reject('INVALID_REQUEST');
        }
        reports.add(target.id);
        return { threadId: thread.id };
      });
    },
  };
}
