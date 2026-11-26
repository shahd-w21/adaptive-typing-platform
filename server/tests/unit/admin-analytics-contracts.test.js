// Unit contract tests for the admin analytics DTO and query-key factory.
// These tests verify the shape of the draft contract before the real endpoint
// (BE-22) is deployed. They run in Node using the shared schemas directly.
//
// Key invariants:
//   - null rates are accepted when denominators are zero.
//   - Fabricated rates (> 0 when count === 0) are rejected.
//   - Query keys are owner-scoped and never collide across accounts.
//   - en.json and ar.json have identical analytics key sets.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyticsResponseSchema,
  analyticsFiltersSchema,
  analyticsWindowSchema,
} from '../../../packages/shared/src/analytics.js';
import { queryKeys } from '../../../client/src/lib/queryKeys.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal valid analytics payload. */
function validPayload(overrides = {}) {
  return {
    window: '7d',
    windowStart: '2026-11-19T00:00:00.000Z',
    windowEnd: '2026-11-26T00:00:00.000Z',
    activeUsers: { count: 0, windowDays: 7 },
    sessions: {
      total: 0,
      byMode: {},
      completionRate: null,
    },
    speedByMode: [],
    problemKeys: [],
    generation: {
      totalAssignments: 0,
      aiPassCount: 0,
      fallbackCount: 0,
      aiPassRate: null,
      fallbackRate: null,
    },
    pagination: { page: 1, pageSize: 20, total: 0 },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// analyticsWindowSchema
// ---------------------------------------------------------------------------

describe('analyticsWindowSchema', () => {
  it('accepts valid window strings', () => {
    for (const w of ['7d', '30d', '90d']) {
      assert.equal(analyticsWindowSchema.parse(w), w);
    }
  });

  it('rejects an unknown window', () => {
    const result = analyticsWindowSchema.safeParse('1y');
    assert.equal(result.success, false);
  });
});

// ---------------------------------------------------------------------------
// analyticsFiltersSchema
// ---------------------------------------------------------------------------

describe('analyticsFiltersSchema', () => {
  it('defaults to 7d / page 1 / pageSize 20', () => {
    const result = analyticsFiltersSchema.parse({});
    assert.equal(result.window, '7d');
    assert.equal(result.page, 1);
    assert.equal(result.pageSize, 20);
  });

  it('coerces string numbers from query params', () => {
    const result = analyticsFiltersSchema.parse({ page: '3', pageSize: '50' });
    assert.equal(result.page, 3);
    assert.equal(result.pageSize, 50);
  });

  it('rejects pageSize > 100', () => {
    const result = analyticsFiltersSchema.safeParse({ pageSize: 200 });
    assert.equal(result.success, false);
  });
});

// ---------------------------------------------------------------------------
// analyticsResponseSchema — zero denominators
// ---------------------------------------------------------------------------

describe('analyticsResponseSchema — zero denominator rules', () => {
  it('accepts null completionRate when sessions.total === 0', () => {
    const result = analyticsResponseSchema.safeParse(validPayload());
    assert.equal(result.success, true, JSON.stringify(result.error?.issues));
  });

  it('accepts non-null completionRate when sessions.total > 0', () => {
    const result = analyticsResponseSchema.safeParse(
      validPayload({
        sessions: { total: 10, byMode: { practice: 10 }, completionRate: 0.9 },
      })
    );
    assert.equal(result.success, true);
  });

  it('accepts null aiPassRate and fallbackRate when totalAssignments === 0', () => {
    const result = analyticsResponseSchema.safeParse(validPayload());
    assert.equal(result.success, true);
    assert.equal(result.data.generation.aiPassRate, null);
    assert.equal(result.data.generation.fallbackRate, null);
  });

  it('accepts null problemKey.errorRate when attemptCount === 0', () => {
    const result = analyticsResponseSchema.safeParse(
      validPayload({
        problemKeys: [{ key: 'p', errorCount: 0, attemptCount: 0, errorRate: null }],
      })
    );
    assert.equal(result.success, true);
  });

  it('rejects completionRate when negative', () => {
    const result = analyticsResponseSchema.safeParse(
      validPayload({
        sessions: { total: 5, byMode: {}, completionRate: -0.1 },
      })
    );
    assert.equal(result.success, false);
  });

  it('rejects errorRate > 1', () => {
    const result = analyticsResponseSchema.safeParse(
      validPayload({
        problemKeys: [{ key: 'a', errorCount: 20, attemptCount: 10, errorRate: 2.0 }],
      })
    );
    assert.equal(result.success, false);
  });
});

// ---------------------------------------------------------------------------
// analyticsResponseSchema — mode breakdown
// ---------------------------------------------------------------------------

describe('analyticsResponseSchema — speedByMode', () => {
  it('accepts an entry with mode label present', () => {
    const result = analyticsResponseSchema.safeParse(
      validPayload({
        speedByMode: [{
          mode: 'practice',
          sessionCount: 10,
          avgNetWpm: 45.2,
          avgGrossWpm: 48.0,
          avgRawAccuracy: 93.1,
          avgFinalAccuracy: 91.5,
        }],
      })
    );
    assert.equal(result.success, true);
  });

  it('accepts null metric fields when sessionCount === 0', () => {
    const result = analyticsResponseSchema.safeParse(
      validPayload({
        speedByMode: [{
          mode: 'placement',
          sessionCount: 0,
          avgNetWpm: null,
          avgGrossWpm: null,
          avgRawAccuracy: null,
          avgFinalAccuracy: null,
        }],
      })
    );
    assert.equal(result.success, true);
  });

  it('rejects an entry missing the mode field', () => {
    const result = analyticsResponseSchema.safeParse(
      validPayload({
        speedByMode: [{
          sessionCount: 5,
          avgNetWpm: 40,
          avgGrossWpm: 42,
          avgRawAccuracy: 90,
          avgFinalAccuracy: 88,
        }],
      })
    );
    assert.equal(result.success, false);
  });
});

// ---------------------------------------------------------------------------
// queryKeys.analytics — owner isolation
// ---------------------------------------------------------------------------

describe('queryKeys.analytics — owner isolation', () => {
  it('prefixes the key with the owner id', () => {
    const key = queryKeys.analytics('user-1', {});
    assert.equal(key[0], 'owner');
    assert.equal(key[1], 'user-1');
    assert.equal(key[2], 'analytics');
  });

  it('keys for different owners do not match', () => {
    const a = JSON.stringify(queryKeys.analytics('user-1', {}));
    const b = JSON.stringify(queryKeys.analytics('user-2', {}));
    assert.notEqual(a, b);
  });

  it('keys for the same owner and window are identical', () => {
    const a = JSON.stringify(queryKeys.analytics('user-1', { window: '7d' }));
    const b = JSON.stringify(queryKeys.analytics('user-1', { window: '7d' }));
    assert.equal(a, b);
  });

  it('keys differ when the window changes', () => {
    const a = JSON.stringify(queryKeys.analytics('user-1', { window: '7d' }));
    const b = JSON.stringify(queryKeys.analytics('user-1', { window: '30d' }));
    assert.notEqual(a, b);
  });

  it('throws when ownerId is missing', () => {
    assert.throws(() => queryKeys.analytics('', {}), TypeError);
  });

  it('throws when ownerId is not a string', () => {
    assert.throws(() => queryKeys.analytics(null, {}), TypeError);
  });
});

// ---------------------------------------------------------------------------
// i18n parity — analytics keys
// ---------------------------------------------------------------------------

describe('i18n analytics key parity', () => {
  it('en.json and ar.json have identical analytics key sets', async () => {
    const { createRequire } = await import('node:module');
    const req = createRequire(import.meta.url);
    const en = req('../../../client/src/i18n/dictionaries/en.json');
    const ar = req('../../../client/src/i18n/dictionaries/ar.json');

    const enKeys = Object.keys(en.analytics ?? {}).sort();
    const arKeys = Object.keys(ar.analytics ?? {}).sort();

    assert.deepEqual(
      enKeys,
      arKeys,
      `Key mismatch:\n  EN only: ${enKeys.filter(k => !arKeys.includes(k))}\n  AR only: ${arKeys.filter(k => !enKeys.includes(k))}`
    );
    assert.ok(enKeys.length > 0, 'analytics section must not be empty');
  });
});
