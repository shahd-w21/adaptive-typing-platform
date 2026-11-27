/**
 * FE-11 progress contract, filter/pagination, cache-isolation and i18n unit tests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient } from '@tanstack/react-query';
import {
  progressResponseSchema,
  progressFiltersSchema,
  isLearningMode,
  isAssessmentMode,
} from '@typeflow/shared';
import { fetchProgress } from '../../../client/src/api/progress.js';
import { queryKeys } from '../../../client/src/lib/queryKeys.js';
import {
  filterProgressSessions,
  paginateProgressSessions,
  summarizeModeGroup,
} from '../../../client/src/features/progress/hooks/useProgress.js';
import { completedSessions, keyStats } from '../../../client/tests/fixtures/data.js';
import en from '../../../client/src/i18n/dictionaries/en.json' with { type: 'json' };
import ar from '../../../client/src/i18n/dictionaries/ar.json' with { type: 'json' };

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status });

test('progressResponseSchema validates real progress DTOs and rejects invalid metrics', () => {
  const valid = { sessions: completedSessions, keys: keyStats };
  assert.deepEqual(progressResponseSchema.parse(valid), valid);

  const missingLatency = {
    sessions: [{ ...completedSessions[0], netWpm: null, rawAccuracy: null }],
    keys: [{ ...keyStats[0], accuracy: null, avgMs: null, attempts: 0 }],
  };
  assert.equal(progressResponseSchema.safeParse(missingLatency).success, true);
  assert.equal(
    progressResponseSchema.safeParse({
      sessions: [{ ...completedSessions[0], rawAccuracy: 105 }],
      keys: keyStats,
    }).success,
    false,
  );
});

test('progressFiltersSchema validates draft filters and rejects unknown keys', () => {
  assert.deepEqual(progressFiltersSchema.parse({}), {
    mode: 'all',
    difficulty: 'all',
    timeRange: 'all',
    page: 1,
    pageSize: 10,
  });
  assert.equal(
    progressFiltersSchema.safeParse({ mode: 'assessment', timeRange: '30d' })
      .success,
    true,
  );
  assert.equal(
    progressFiltersSchema.safeParse({ unknownField: 'x' }).success,
    false,
  );
});

test('fetchProgress validates response against progressResponseSchema', async (context) => {
  const payload = { sessions: completedSessions, keys: keyStats };
  context.mock.method(globalThis, 'fetch', async () => json(payload));
  const result = await fetchProgress();
  assert.deepEqual(result, payload);

  context.mock.method(globalThis, 'fetch', async () =>
    json({ sessions: 'not-an-array', keys: [] }),
  );
  await assert.rejects(fetchProgress(), { code: 'CONTRACT_ERROR' });
});

test('queryKeys.progressFiltered isolates accounts and filters and clears on owner removal', () => {
  assert.notDeepEqual(
    queryKeys.progressFiltered('one', { mode: 'practice' }),
    queryKeys.progressFiltered('two', { mode: 'practice' }),
  );
  assert.notDeepEqual(
    queryKeys.progressFiltered('one', { mode: 'practice' }),
    queryKeys.progressFiltered('one', { mode: 'timed' }),
  );
  assert.throws(() => queryKeys.progressFiltered('one', { bad: true }));

  const client = new QueryClient();
  try {
    client.setQueryData(queryKeys.progress('first'), { sessions: [], keys: [] });
    client.setQueryData(
      queryKeys.progressFiltered('first', { mode: 'practice' }),
      { sessions: [] },
    );
    client.setQueryData(queryKeys.progress('second'), {
      sessions: completedSessions,
      keys: keyStats,
    });
    client.removeQueries({ queryKey: queryKeys.owner('first') });
    assert.equal(client.getQueryData(queryKeys.progress('first')), undefined);
    assert.equal(
      client.getQueryData(
        queryKeys.progressFiltered('first', { mode: 'practice' }),
      ),
      undefined,
    );
    assert.ok(client.getQueryData(queryKeys.progress('second')));
  } finally {
    client.clear();
  }
});

test('filterProgressSessions, pagination and mode-group summaries separate learning from assessment', () => {
  const now = new Date('2026-10-20T12:00:00.000Z');
  const mixedSessions = [
    {
      ...completedSessions[0],
      id: '11111111-1111-4111-8111-111111111111',
      mode: 'practice',
      difficulty: 1,
      netWpm: 30,
      rawAccuracy: 96,
      completedAt: '2026-10-19T12:00:00.000Z',
    },
    {
      ...completedSessions[0],
      id: '22222222-2222-4222-8222-222222222222',
      mode: 'timed',
      difficulty: 2,
      netWpm: 50,
      rawAccuracy: 98,
      completedAt: '2026-10-01T12:00:00.000Z',
    },
    {
      ...completedSessions[0],
      id: '33333333-3333-4333-8333-333333333333',
      mode: 'lesson',
      difficulty: 1,
      netWpm: null,
      rawAccuracy: null,
      completedAt: '2026-07-01T12:00:00.000Z',
    },
  ];

  const learningOnly = filterProgressSessions(
    mixedSessions,
    { mode: 'learning' },
    now,
  );
  assert.equal(learningOnly.length, 2);
  assert.ok(learningOnly.every((s) => isLearningMode(s.mode)));

  const assessmentOnly = filterProgressSessions(
    mixedSessions,
    { mode: 'assessment' },
    now,
  );
  assert.equal(assessmentOnly.length, 1);
  assert.ok(assessmentOnly.every((s) => isAssessmentMode(s.mode)));

  const recent7d = filterProgressSessions(
    mixedSessions,
    { timeRange: '7d' },
    now,
  );
  assert.equal(recent7d.length, 1);

  const diff1 = filterProgressSessions(
    mixedSessions,
    { difficulty: '1' },
    now,
  );
  assert.equal(diff1.length, 2);

  const page1 = paginateProgressSessions(mixedSessions, 1, 2);
  assert.equal(page1.items.length, 2);
  assert.equal(page1.totalPages, 2);
  const page2 = paginateProgressSessions(mixedSessions, 2, 2);
  assert.equal(page2.items.length, 1);

  const emptySummary = summarizeModeGroup([{ netWpm: null, rawAccuracy: null }]);
  assert.equal(emptySummary.averageNetWpm, null);
  assert.equal(emptySummary.averageRawAccuracy, null);
});

test('en.json and ar.json contain matching progress translation keys', () => {
  assert.deepEqual(
    Object.keys(en.progress).sort(),
    Object.keys(ar.progress).sort(),
  );
});
