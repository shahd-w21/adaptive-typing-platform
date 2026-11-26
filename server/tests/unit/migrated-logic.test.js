import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMetrics, submissionSchema, registerSchema, profileSchema } from '@typeflow/shared';
import { replay } from '../../src/modules/scoring/replay.js';
import { generatePracticeText, selectPracticeFocus } from '../../src/modules/generation/fallbackGenerator.js';
import { nextStreak } from '../../src/modules/gamification/rules.js';
import { recommendNext } from '../../src/modules/path/recommend.js';
import { transaction } from '../../src/db/transaction.js';

const event = (seq, char, t) => ({ seq, type: 'insert', char, t });
test('corrections retain raw errors and use final buffer for official speed', () => {
  const score = replay('abc', [event(0, 'a', 0), event(1, 'x', 100), { seq: 2, type: 'backspace', t: 200 }, event(3, 'b', 1000), event(4, 'c', 2000)], 2000);
  assert.equal(score.metrics.grossWpm, 18);
  assert.equal(score.metrics.netWpm, 18);
  assert.equal(score.metrics.rawAccuracy, 75);
  assert.equal(score.metrics.finalAccuracy, 100);
  assert.equal(score.keyStats.b.timed, 0);
  const imperfect = calculateMetrics({ inserts: 5, correctInserts: 4, bufferLength: 5, finalCorrect: 4, activeDurationMs: 60000 });
  assert.equal(imperfect.netWpm, 0);
});
test('pause spans affect active time and break latency evidence', () => {
  const score = replay('ab', [event(0, 'a', 0), { seq: 1, type: 'pause', t: 100 }, { seq: 2, type: 'resume', t: 1100 }, event(3, 'b', 2000)], 2000);
  assert.equal(score.metrics.activeDurationMs, 1000);
  assert.equal(score.keyStats.b.timed, 0);
  assert.throws(() => replay('ab', [event(0, 'a', 0), event(2, 'b', 1000)], 1000));
  assert.throws(() => replay('abc', [event(0, 'a', 0)], 0));
});
test('fallback is reproducible and restricted to unlocked keys', () => {
  const keys = [{ key: 'a', weight: 1 }, { key: 's', weight: 2 }];
  assert.equal(generatePracticeText(keys, () => 0.1), generatePracticeText(keys, () => 0.1));
  assert.match(generatePracticeText(keys, () => 0.9), /^[as ]+$/);
  const focused = generatePracticeText(keys, () => 0.1, 3, { focusKeys: ['s'] });
  assert.ok(focused.includes('as'));
  assert.ok(focused.split(' ').includes('sss'));
  assert.throws(() => generatePracticeText(keys, () => 0.1, 3, { focusKeys: ['d'] }));
  assert.throws(() => generatePracticeText([], () => 0));
});

test('focus selection reserves exploration and due review before filling weak unlocked keys', () => {
  const keys = [
    { key: 'a', status: 'in_progress', attempts: 30, latencySamples: 30, accuracy: 70, avgMs: 500 },
    { key: 's', status: 'in_progress', attempts: 40, latencySamples: 30, accuracy: 90, avgMs: 220 },
    { key: 'd', status: 'in_progress', attempts: 2, latencySamples: 1, accuracy: null, avgMs: null },
    { key: 'f', status: 'locked', attempts: 0, latencySamples: 0, accuracy: null, avgMs: null },
  ];
  const dueReviews = [{
    key: 'j',
    status: 'mastered',
    attempts: 50,
    latencySamples: 45,
    accuracy: 99,
    avgMs: 180,
    nextReviewAt: new Date('2026-11-25T00:00:00.000Z'),
  }];

  assert.deepEqual(selectPracticeFocus(keys, 40, dueReviews), ['d', 'j', 'a', 's']);
});

test('recommendation follows the current weakest unlocked key after its evidence improves', () => {
  const baseKeys = [
    { key: 'a', status: 'in_progress', attempts: 20, latencySamples: 10, accuracy: 55, avgMs: 500 },
    { key: 's', status: 'in_progress', attempts: 30, latencySamples: 20, accuracy: 90, avgMs: 220 },
  ];
  const before = recommendNext({
    placementDone: true,
    completedSessions: 1,
    keys: baseKeys,
    targetWpm: 40,
  });
  const after = recommendNext({
    placementDone: true,
    completedSessions: 2,
    keys: [
      { ...baseKeys[0], attempts: 40, latencySamples: 40, accuracy: 99, avgMs: 180 },
      baseKeys[1],
    ],
    targetWpm: 40,
  });

  assert.equal(before.weakestKey, 'a');
  assert.equal(after.weakestKey, 's');
  assert.deepEqual(before.focusKeys, ['a', 's']);
  assert.deepEqual(after.focusKeys, ['s', 'a']);
  assert.notEqual(before.reason, after.reason);
});
test('schemas reject malformed events/passwords and strip registration roles', () => {
  assert.equal(registerSchema.parse({ email: ' USER@EXAMPLE.COM ', password: 'Strong123', role: 'ADMIN' }).role, undefined);
  assert.equal(registerSchema.safeParse({ email: 'x@example.com', password: 'abcdefgh' }).success, false);
  assert.equal(submissionSchema.safeParse({ events: [{ seq: 0, type: 'insert', t: 0, char: 'ab' }], finishTimeMs: 0 }).success, false);
  assert.equal(profileSchema.safeParse({ timezone: 'not/a/timezone' }).success, false);
  assert.equal(profileSchema.safeParse({ preferences: { uiLocale: 'ar' } }).success, true);
});
test('streak and recommendation preserve teammate behaviour without invented evidence', () => {
  assert.equal(nextStreak({ streak: 3, lastPracticeDate: '2026-10-14' }, '2026-10-15'), 4);
  assert.equal(nextStreak({ streak: 3, lastPracticeDate: '2026-10-15' }, '2026-10-15'), 3);
  assert.equal(nextStreak({ streak: 3, lastPracticeDate: '2026-10-10' }, '2026-10-15'), 1);
  assert.equal(recommendNext({ placementDone: false, completedSessions: 0, keys: [] }).activity, 'placement');
});
test('transactions retry PostgreSQL serialization failures from raw row locks', async () => {
  let calls = 0;
  const database = { $transaction: async work => {
    calls++;
    if (calls === 1) throw Object.assign(new Error('serialization'), { code: 'P2010', meta: { code: '40001' } });
    return work('transaction-client');
  } };
  assert.equal(await transaction(database, async tx => tx), 'transaction-client');
  assert.equal(calls, 2);
});
test('transactions recognise Prisma adapter SQLSTATE metadata', async () => {
  let calls = 0;
  const database = { $transaction: async () => {
    if (calls++ === 0) throw Object.assign(new Error('serialization'), { code: 'P2010', meta: { driverAdapterError: { cause: { originalCode: '40001' } } } });
    return 'saved';
  } };
  assert.equal(await transaction(database, async () => {}), 'saved');
});
test('transactions retry PostgreSQL adapter conflicts exposed as direct SQLSTATE causes', async () => {
  let calls = 0;
  const database = { $transaction: async () => {
    if (calls++ === 0) {
      throw Object.assign(new Error('serialization conflict'), {
        name: 'DriverAdapterError',
        cause: { originalCode: '40001' },
      });
    }
    return 'saved';
  } };
  assert.equal(await transaction(database, async () => {}), 'saved');
  assert.equal(calls, 2);
});
