/**
 * Pure typing-buffer transitions; attempt counters track every inserted key,
 * including errors later removed with Backspace.
 */
export function createInitialTypingState() {
  return {
    buffer: '',
    totalInserts: 0,
    correctInserts: 0,
  };
}

/** Apply one accepted character, end-of-buffer correction, or full reset. */
export function typingReducer(state, action) {
  switch (action.type) {
    case 'insert': {
      if (state.buffer.length >= action.assignedText.length) {
        return state;
      }

      const expectedChar = action.assignedText[state.buffer.length];
      return {
        buffer: state.buffer + action.char,
        totalInserts: state.totalInserts + 1,
        correctInserts:
          state.correctInserts + Number(action.char === expectedChar),
      };
    }
    case 'backspace':
      return state.buffer.length === 0
        ? state
        : { ...state, buffer: state.buffer.slice(0, -1) };
    case 'reset':
      return createInitialTypingState();
    default:
      throw new Error(`Unsupported typing action: ${action.type}`);
  }
}
