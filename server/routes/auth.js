const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { verifyToken } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");
const { generateToken, hashToken } = require("../utils/tokens");
const { sendMail } = require("../utils/mailer");
const { EMAIL_REGEX, passwordError } = require("../utils/validation");


const router = express.Router();


async function sendVerificationEmail(userId, email) {
  const token = generateToken();
  await pool.query(
    `UPDATE users
     SET verification_token_hash = $1,
         verification_expires = NOW() + INTERVAL '24 hours'
     WHERE id = $2`,
    [hashToken(token), userId]
  );
  await sendMail({
    to: email,
    subject: "Verify your TypeFlow email",
    text: `Verify your email (valid for 24 hours):\n${process.env.CLIENT_URL}/verify-email?token=${token}`,
  });
}

// SIGNUP: always creates a student (any role in the request is ignored)
router.post("/signup", authLimiter, async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const { password, confirmPassword } = req.body;

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  const pwError = passwordError(password);
  if (pwError) return res.status(400).json({ error: pwError });
  if (confirmPassword !== undefined && confirmPassword !== password) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
      [email, password_hash]
    );

    await sendVerificationEmail(result.rows[0].id, email);
    res.status(201).json({ message: "Check your email to verify your account" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// VERIFY EMAIL
router.post("/verify-email", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Invalid or expired link" });

  try {
    const result = await pool.query(
      `UPDATE users
       SET is_verified = TRUE, verification_token_hash = NULL, verification_expires = NULL
       WHERE verification_token_hash = $1 AND verification_expires > NOW()
       RETURNING id`,
      [hashToken(token)]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired link" });
    }
    res.json({ message: "Email verified. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// RESEND VERIFICATION EMAIL (same answer whether or not the account exists)
router.post("/resend-verification", authLimiter, async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  try {
    const result = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND is_verified = FALSE",
      [email]
    );
    if (result.rows.length > 0) {
      await sendVerificationEmail(result.rows[0].id, email);
    }
    res.json({ message: "If the account exists, a new email was sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN: sets an httpOnly cookie
router.post("/login", authLimiter, async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const { password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !password || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: "This account is deactivated" });
    }
    if (!user.is_verified) {
      return res.status(403).json({
        error: "Please verify your email first",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// CURRENT USER (the website calls this to know who is logged in)
router.get("/me", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name, role, xp, level, streak FROM users WHERE id = $1 AND is_active = TRUE",
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: "Not logged in" });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// FORGOT PASSWORD (same answer whether or not the account exists)
router.post("/forgot-password", authLimiter, async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  try {
    const result = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      const token = generateToken();
      await pool.query(
        `UPDATE users
         SET reset_token_hash = $1, reset_expires = NOW() + INTERVAL '1 hour'
         WHERE id = $2`,
        [hashToken(token), result.rows[0].id]
      );
      await sendMail({
        to: email,
        subject: "Reset your TypeFlow password",
        text: `Reset your password (valid for 1 hour, one use):\n${process.env.CLIENT_URL}/reset-password?token=${token}`,
      });
    }
    res.json({ message: "If the account exists, a reset email was sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// RESET PASSWORD (single-use link)
router.post("/reset-password", authLimiter, async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  const pwError = passwordError(password);
  if (pwError) return res.status(400).json({ error: pwError });
  if (confirmPassword !== undefined && confirmPassword !== password) {
    return res.status(400).json({ error: "Passwords do not match" });
  }
  if (!token) return res.status(400).json({ error: "Invalid or expired link" });

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1, reset_token_hash = NULL, reset_expires = NULL
       WHERE reset_token_hash = $2 AND reset_expires > NOW()
       RETURNING id`,
      [password_hash, hashToken(token)]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired link" });
    }
    res.json({ message: "Password updated. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;