/** Contract and deduplication unit checks for Gamification & Rewards. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gamificationResponseSchema } from '../../../packages/shared/src/index.js';
import { fetchGamification } from '../../../client/src/api/gamification.js';
import { ApiError } from '../../../client/src/api/client.js';
import {
  CAPTURED_XP_PER_LEVEL,
  computeDailyGoalProgress,
  computeLevelProgress,
} from '../../../client/src/features/gamification/hooks/useGamification.js';
import { buildSessionRewardEvents } from '../../../client/src/context/rewards.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../..');

test('gamificationResponseSchema validates current /gamification DTO and rejects invalid fields', () => {
  const valid = {
    xp: 19,
    level: 1,
    streak: 1,
    dailyGoal: {
      goalMinutes: 10,
      minutesToday: 2.5,
      done: false,
    },
  };
  assert.deepEqual(gamificationResponseSchema.parse(valid), valid);

  assert.throws(() =>
    gamificationResponseSchema.parse({
      ...valid,
      level: 0,
    }),
  );
  assert.throws(() =>
    gamificationResponseSchema.parse({
      ...valid,
      unknownField: true,
    }),
  );
});

test('fetchGamification validates response or throws CONTRACT_ERROR', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          xp: 520,
          level: 2,
          streak: 3,
          dailyGoal: { goalMinutes: 15, minutesToday: 15, done: true },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );

    const data = await fetchGamification();
    assert.equal(data.xp, 520);
    assert.equal(data.level, 2);

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ xp: -5 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    await assert.rejects(
      () => fetchGamification(),
      (err) => err instanceof ApiError && err.code === 'CONTRACT_ERROR',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('computeLevelProgress and computeDailyGoalProgress use captured policy values and minutes', () => {
  assert.equal(CAPTURED_XP_PER_LEVEL, 500);
  const progress = computeLevelProgress(620, 2);
  assert.deepEqual(progress, {
    xp: 620,
    level: 2,
    nextLevel: 3,
    xpPerLevel: 500,
    xpIntoLevel: 120,
    xpToNextLevel: 380,
    percent: 24,
  });

  const goal = computeDailyGoalProgress({
    goalMinutes: 10,
    minutesToday: 4.5,
    done: false,
  });
  assert.equal(goal.remainingMinutes, 5.5);
  assert.equal(goal.percent, 45);
  assert.equal(goal.done, false);
});

test('buildSessionRewardEvents deduplicates by server event ID, skips recovered results, and skips placement', () => {
  const seenIds = new Set();
  const result = {
    sessionId: '20000000-0000-4000-8000-000000000001',
    xpEarned: 45,
    level: 2,
    leveledUp: true,
    streak: 4,
  };
  const newRewards = [{ id: `xp:${result.sessionId}`, type: 'xp', amount: 45 }];

  const first = buildSessionRewardEvents(result, {
    recovered: false,
    newRewards,
    seenIds,
    mode: 'practice',
  });
  assert.equal(first.length, 3);
  assert.deepEqual(
    first.map((event) => event.type),
    ['xp', 'level', 'streak'],
  );

  // Identical retry must not celebrate twice.
  const duplicate = buildSessionRewardEvents(result, {
    recovered: false,
    newRewards,
    seenIds,
    mode: 'practice',
  });
  assert.deepEqual(duplicate, []);

  // Recovered result must not celebrate at all.
  const recovered = buildSessionRewardEvents(
    { ...result, sessionId: '20000000-0000-4000-8000-000000000002' },
    {
      recovered: true,
      newRewards: [{ id: 'xp:20000000-0000-4000-8000-000000000002', type: 'xp', amount: 20 }],
      seenIds,
      mode: 'practice',
    },
  );
  assert.deepEqual(recovered, []);

  // Placement mode must not emit reward celebrations.
  const placement = buildSessionRewardEvents(
    { ...result, sessionId: '20000000-0000-4000-8000-000000000003' },
    {
      recovered: false,
      newRewards: [{ id: 'xp:20000000-0000-4000-8000-000000000003', type: 'xp', amount: 20 }],
      seenIds,
      mode: 'placement',
    },
  );
  assert.deepEqual(placement, []);
});

test('en.json and ar.json contain matching achievements translation keys', () => {
  const en = JSON.parse(
    fs.readFileSync(
      path.join(rootDir, 'client/src/i18n/dictionaries/en.json'),
      'utf8',
    ),
  );
  const ar = JSON.parse(
    fs.readFileSync(
      path.join(rootDir, 'client/src/i18n/dictionaries/ar.json'),
      'utf8',
    ),
  );
  assert.deepEqual(
    Object.keys(en.achievements).sort(),
    Object.keys(ar.achievements).sort(),
  );
});
