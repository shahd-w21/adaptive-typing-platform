const express = require("express");
const pool = require("../db");
const { verifyToken } = require("../middleware/auth");
const { ensureKeyProgress } = require("../services/keyProgress");
const { recommendNext } = require("../utils/recommend");

const router = express.Router();
const round2 = (n) => Math.round(n * 100) / 100;

async function loadKeys(userId) {
  const result = await pool.query(
    `SELECT key_char, status, accuracy, avg_ms, attempts, good_sessions
     FROM key_progress WHERE user_id = $1 ORDER BY key_char`,
    [userId]
  );
  return result.rows;
}

// KEYBOARD MAP: every key with its status, plus the key groups
router.get("/keyboard", verifyToken, async (req, res) => {
  try {
    await ensureKeyProgress(pool, req.user.id);
    const keys = await loadKeys(req.user.id);
    const groups = await pool.query(
      `SELECT id, name, keys, prerequisite_group_id
       FROM key_groups WHERE is_active ORDER BY id`
    );
    res.json({ groups: groups.rows, keys });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DASHBOARD: level, XP, streak, daily goal, recommendation, recent sessions
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    await ensureKeyProgress(pool, req.user.id);

    const userResult = await pool.query(
      `SELECT name, email, xp, level, daily_goal_minutes, timezone, placement_done,
              CASE WHEN last_practice_date >= (NOW() AT TIME ZONE timezone)::date - 1
                   THEN streak ELSE 0 END AS streak
       FROM users WHERE id = $1 AND is_active = TRUE`,
      [req.user.id]
    );
    const user = userResult.rows[0];
    if (!user) return res.status(401).json({ error: "Not logged in" });

    const keys = await loadKeys(req.user.id);

    const today = await pool.query(
      `SELECT COALESCE(SUM(duration_ms), 0) / 60000.0 AS minutes
       FROM sessions
       WHERE user_id = $1 AND status = 'completed'
         AND completed_at >= date_trunc('day', NOW() AT TIME ZONE $2::text) AT TIME ZONE $2::text`,
      [req.user.id, user.timezone]
    );

    const recent = await pool.query(
      `SELECT id, mode, net_wpm, accuracy, xp_earned, completed_at
       FROM sessions WHERE user_id = $1 AND status = 'completed'
       ORDER BY completed_at DESC LIMIT 5`,
      [req.user.id]
    );
    const count = await pool.query(
      "SELECT COUNT(*)::int AS n FROM sessions WHERE user_id = $1 AND status = 'completed'",
      [req.user.id]
    );

    const minutesToday = round2(Number(today.rows[0].minutes));

    res.json({
      user: { name: user.name, email: user.email, level: user.level, xp: user.xp },
      streak: user.streak,
      daily_goal: {
        goal_minutes: user.daily_goal_minutes,
        minutes_today: minutesToday,
        done: minutesToday >= user.daily_goal_minutes,
      },
      recommendation: recommendNext({
        placementDone: user.placement_done,
        completedSessions: count.rows[0].n,
        keys,
      }),
      recent_sessions: recent.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PROGRESS: history for the charts, and per-key data for the heat map (SYS-33)
router.get("/progress", verifyToken, async (req, res) => {
  try {
    const sessions = await pool.query(
      `SELECT id, mode, net_wpm, gross_wpm, accuracy, duration_ms, xp_earned, completed_at
       FROM sessions WHERE user_id = $1 AND status = 'completed'
       ORDER BY completed_at DESC LIMIT 100`,
      [req.user.id]
    );
    const keys = await loadKeys(req.user.id);
    res.json({ sessions: sessions.rows, keys });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;