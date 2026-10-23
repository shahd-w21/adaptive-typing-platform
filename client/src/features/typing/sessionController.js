/**
 * Account-owned session state machine shared by the router and typing hooks.
 * Dependencies are injected so races/retries can be checked without a browser.
 * Raw events and assignment text live only in memory, never browser storage.
 */
import { idSchema, submissionSchema } from '@typeflow/shared';

export const SESSION_POINTER_KEY = 'typeflow.activeSession';
const initialState = () => ({
  assignment: null,
  result: null,
  resultRecovered: false,
  status: 'idle',
  error: null,
  canRetry: false,
  lostProgress: false,
});

/** Read an untrusted tab-local pointer; another owner's pointer is discarded. */
function readPointer(storage, ownerId) {
  try {
    const pointer = JSON.parse(storage?.getItem(SESSION_POINTER_KEY) ?? 'null');
    if (
      pointer?.ownerId === ownerId &&
      idSchema.safeParse(pointer.sessionId).success
    ) {
      return pointer.sessionId;
    }
    storage?.removeItem(SESSION_POINTER_KEY);
  } catch {
    // Unavailable/malformed storage must not prevent in-memory practice.
  }
  return null;
}

/**
 * Build one controller per authenticated owner/CSRF session. Actions return
 * success booleans; safe errors remain in the snapshot for translated UI.
 */
export function createSessionController({
  ownerId,
  csrfToken,
  api,
  storage,
  onResult,
  now = Date.now,
}) {
  // Recognize a reload pointer before the router decides whether /typing is
  // empty. Network verification still happens only in the hook's effect.
  const storedSessionId = ownerId ? readPointer(storage, ownerId) : null;
  let state = {
    ...initialState(),
    assignment: storedSessionId ? { sessionId: storedSessionId } : null,
    lostProgress: Boolean(storedSessionId),
    status: storedSessionId ? 'recovering' : 'idle',
  };
  let epoch = 0;
  let active = true;
  let busy = false;
  let frozenPayload = null;
  let readAbort = null;
  const listeners = new Set();
  const seenRewards = new Set();

  /** Publish a stable snapshot; useSyncExternalStore reads it without copying. */
  function publish(patch) {
    state = { ...state, ...patch };
    for (const listener of listeners) {
      listener();
    }
  }

  /** Store identifiers only. Storage failure degrades reload recovery, not scoring. */
  function remember(sessionId) {
    try {
      storage?.setItem(
        SESSION_POINTER_KEY,
        JSON.stringify({ ownerId, sessionId }),
      );
    } catch {
      // NOTE FOR DEVS: privacy modes may deny storage; reload recovery then
      // requires the owned history screen (FE-11), not persisted raw events.
    }
  }

  /** Remove only this owner's pointer; stale work must not clear a newer owner. */
  function forget() {
    try {
      const pointer = JSON.parse(
        storage?.getItem(SESSION_POINTER_KEY) ?? 'null',
      );
      if (pointer?.ownerId === ownerId) {
        storage?.removeItem(SESSION_POINTER_KEY);
      }
    } catch {
      // Storage is optional; in-memory state is still cleared.
    }
  }

  /** Commit only official data. Callback failure cannot turn a saved result into failure. */
  function acceptResult(result, recovered) {
    const newRewards = recovered
      ? []
      : result.rewards.filter((reward) => !seenRewards.has(reward.id));
    for (const reward of result.rewards) {
      seenRewards.add(reward.id);
    }
    frozenPayload = null;
    publish({
      result,
      resultRecovered: recovered,
      status: 'completed',
      error: null,
      canRetry: false,
      lostProgress: false,
    });
    // No notification system is invented here. A future FE-16 consumer must
    // use newRewards, never replay result.rewards on recovered results.
    const resultEpoch = epoch;
    Promise.resolve()
      .then(() => {
        if (active && resultEpoch === epoch) {
          return onResult?.(result, { recovered, newRewards });
        }
      })
      .catch(() => {});
  }

  /** Query owned status; incomplete recovered attempts cannot reconstruct their recorder. */
  async function load(sessionId, ticket) {
    readAbort = new AbortController();
    const detail = await api.fetchSession(sessionId, {
      signal: readAbort.signal,
    });
    if (!active || ticket !== epoch) {
      return false;
    }
    if (detail.status === 'completed') {
      acceptResult(detail, true);
    } else {
      const expired = Date.parse(detail.expiresAt) <= now();
      publish({
        assignment: detail,
        status:
          detail.status === 'abandoned'
            ? 'abandoned'
            : expired
              ? 'expired'
              : 'recovery-required',
        lostProgress: true,
        error: null,
        canRetry: false,
      });
    }
    return true;
  }

  const controller = {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    /** Effect setup/cleanup invalidates late responses, including account switches. */
    activate() {
      active = true;
    },
    deactivate() {
      active = false;
      epoch += 1;
      readAbort?.abort();
      busy = false;
      if (state.status === 'recovering') {
        publish({ status: 'idle' });
      }
    },
    /** Recover at most one pointer, or explicitly recheck after a read failure. */
    async recover() {
      if (!active || busy) {
        return false;
      }
      const sessionId =
        state.assignment?.sessionId ?? readPointer(storage, ownerId);
      if (!sessionId) {
        return false;
      }
      const ticket = ++epoch;
      busy = true;
      publish({ status: 'recovering', error: null });
      try {
        return await load(sessionId, ticket);
      } catch (error) {
        if (active && ticket === epoch) {
          if (error.status === 404) {
            forget();
            publish({ assignment: null, lostProgress: false });
          }
          publish({ status: 'error', error });
        }
        return false;
      } finally {
        if (ticket === epoch) {
          busy = false;
        }
      }
    },
    /** Start once per user action. Reuse any current attempt instead of replacing it. */
    async startPractice() {
      if (!active || busy) {
        return false;
      }
      if (state.assignment || state.result) {
        return true;
      }
      if (readPointer(storage, ownerId)) {
        return controller.recover();
      }
      const ticket = ++epoch;
      busy = true;
      publish({ status: 'starting', error: null });
      try {
        const assignment = await api.startPracticeSession(csrfToken);
        if (!active || ticket !== epoch) {
          return false;
        }
        remember(assignment.sessionId);
        publish({ assignment, status: 'ready', lostProgress: false });
        return true;
      } catch (error) {
        if (active && ticket === epoch) {
          publish({ status: 'start-error', error });
        }
        // NOTE FOR DEVS — backend start idempotency is not available. A lost
        // start response may leave an orphan assignment; never auto-retry it.
        return false;
      } finally {
        if (ticket === epoch) {
          busy = false;
        }
      }
    },
    /** Freeze the first wire payload. Rendering/pause/retry cannot change it afterward. */
    async submit(payload) {
      if (
        !active ||
        busy ||
        state.result ||
        state.lostProgress ||
        !state.assignment
      ) {
        return false;
      }
      if (!frozenPayload) {
        frozenPayload = submissionSchema.parse(structuredClone(payload));
      }
      return send(false);
    },
    /** Explicit retry reconciles an uncertain write before resending the identical body. */
    async retry() {
      if (!active || busy || !frozenPayload || !state.canRetry) {
        return false;
      }
      return send(true);
    },
    /** Terminal recorder phases are reported by the view; no clock is recreated here. */
    setPhase(status) {
      if (
        ['ready', 'typing', 'paused'].includes(state.status) &&
        ['typing', 'paused'].includes(status)
      ) {
        publish({ status });
      }
    },
    /** Abandon first; completed results may be dismissed without another write. */
    async abandon() {
      if (!active || busy) {
        return false;
      }
      const ticket = ++epoch;
      busy = true;
      try {
        if (
          state.assignment &&
          !['completed', 'abandoned'].includes(state.status)
        ) {
          try {
            await api.abandonSession(state.assignment.sessionId, csrfToken);
          } catch (error) {
            if (error.status !== 409) {
              throw error;
            }
            // Another request may have committed. Reconcile before discarding it.
            await load(state.assignment.sessionId, ticket);
            if (state.result) {
              return false;
            }
            if (!['expired', 'abandoned'].includes(state.status)) {
              throw error;
            }
          }
        }
        if (!active || ticket !== epoch) {
          return false;
        }
        controller.clear();
        return true;
      } catch (error) {
        if (active && ticket === epoch) {
          publish({ error });
        }
        return false;
      } finally {
        if (ticket === epoch) {
          busy = false;
        }
      }
    },
    /** Request a new assignment only after explicit replacement succeeds. */
    async restart() {
      return (await controller.abandon()) ? controller.startPractice() : false;
    },
    /** Clear on logout/dismissal; invalidate every outstanding operation. */
    clear() {
      epoch += 1;
      readAbort?.abort();
      frozenPayload = null;
      busy = false;
      forget();
      publish(initialState());
    },
  };

  /** Submit once, or reconcile first after an uncertain response. No automatic write retry. */
  async function send(reconcile) {
    const ticket = ++epoch;
    const sessionId = state.assignment.sessionId;
    busy = true;
    publish({ status: 'submitting', error: null, canRetry: false });
    try {
      if (reconcile) {
        const detail = await api.fetchSession(sessionId);
        if (!active || ticket !== epoch) {
          return false;
        }
        if (detail.status === 'completed') {
          acceptResult(detail, true);
          return true;
        }
        if (
          detail.status === 'abandoned' ||
          Date.parse(detail.expiresAt) <= now()
        ) {
          publish({
            status: detail.status === 'abandoned' ? 'abandoned' : 'expired',
            canRetry: false,
          });
          return false;
        }
      }
      const result = await api.submitSession(
        sessionId,
        frozenPayload,
        csrfToken,
      );
      if (!active || ticket !== epoch) {
        return false;
      }
      acceptResult(result, false);
      return true;
    } catch (error) {
      if (active && ticket === epoch) {
        const canRetry = Boolean(
          error.retryable || error.code === 'CONTRACT_ERROR',
        );
        publish({ status: canRetry ? 'retry' : 'rejected', error, canRetry });
      }
      return false;
    } finally {
      if (ticket === epoch) {
        busy = false;
      }
    }
  }

  return controller;
}
