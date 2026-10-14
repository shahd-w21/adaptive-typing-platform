const express = require("express");
const cors = require("cors");
require("dotenv").config();

const cookieParser = require("cookie-parser");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
const pool = require("./db");

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ connected: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);


const { verifyToken, requireAdmin } = require("./middleware/auth");



app.get("/api/admin/ping", verifyToken, requireAdmin, (req, res) => {
  res.json({ message: "Welcome, admin" });
});

const sessionRoutes = require("./routes/sessions");
app.use("/api/sessions", sessionRoutes);

const studentRoutes = require("./routes/student");
app.use("/api", studentRoutes);

const profileRoutes = require("./routes/profile");
app.use("/api/profile", profileRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));