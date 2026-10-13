const express = require("express");
const pool = require("../db");
const { verifyToken } = require("../middleware/auth");
const { generatePracticeText, keyWeight } = require("../utils/textGenerator");
const { scoreSession } = require("../utils/scoring");
const { updateKeyProgress } = require("../services/keyProgress");
const { updateStreak } = require("../services/streak");

const router = express.Router();

const XP_PER_LEVEL = 500;
const MAX_KEYSTROKES = 5000;
const MAX_WPM = 250;
const round2 = (n) => Math.round(n * 100) / 100;

// START: the server chooses the text and creates the session
router.post("/start", verifyToken, async (req, res) => {
  try {
    // First time: the first key group is in progress, the rest are locked
    await pool.query(
      `INSERT INTO key_progress (user_id, key_char, status)
       SELECT $1::int, k,
              CASE WHEN g.prerequisite_group_id IS NULL THEN 'in_progress' ELSE 'locked' END
       FROM key_groups g, regexp_split_to_table(g.keys, '') AS k
       WHERE g.is_active
       ON CONFLICT DO NOTHING`,
      [req.user.id]
    );
    const keysResult = await pool.query(
      `SELECT key_char, status, accuracy, avg_ms FROM key_progress
       WHERE user_id = $1 AND status IN ('in_progress', 'mastered')`,
      [req.user.id]
    );
    const keys = keysResult.rows.map((r) => ({
      key: r.key_char,
      weight: keyWeight(r),
    }));
    if (keys.length === 0) {
      return res.status(500).json({ error: "No unlocked keys. Check key_groups." });
    }

    const text = generatePracticeText(keys);
    const result = await pool.query(
      `INSERT INTO sessions (user_id, mode, text_content, text_source)
       VALUES ($1, 'practice', $2, 'server') RETURNING id`,
      [req.user.id, text]
    );

    res.status(201).json({ sessionId: result.rows[0].id, text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// SUBMIT: the browser sends only { typed_char, t_ms } for every keystroke
router.post("/:id/submit", verifyToken, async (req, res) => {
  const sessionId = Number(req.params.id);
  const { keystrokes } = req.body;

  if (!Number.isInteger(sessionId) || !Array.isArray(keystrokes) ||
      keystrokes.length === 0 || keystrokes.length > MAX_KEYSTROKES) {
    return res.status(400).json({ error: "Invalid submission" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const found = await client.query(
      `SELECT *, EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000 AS elapsed_ms
       FROM sessions WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [sessionId, req.user.id]
    );
    const session = found.rows[0];
    if (!session) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Session not found" });
    }
    if (session.status !== "started") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Session already submitted" });
    }

    const score = scoreSession(session.text_content, keystrokes);

    let problem = null;
    if (score.error) problem = score.error;
    else if (!score.finished) problem = "Exercise not finished";
    else if (score.typedCount < 5 || score.durationMs < 1000) problem = "Session too short";
    else if (score.durationMs > Number(session.elapsed_ms) + 3000) problem = "Duration does not match the session time";
    else if (score.netWpm > MAX_WPM || score.grossWpm > MAX_WPM) problem = "Implausible speed";

    if (problem) {
      // Rejected: nothing is saved except the rejected status
      await client.query("UPDATE sessions SET status = 'rejected' WHERE id = $1", [sessionId]);
      await client.query("COMMIT");
      return res.status(400).json({ error: `Submission rejected: ${problem}` });
    }

    const settingsResult = await client.query(
      "SELECT key, value FROM settings WHERE key IN ('accuracy_gate', 'mastery_accuracy', 'mastery_sessions')"
    );
    const settings = {};
    for (const row of settingsResult.rows) settings[row.key] = Number(row.value);
    const accuracyGate = settings.accuracy_gate ?? 90;

    const netWpm = round2(score.netWpm);
    const grossWpm = round2(score.grossWpm);
    const accuracy = round2(score.accuracy);
    const passed = accuracy >= accuracyGate;
    const xpEarned = score.finalCorrect;

    // Save the keystroke log
    await client.query(
      `INSERT INTO keystrokes (session_id, seq, expected_char, typed_char, is_correct, t_ms)
       SELECT $1, * FROM unnest($2::int[], $3::text[], $4::text[], $5::boolean[], $6::numeric[])`,
      [
        sessionId,
        score.entries.map((e) => e.seq),
        score.entries.map((e) => e.expected),
        score.entries.map((e) => e.typed),
        score.entries.map((e) => e.correct),
        score.entries.map((e) => e.t),
      ]
    );

    await client.query(
      `UPDATE sessions
       SET status = 'completed', duration_ms = $2, gross_wpm = $3, net_wpm = $4,
           accuracy = $5, xp_earned = $6, completed_at = NOW()
       WHERE id = $1`,
      [sessionId, Math.round(score.durationMs), grossWpm, netWpm, accuracy, xpEarned]
    );

    const before = await client.query("SELECT level FROM users WHERE id = $1", [req.user.id]);
    const after = await client.query(
      `UPDATE users
       SET xp = xp + $1, level = ((xp + $1) / $2) + 1
       WHERE id = $3 RETURNING xp, level`,
      [xpEarned, XP_PER_LEVEL, req.user.id]
    );

    const streak = await updateStreak(client, req.user.id);

    const keyChanges = await updateKeyProgress(client, req.user.id, score.keyStats, {
      masteryAccuracy: settings.mastery_accuracy ?? 95,
      masterySessions: settings.mastery_sessions ?? 3,
    });

    await client.query("COMMIT");

    const problemKeys = Object.entries(score.keyStats)
      .map(([key, s]) => ({
        key,
        errors: s.errors,
        attempts: s.attempts,
        avg_ms: s.timed ? Math.round(s.totalMs / s.timed) : null,
      }))
      .filter((k) => k.errors > 0)
      .sort((a, b) => b.errors - a.errors || (b.avg_ms || 0) - (a.avg_ms || 0))
      .slice(0, 5);

    res.json({
    net_wpm: netWpm,
    gross_wpm: grossWpm,
    accuracy,
    passed,
    xp_earned: xpEarned,
    xp: after.rows[0].xp,
    level: after.rows[0].level,
    leveled_up: after.rows[0].level > before.rows[0].level,
    problem_keys: problemKeys,
    mastered_keys: keyChanges.mastered,
    unlocked_keys: keyChanges.unlocked,
    streak,
});

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

module.exports = router;