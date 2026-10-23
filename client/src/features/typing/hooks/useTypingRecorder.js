/**
 * Owns recorder events and editable text state for one mounted typing attempt.
 */
import { useCallback, useMemo, useReducer, useRef } from 'react';
import { KeystrokeRecorder } from '../engine/keystrokeRecorder.js';
import {
  createInitialTypingState,
  typingReducer,
} from '../engine/typingReducer.js';

/** Keep the recorder and reducer state aligned for input, correction, and retry. */
export function useTypingRecorder() {
  const [state, dispatch] = useReducer(
    typingReducer,
    undefined,
    createInitialTypingState,
  );
  const recorderRef = useRef(null);

  if (recorderRef.current === null) {
    recorderRef.current = new KeystrokeRecorder();
  }

  const recordInsert = useCallback((char, assignedText) => {
      recorderRef.current.recordInsert(char);
      dispatch({ type: 'insert', char, assignedText });
  }, []);
  const recordBackspace = useCallback(() => {
      recorderRef.current.recordBackspace();
      dispatch({ type: 'backspace' });
  }, []);
  const recordPause = useCallback(() => {
      return recorderRef.current.recordPause();
  }, []);
  const recordResume = useCallback(() => {
      return recorderRef.current.recordResume();
  }, []);
  const reset = useCallback(() => {
      recorderRef.current.reset();
      dispatch({ type: 'reset' });
  }, []);
  const getElapsedMs = useCallback(() => {
      return recorderRef.current.getElapsedMs();
  }, []);
  const getSubmissionPayload = useCallback((sessionId) => {
      return recorderRef.current.getSubmissionPayload(sessionId);
  }, []);

  return useMemo(
    () => ({
      ...state,
      recordInsert,
      recordBackspace,
      recordPause,
      recordResume,
      reset,
      getElapsedMs,
      getSubmissionPayload,
    }),
    [
      state,
      recordInsert,
      recordBackspace,
      recordPause,
      recordResume,
      reset,
      getElapsedMs,
      getSubmissionPayload,
    ],
  );
}
