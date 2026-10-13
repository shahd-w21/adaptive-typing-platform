const MIN_KEY_ATTEMPTS = 3; // presses needed in one session to judge a key

async function updateKeyProgress(client, userId, keyStats, { masteryAccuracy, masterySessions }) {
  // 1. Update the stats of every key typed in this session
  for (const [key, s] of Object.entries(keyStats)) {
    const accuracy = ((s.attempts - s.errors) / s.attempts) * 100;
    const avgMs = s.timed > 0 ? s.totalMs / s.timed : null;

    await client.query(
      `UPDATE key_progress SET
         attempts = attempts + $3::int,
         avg_ms = CASE
           WHEN $4::numeric IS NULL THEN avg_ms
           WHEN avg_ms IS NULL THEN $4::numeric
           ELSE avg_ms * 0.7 + $4::numeric * 0.3 END,
         accuracy = CASE
           WHEN accuracy IS NULL THEN $5::numeric
           ELSE accuracy * 0.7 + $5::numeric * 0.3 END,
         good_sessions = CASE
           WHEN $3::int < $6::int THEN good_sessions
           WHEN $5::numeric >= $7::numeric THEN good_sessions + 1
           ELSE 0 END,
         updated_at = NOW()
       WHERE user_id = $1 AND key_char = $2 AND status IN ('in_progress', 'mastered')`,
      [userId, key, s.attempts, avgMs, accuracy, MIN_KEY_ATTEMPTS, masteryAccuracy]
    );
  }

  // 2. Keys with enough good sessions become mastered
  const mastered = await client.query(
    `UPDATE key_progress SET status = 'mastered', updated_at = NOW()
     WHERE user_id = $1 AND status = 'in_progress' AND good_sessions >= $2
     RETURNING key_char`,
    [userId, masterySessions]
  );

  // 3. Unlock a group when every key of its prerequisite group is mastered
  const unlocked = await client.query(
    `UPDATE key_progress kp SET status = 'in_progress', updated_at = NOW()
     FROM key_groups g
     WHERE kp.user_id = $1 AND kp.status = 'locked'
       AND g.is_active AND g.prerequisite_group_id IS NOT NULL
       AND strpos(g.keys, kp.key_char) > 0
       AND NOT EXISTS (
         SELECT 1 FROM key_groups p
         JOIN key_progress pk ON pk.user_id = $1 AND strpos(p.keys, pk.key_char) > 0
         WHERE p.id = g.prerequisite_group_id AND pk.status <> 'mastered'
       )
     RETURNING kp.key_char`,
    [userId]
  );

  return {
    mastered: mastered.rows.map((r) => r.key_char),
    unlocked: unlocked.rows.map((r) => r.key_char),
  };
}

module.exports = { updateKeyProgress };