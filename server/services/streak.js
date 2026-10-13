// Updates the streak after a completed session, using the user's own timezone.
// Same day: unchanged. Day after the last practice day: +1. Otherwise: back to 1.
async function updateStreak(client, userId) {
  const result = await client.query(
    `UPDATE users SET
       streak = CASE
         WHEN last_practice_date = (NOW() AT TIME ZONE timezone)::date THEN streak
         WHEN last_practice_date = (NOW() AT TIME ZONE timezone)::date - 1 THEN streak + 1
         ELSE 1 END,
       last_practice_date = (NOW() AT TIME ZONE timezone)::date
     WHERE id = $1
     RETURNING streak`,
    [userId]
  );
  return result.rows[0].streak;
}

module.exports = { updateStreak };