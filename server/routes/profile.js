const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const { verifyToken } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");
const { passwordError } = require("../utils/validation");

const router = express.Router();

const PROFILE_COLUMNS =
  "name, email, timezone, target_wpm, daily_goal_minutes, large_text, reduced_pressure";

const isInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;

// GET the profile and settings
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${PROFILE_COLUMNS} FROM users WHERE id = $1`,
      [req.user.id]
    );
    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE settings. Only these fields are accepted; anything else is ignored.
router.patch("/", verifyToken, async (req, res) => {
  const body = req.body || {};
  const updates = {};

  try {
    if ("name" in body) {
      if (body.name !== null && typeof body.name !== "string") {
        return res.status(400).json({ error: "Invalid name" });
      }
      const name = body.name === null ? null : body.name.trim();
      if (name && name.length > 100) {
        return res.status(400).json({ error: "Name is too long" });
      }
      updates.name = name || null;
    }

    if ("timezone" in body) {
      const tz = typeof body.timezone === "string"
        ? await pool.query("SELECT 1 FROM pg_timezone_names WHERE name = $1", [body.timezone])
        : { rows: [] };
      if (tz.rows.length === 0) {
        return res.status(400).json({ error: "Unknown timezone" });
      }
      updates.timezone = body.timezone;
    }

    if ("target_wpm" in body) {
      if (!isInt(body.target_wpm, 10, 250)) {
        return res.status(400).json({ error: "target_wpm must be between 10 and 250" });
      }
      updates.target_wpm = body.target_wpm;
    }

    if ("daily_goal_minutes" in body) {
      if (!isInt(body.daily_goal_minutes, 1, 240)) {
        return res.status(400).json({ error: "daily_goal_minutes must be between 1 and 240" });
      }
      updates.daily_goal_minutes = body.daily_goal_minutes;
    }

    for (const flag of ["large_text", "reduced_pressure"]) {
      if (flag in body) {
        if (typeof body[flag] !== "boolean") {
          return res.status(400).json({ error: `${flag} must be true or false` });
        }
        updates[flag] = body[flag];
      }
    }

    const fields = Object.keys(updates); // fixed list above, never user input
    if (fields.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const result = await pool.query(
      `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1}
       RETURNING ${PROFILE_COLUMNS}`,
      [...fields.map((f) => updates[f]), req.user.id]
    );
    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// CHANGE PASSWORD
router.post("/password", authLimiter, verifyToken, async (req, res) => {
  const { current_password, new_password, confirm_password } = req.body || {};

  try {
    const result = await pool.query("SELECT password_hash FROM users WHERE id = $1", [req.user.id]);
    const hash = result.rows[0].password_hash;

    if (!current_password || !(await bcrypt.compare(current_password, hash))) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    const pwError = passwordError(new_password);
    if (pwError) return res.status(400).json({ error: pwError });
    if (new_password !== confirm_password) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, req.user.id]);
    res.json({ message: "Password updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE the account and all personal data (SYS-9)
router.delete("/", authLimiter, verifyToken, async (req, res) => {
  const { password } = req.body || {};

  try {
    const result = await pool.query(
      "SELECT password_hash, role FROM users WHERE id = $1",
      [req.user.id]
    );
    const user = result.rows[0];

    if (!password || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(400).json({ error: "Password is incorrect" });
    }

    if (user.role === "admin") {
      const others = await pool.query(
        "SELECT COUNT(*)::int AS n FROM users WHERE role = 'admin' AND is_active AND id <> $1",
        [req.user.id]
      );
      if (others.rows[0].n === 0) {
        return res.status(400).json({ error: "You are the only admin. Create another admin first." });
      }
    }

    // Sessions, keystrokes, key progress, badges, certificates and forum
    // posts are removed automatically (ON DELETE CASCADE)
    await pool.query("DELETE FROM users WHERE id = $1", [req.user.id]);
    res.clearCookie("token");
    res.json({ message: "Account and personal data deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;