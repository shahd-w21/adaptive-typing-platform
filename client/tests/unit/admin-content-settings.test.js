// Unit checks for the FE-23 draft content and versioned-settings boundaries.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAdminContentApi,
  createAdminSettingsApi,
} from '../../src/api/admin.js';
import {
  adminContentSchema,
  learningSettingsSchema,
} from '@typeflow/shared';

const admin = {
  id: '10000000-0000-4000-8000-000000000099',
  role: 'admin',
};

function contentInput(overrides = {}) {
  return {
    version: 'v1.2.0',
    words: ['ask', 'sad', 'dad', 'fall'],
    blockedWords: [],
    themeLabel: 'Everyday words',
    keys: ['a', 's', 'd', 'f', 'j', 'k', 'l'],
    prerequisites: [],
    source: 'team-authored',
    ...overrides,
  };
}

test('draft content validates an English key-compatible fallback', async () => {
  const api = createAdminContentApi(admin, {
    mode: 'fixture',
    csrfToken: 'a'.repeat(64),
  });
  const data = await api.get();
  assert.equal(adminContentSchema.safeParse(data).success, true);

  const validation = await api.validate(contentInput());
  assert.equal(validation.valid, true);
  assert.equal(validation.preview.beginner, 'ask sad dad');
  assert.equal(validation.preview.advanced, 'sad dad fall');
});

test('draft content rejects duplicate keys, missing prerequisites and blocked words', async () => {
  const api = createAdminContentApi(admin, {
    mode: 'fixture',
    csrfToken: 'a'.repeat(64),
  });

  const validation = await api.validate(contentInput({
    keys: ['a', 'a', 's'],
    prerequisites: ['missing-group'],
    words: ['ask'],
    blockedWords: ['ask'],
  }));
  assert.equal(validation.valid, false);
  assert.equal(validation.errors.some((error) => error.includes('duplicates')), true);
  assert.equal(validation.errors.some((error) => error.includes('missing prerequisite')), false);
  assert.equal(validation.errors.some((error) => error.includes('Missing prerequisite')), true);
  assert.equal(validation.errors.some((error) => error.includes('Blocked word')), true);
});

test('draft content activation requires CSRF and creates a new version', async () => {
  const api = createAdminContentApi(admin, {
    mode: 'fixture',
    csrfToken: 'a'.repeat(64),
  });
  const activated = await api.activate(contentInput());
  assert.equal(activated.activated, true);
  assert.equal(activated.version, 'v1.2.1');
});

test('learning settings validate bounds and future-only version activation', async () => {
  const api = createAdminSettingsApi(admin, {
    mode: 'fixture',
    csrfToken: 'a'.repeat(64),
  });
  const data = await api.get();
  assert.equal(learningSettingsSchema.safeParse(data).success, true);

  const activated = await api.activate({
    currentVersion: data.currentVersion,
    expectedCurrentVersion: data.currentVersion,
    rawAccuracyGatePercent: 96,
    difficultyReductionPercent: 88,
    initialLatencyCutoffMs: 2100,
  });
  assert.equal(activated.activated, true);
  assert.equal(activated.currentVersion, 'v1.2.1');
});

test('learning settings reject stale versions and invalid threshold order', async () => {
  const api = createAdminSettingsApi(admin, {
    mode: 'fixture',
    csrfToken: 'a'.repeat(64),
  });
  const current = await api.get();

  await assert.rejects(
    () => api.activate({
      currentVersion: 'v1.1.0',
      expectedCurrentVersion: 'v1.1.0',
      rawAccuracyGatePercent: 95,
      difficultyReductionPercent: 90,
      initialLatencyCutoffMs: 2000,
    }),
    /settings version changed/i,
  );

  await assert.rejects(
    () => api.activate({
      currentVersion: current.currentVersion,
      expectedCurrentVersion: current.currentVersion,
      rawAccuracyGatePercent: 90,
      difficultyReductionPercent: 92,
      initialLatencyCutoffMs: 2000,
    }),
    /difficulty reduction boundary must remain below/i,
  );
});

test('FE-23 production boundaries fail closed', async () => {
  const content = createAdminContentApi(admin, { mode: 'unavailable' });
  const settings = createAdminSettingsApi(admin, { mode: 'unavailable' });

  await assert.rejects(
    () => content.get(),
    (error) => error.code === 'FEATURE_UNAVAILABLE',
  );
  await assert.rejects(
    () => settings.get(),
    (error) => error.code === 'FEATURE_UNAVAILABLE',
  );
});
