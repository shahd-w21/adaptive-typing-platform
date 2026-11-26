// Deterministic recorder and API-boundary checks for the supported practice mode.
import assert from 'node:assert/strict';
import test from 'node:test';
import { request } from '../../src/api/client.js';
import { toSessionPayload } from '../../src/features/typing/engine/sessionPayload.js';
import { KeystrokeRecorder } from '../../src/features/typing/engine/keystrokeRecorder.js';

test('records ordered monotonic events and projects only the submission contract', () => {
  let instant = 100;
  const observed = [];
  const recorder = new KeystrokeRecorder({
    now: () => instant,
    onEvent: (event) => observed.push(event),
  });

  assert.equal(recorder.recordBackspace(), null);
  assert.equal(recorder.recordPause(), null);
  assert.deepEqual(recorder.recordInsert('a'), {
    seq: 0,
    type: 'insert',
    t: 0,
    char: 'a',
  });

  instant = 110;
  assert.equal(recorder.recordPause().t, 10);
  assert.equal(recorder.recordPause(), null);
  instant = 160;
  assert.equal(recorder.recordResume().t, 60);
  assert.equal(recorder.recordResume(), null);
  instant = 175;
  assert.equal(recorder.recordBackspace().t, 75);

  const snapshot = recorder.getSubmissionPayload(
    '20000000-0000-4000-8000-000000000001',
  );
  assert.equal(snapshot.finishTime, 75);
  assert.equal(snapshot.clientEventCount, 4);
  assert.deepEqual(observed, snapshot.events);
  assert.deepEqual(toSessionPayload(snapshot), {
    events: snapshot.events,
    finishTimeMs: 75,
  });
  assert.deepEqual(
    snapshot.events.map((event) => event.seq),
    [0, 1, 2, 3],
  );
  assert.deepEqual(
    snapshot.events.map((event) => event.t),
    [0, 10, 60, 75],
  );
});

test('reset starts a fresh event sequence and clock origin', () => {
  let instant = 500;
  const recorder = new KeystrokeRecorder({ now: () => instant });
  recorder.recordInsert('A');
  instant = 700;
  recorder.recordBackspace();

  recorder.reset();
  instant = 900;
  assert.deepEqual(recorder.recordInsert('!'), {
    seq: 0,
    type: 'insert',
    t: 0,
    char: '!',
  });
});

test('unimplemented session modes are rejected before any API request', async () => {
  let fetchCount = 0;
  const fetchImpl = async () => {
    fetchCount += 1;
    throw new Error('Unsupported modes must not reach the API.');
  };

  for (const mode of ['placement', 'lesson', 'review', 'timed', 'certified']) {
    await assert.rejects(
      request('/sessions', {
        method: 'POST',
        csrfToken: 'a'.repeat(64),
        body: { mode },
        fetchImpl,
      }),
      (error) => error.code === 'INVALID_REQUEST',
    );
  }
  assert.equal(fetchCount, 0);
});
