const jwt = require("jsonwebtoken");
const pool = require("../db");

async function verifyToken(req, res, next) {
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Not logged in" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  try {
    const result = await pool.query(
      "SELECT id, role, is_active FROM users WHERE id = $1",
      [payload.id]
    );
    const user = result.rows[0];
    if (!user || !user.is_active) {
      res.clearCookie("token");
      return res.status(401).json({ error: "Not logged in" });
    }
    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admins only" });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };