/**
 * FE-15 checks that browser metrics use shared formulas and unavailable denominators.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMetrics } from '@typeflow/shared';
import {
  computeLiveMetrics,
  computeFixtureResults,
} from '../../../client/src/features/typing/engine/liveMetrics.js';

test('live metrics preserve unavailable values when no time or inserts exist', () => {
  const live = computeLiveMetrics({
    totalInserts: 0,
    correctInserts: 0,
    bufferLength: 0,
    finalCorrect: 0,
    activeDurationMs: 0,
  });

  assert.equal(live.grossWpm, null);
  assert.equal(live.rawAccuracy, null);
  assert.equal(live.formattedGrossWpm, null);
  assert.equal(live.formattedRawAccuracy, null);
});

test('live and fixture metrics follow shared correction and pause-aware formulas', () => {
  const expected = calculateMetrics({
    inserts: 4,
    correctInserts: 3,
    bufferLength: 3,
    finalCorrect: 3,
    activeDurationMs: 60000,
  });
  const live = computeLiveMetrics({
    totalInserts: 4,
    correctInserts: 3,
    bufferLength: 3,
    finalCorrect: 3,
    activeDurationMs: 60000,
  });
  const fixture = computeFixtureResults({
    totalInserts: 4,
    correctInserts: 3,
    buffer: 'abc',
    assignedText: 'abc',
    activeDurationMs: 60000,
  });

  assert.equal(live.netWpm, expected.netWpm);
  assert.equal(live.grossWpm, Math.round(expected.grossWpm));
  assert.equal(live.rawAccuracy, Math.round(expected.rawAccuracy * 10) / 10);
  assert.equal(fixture.netWpm, Math.round(expected.netWpm));
  assert.equal(fixture.finalAccuracy, expected.finalAccuracy);
});
