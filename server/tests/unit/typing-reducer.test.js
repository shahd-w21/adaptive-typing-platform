/**
 * FE-15 typing-state tests for corrections and rejected excess input.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialTypingState,
  typingReducer,
} from '../../../client/src/features/typing/engine/typingReducer.js';

test('backspace edits the buffer without erasing raw attempt counters', () => {
  let state = createInitialTypingState();
  state = typingReducer(state, {
    type: 'insert',
    char: 'a',
    assignedText: 'ab',
  });
  state = typingReducer(state, {
    type: 'insert',
    char: 'x',
    assignedText: 'ab',
  });
  state = typingReducer(state, { type: 'backspace' });
  state = typingReducer(state, {
    type: 'insert',
    char: 'b',
    assignedText: 'ab',
  });

  assert.deepEqual(state, {
    buffer: 'ab',
    totalInserts: 3,
    correctInserts: 2,
  });
});

test('buffer stops at assignment length and reset clears attempt state', () => {
  const initialState = createInitialTypingState();
  const oneCharacter = typingReducer(initialState, {
    type: 'insert',
    char: 'a',
    assignedText: 'a',
  });

  assert.equal(
    typingReducer(oneCharacter, {
      type: 'insert',
      char: 'b',
      assignedText: 'a',
    }),
    oneCharacter,
  );
  assert.deepEqual(
    typingReducer(oneCharacter, { type: 'reset' }),
    initialState,
  );
});
