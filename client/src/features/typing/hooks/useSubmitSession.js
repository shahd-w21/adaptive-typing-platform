/** Submission view of the controller; never creates a second session owner. */
import { useSyncExternalStore } from 'react';

/** Expose frozen submission/retry and official state to the existing typing page. */
export function useSubmitSession(controller) {
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
  );
  return {
    ...state,
    submit: controller.submit,
    retry: controller.retry,
    isSubmitting: state.status === 'submitting',
    resultWasRecovered: state.resultRecovered,
    inputLocked: !['ready', 'typing', 'paused'].includes(state.status),
  };
}
