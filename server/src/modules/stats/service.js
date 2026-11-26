import { updateKeyEvidence, eligibleUnlocks } from '../adaptive/mastery.js';

/** Creates missing per-user key rows while preserving existing evidence/status. */
export async function ensureKeyProgress(tx, userId) {
  const groups = await tx.keyGroup.findMany({ where: { isActive: true }, orderBy: { id: 'asc' } });
  await tx.keyStat.createMany({ data: groups.flatMap(group => [...group.keys].map(key => ({ userId, key, status: group.prerequisiteId === null ? 'in_progress' : 'locked' }))), skipDuplicates: true });
  return groups;
}
/** Updates ordinary learning evidence and unlocks groups only after a pass. */
export async function updateKeyProgress(tx, userId, keyStats, rules, now) {
  const mastered = [], unlocked = [];
  for (const [key, sample] of Object.entries(keyStats)) {
    const row = await tx.keyStat.findUnique({ where: { userId_key: { userId, key } } });
    if (!row || row.status === 'locked') continue;
    const data = { ...updateKeyEvidence(row, sample, rules), updatedAt: now };
    if (row.status !== 'mastered' && data.status === 'mastered') mastered.push(key);
    if (row.status !== 'mastered' && data.status === 'mastered') {
      data.reviewStage = 0;
      data.lastReviewAt = null;
      data.nextReviewAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
    await tx.keyStat.update({ where: { userId_key: { userId, key } }, data });
  }
  const groups = await tx.keyGroup.findMany({ where: { isActive: true }, orderBy: { id: 'asc' } });
  const stats = await tx.keyStat.findMany({ where: { userId } });
  if (rules.passed) for (const key of eligibleUnlocks(groups, stats)) {
      const result = await tx.keyStat.updateMany({ where: { userId, key, status: 'locked' }, data: { status: 'in_progress' } });
      if (result.count) unlocked.push(key);
  }
  return { mastered, unlocked };
}
