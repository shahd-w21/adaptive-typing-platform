// Fixed examples and event fixtures for authoritative session replay.
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMetrics, modePolicyFor } from '@typeflow/shared';
import { ReplayValidationError } from '../../src/modules/scoring/logValidator.js';
import { scoreSession } from '../../src/modules/scoring/scoreSession.js';

const insert = (seq, char, t) => ({ seq, type: 'insert', char, t });
const backspace = (seq, t) => ({ seq, type: 'backspace', t });

test('session modes share explicit pause, learning, reward, and focus policies', () => {
  assert.equal(modePolicyFor('placement').pauseAllowed, false);
  assert.equal(modePolicyFor('placement').updatesLearning, false);
  assert.equal(modePolicyFor('placement').earnsRewards, false);
  assert.equal(modePolicyFor('lesson').pauseAllowed, true);
  assert.equal(modePolicyFor('review').updatesLearning, true);
  assert.equal(modePolicyFor('timed').timed, true);
  assert.equal(modePolicyFor('timed').updatesLearning, false);
  assert.equal(modePolicyFor('certified').recordsFocusLoss, true);
  assert.throws(() => modePolicyFor('unknown'), RangeError);
});

test('matches fixed perfect, corrected, and remaining-error metric examples', () => {
  const perfect = calculateMetrics({
    inserts: 100,
    correctInserts: 100,
    bufferLength: 100,
    finalCorrect: 100,
    activeDurationMs: 60000,
  });
  assert.deepEqual(perfect, {
    grossWpm: 20,
    netWpm: 20,
    rawAccuracy: 100,
    finalAccuracy: 100,
    activeDurationMs: 60000,
  });

  const corrected = scoreSession({
    text: 'ab',
    events: [insert(0, 'a', 0), insert(1, 'x', 100), backspace(2, 200), insert(3, 'b', 1000)],
    finishTimeMs: 1000,
  });
  assert.ok(Math.abs(corrected.metrics.rawAccuracy - 2 / 3 * 100) < Number.EPSILON * 100);
  assert.equal(corrected.metrics.finalAccuracy, 100);
  assert.equal(corrected.metrics.grossWpm, 24);

  const remaining = calculateMetrics({
    inserts: 100,
    correctInserts: 95,
    bufferLength: 100,
    finalCorrect: 95,
    activeDurationMs: 60000,
  });
  assert.equal(remaining.grossWpm, 20);
  assert.equal(remaining.netWpm, 15);
  assert.equal(remaining.rawAccuracy, 95);
});

test('empty metric denominators remain unavailable rather than becoming zero', () => {
  const metrics = calculateMetrics({
    inserts: 0,
    correctInserts: 0,
    bufferLength: 0,
    finalCorrect: 0,
    activeDurationMs: 0,
  });
  assert.equal(metrics.grossWpm, null);
  assert.equal(metrics.netWpm, null);
  assert.equal(metrics.rawAccuracy, null);
  assert.equal(metrics.finalAccuracy, null);
});

test('ordinary wrong input counts against the expected key; client correctness claims are rejected', () => {
  const result = scoreSession({
    text: 'ab',
    events: [insert(0, 'x', 0), insert(1, 'b', 1000)],
    finishTimeMs: 1000,
  });
  assert.equal(result.metrics.rawAccuracy, 50);
  assert.deepEqual(result.keyStats.a, { attempts: 1, errors: 1, totalMs: 0, timed: 0 });
  assert.throws(
    () => scoreSession({
      text: 'ab',
      events: [{ ...insert(0, 'a', 0), correct: true }, insert(1, 'b', 1)],
      finishTimeMs: 1,
    }),
    (error) => error.code === 'INVALID_EVENT',
  );
});

test('key and pair latency require consecutive correct adjacent letters within cutoff', () => {
  const result = scoreSession({
    text: 'abcd',
    events: [insert(0, 'a', 0), insert(1, 'b', 200), insert(2, 'x', 400), insert(3, 'd', 600)],
    finishTimeMs: 600,
  });
  assert.equal(result.keyStats.b.timed, 1);
  assert.equal(result.keyStats.b.totalMs, 200);
  assert.deepEqual(result.pairStats.ab, { attempts: 1, errors: 0, totalMs: 200, timed: 1 });
  assert.deepEqual(result.pairStats.bc, { attempts: 1, errors: 1, totalMs: 0, timed: 0 });
  assert.equal(result.pairStats.cd, undefined);

  const pairError = scoreSession({
    text: 'ab',
    events: [insert(0, 'a', 0), insert(1, 'x', 200)],
    finishTimeMs: 200,
  });
  assert.deepEqual(pairError.pairStats.ab, { attempts: 1, errors: 1, totalMs: 0, timed: 0 });
});

test('spaces, punctuation, edits, pauses, mistakes, and over-cutoff gaps break latency evidence', () => {
  const cases = [
    { text: 'a b', events: [insert(0, 'a', 0), insert(1, ' ', 100), insert(2, 'b', 200)] },
    { text: 'a-b', events: [insert(0, 'a', 0), insert(1, '-', 100), insert(2, 'b', 200)] },
    { text: 'ab', events: [insert(0, 'a', 0), { seq: 1, type: 'pause', t: 100 }, { seq: 2, type: 'resume', t: 200 }, insert(3, 'b', 300)] },
    { text: 'abc', events: [insert(0, 'a', 0), insert(1, 'x', 100), insert(2, 'c', 200)] },
    { text: 'ab', events: [insert(0, 'a', 0), insert(1, 'b', 2001)] },
  ];
  for (const fixture of cases) {
    const score = scoreSession({ ...fixture, finishTimeMs: fixture.events.at(-1).t });
    assert.equal(Object.values(score.keyStats).reduce((sum, row) => sum + row.timed, 0), 0);
    assert.equal(Object.values(score.pairStats).reduce((sum, row) => sum + row.timed, 0), 0);
  }
});

test('invalid order, pause policy, and incomplete learning passages are rejected', () => {
  assert.throws(
    () => scoreSession({ text: 'ab', events: [insert(0, 'a', 0), insert(2, 'b', 1)], finishTimeMs: 1 }),
    (error) => error instanceof ReplayValidationError && error.code === 'INVALID_ORDER',
  );
  assert.throws(
    () => scoreSession({ text: 'ab', events: [insert(0, 'a', 0), { seq: 1, type: 'pause', t: 1 }, insert(2, 'b', 2)], finishTimeMs: 2, rules: { mode: 'timed', durationMs: 2 } }),
    (error) => error.code === 'PAUSE_NOT_ALLOWED',
  );
  assert.throws(
    () => scoreSession({ text: 'abc', events: [insert(0, 'a', 0)], finishTimeMs: 0 }),
    (error) => error.code === 'INCOMPLETE_PASSAGE',
  );
});

test('certified focus loss is retained as an untrusted event and breaks latency evidence', () => {
  const result = scoreSession({
    text: 'abcd',
    events: [
      insert(0, 'a', 0),
      insert(1, 'b', 200),
      { seq: 2, type: 'focusLost', t: 500 },
      insert(3, 'c', 700),
      insert(4, 'd', 1000),
    ],
    finishTimeMs: 1000,
    rules: { mode: 'certified', durationMs: 1000 },
  });
  assert.equal(result.focusLossCount, 1);
  assert.equal(result.keyStats.b.timed, 1);
  assert.equal(result.keyStats.c.timed, 0);
  assert.equal(result.metrics.activeDurationMs, 1000);
  assert.throws(
    () => scoreSession({
      text: 'ab',
      events: [insert(0, 'a', 0), { seq: 1, type: 'focusLost', t: 1 }, insert(2, 'b', 2)],
      finishTimeMs: 2,
      rules: { mode: 'practice' },
    }),
    (error) => error.code === 'FOCUS_LOSS_NOT_ALLOWED',
  );
});

test('timed replay uses the full deadline and does not penalize an unattempted suffix', () => {
  const result = scoreSession({
    text: 'abcde',
    events: [insert(0, 'a', 0), insert(1, 'b', 1000), insert(2, 'c', 2000), insert(3, 'd', 60000)],
    finishTimeMs: 60000,
    rules: { mode: 'timed', durationMs: 60000 },
  });
  assert.equal(result.metrics.activeDurationMs, 60000);
  assert.equal(result.metrics.rawAccuracy, 100);
  assert.equal(result.metrics.finalAccuracy, 100);
  assert.equal(result.metrics.grossWpm, 0.8);
});

test('timed replay ignores events after its deadline and rejects early text exhaustion', () => {
  const afterDeadline = scoreSession({
    text: 'abcd',
    events: [insert(0, 'a', 0), insert(1, 'b', 1000), insert(2, 'c', 61000)],
    finishTimeMs: 60000,
    rules: { mode: 'timed', durationMs: 60000 },
  });
  assert.equal(afterDeadline.inserts, 2);
  assert.equal(afterDeadline.metrics.finalAccuracy, 100);
  assert.throws(
    () => scoreSession({
      text: 'ab',
      events: [insert(0, 'a', 0), insert(1, 'b', 100)],
      finishTimeMs: 60000,
      rules: { mode: 'timed', durationMs: 60000 },
    }),
    (error) => error.code === 'CONTENT_FAILURE',
  );
  assert.throws(
    () => scoreSession({
      text: 'ab',
      events: [insert(0, 'a', 0), insert(1, 'b', 500), backspace(2, 600)],
      finishTimeMs: 60000,
      rules: { mode: 'timed', durationMs: 60000 },
    }),
    (error) => error.code === 'CONTENT_FAILURE',
  );
});
