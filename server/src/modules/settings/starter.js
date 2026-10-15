// Curriculum and provisional product defaults recovered from teammate commit 68d311f.
// SRS scoring/evidence defaults supersede the old placeholder mastery thresholds.
export async function seedStarter(database) {
  await database.$transaction(async tx => {
    for (const group of [
      { id: 1, name: 'Home row', keys: 'asdfjkl;', prerequisiteId: null },
      { id: 2, name: 'Index reach', keys: 'gh', prerequisiteId: 1 },
      { id: 3, name: 'Top row', keys: 'qwertyuiop', prerequisiteId: 2 },
      { id: 4, name: 'Bottom row', keys: 'zxcvbnm,./', prerequisiteId: 3 },
    ]) await tx.keyGroup.upsert({ where: { id: group.id }, create: group, update: {} });
    await tx.settingVersion.upsert({ where: { id: 'teammate-migration-v1' }, update: {}, create: {
      id: 'teammate-migration-v1', values: {
        accuracyGate: 95, alpha: 0.2, masteryAccuracy: 97, masteryAttempts: 30, masteryLatencySamples: 30, masterySessions: 2,
        latencyCutoffMs: 2000, maxKeystrokes: 5000, maxWpm: 250, clockToleranceMs: 3000,
        minimumRewardMs: 1000, xpPerLevel: 500, xpFormula: 'floor(finalCorrect * rawAccuracy / 100)',
        logRetentionDays: 30, sessionExpiryMs: 3600000,
      },
    } });
  });
}
