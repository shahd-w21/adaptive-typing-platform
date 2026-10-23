/**
 * FE-15 recorder tests for monotonic event times and active pause duration.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { KeystrokeRecorder } from '../../../client/src/features/typing/engine/keystrokeRecorder.js';
import { replay } from '../../src/modules/scoring/replay.js';

test('starts its clock at the first insert and keeps events ordered at zero', () => {
  let now = 0;
  const recorder = new KeystrokeRecorder({ now: () => now });

  assert.equal(recorder.getElapsedMs(), 0);
  assert.equal(recorder.recordBackspace(), null);
  assert.deepEqual(recorder.recordInsert('a'), {
    seq: 0,
    type: 'insert',
    t: 0,
    char: 'a',
  });

  now = 0.2;
  recorder.recordInsert('b');
  now = 0.1;
  recorder.recordBackspace();

  assert.deepEqual(
    recorder.events.map(({ seq, t }) => ({ seq, t })),
    [
      { seq: 0, t: 0 },
      { seq: 1, t: 0 },
      { seq: 2, t: 0 },
    ],
  );
});

test('active elapsed time excludes a pause while wire events retain pause timestamps', () => {
  let now = 0;
  const recorder = new KeystrokeRecorder({ now: () => now });

  recorder.recordInsert('a');
  now = 100;
  recorder.recordPause();
  now = 500;
  assert.equal(recorder.getElapsedMs(), 100);

  now = 600;
  recorder.recordResume();
  now = 900;
  recorder.recordInsert('b');

  assert.equal(recorder.getElapsedMs(), 400);
  assert.deepEqual(
    recorder.events.map(({ seq, type, t }) => ({ seq, type, t })),
    [
      { seq: 0, type: 'insert', t: 0 },
      { seq: 1, type: 'pause', t: 100 },
      { seq: 2, type: 'resume', t: 600 },
      { seq: 3, type: 'insert', t: 900 },
    ],
  );
  assert.equal(recorder.getSubmissionPayload('session-id').finishTime, 900);
});

test('reset clears recorded pause and clock state', () => {
  let now = 25;
  const recorder = new KeystrokeRecorder({ now: () => now });
  recorder.recordInsert('a');
  now = 100;
  recorder.recordPause();
  recorder.reset();

  assert.equal(recorder.getElapsedMs(), 0);
  assert.deepEqual(recorder.events, []);
  assert.equal(recorder.recordInsert('b').t, 0);
});

test('recorded correction and pause events replay to server scoring results', () => {
  let now = 0;
  const corrections = new KeystrokeRecorder({ now: () => now });
  corrections.recordInsert('a');
  now = 100;
  corrections.recordInsert('x');
  now = 200;
  corrections.recordBackspace();
  now = 1000;
  corrections.recordInsert('b');
  now = 2000;
  corrections.recordInsert('c');

  const correctedScore = replay(
    'abc',
    corrections.getSubmissionPayload('session').events,
    2000,
  );
  assert.equal(correctedScore.metrics.rawAccuracy, 75);
  assert.equal(correctedScore.metrics.finalAccuracy, 100);
  assert.equal(correctedScore.metrics.activeDurationMs, 2000);

  now = 0;
  const pauses = new KeystrokeRecorder({ now: () => now });
  pauses.recordInsert('a');
  now = 100;
  pauses.recordPause();
  now = 1100;
  pauses.recordResume();
  now = 2000;
  pauses.recordInsert('b');

  const pausedScore = replay(
    'ab',
    pauses.getSubmissionPayload('session').events,
    2000,
  );
  assert.equal(pausedScore.metrics.activeDurationMs, 1000);
  assert.equal(pausedScore.keyStats.b.timed, 0);
});
