DROP TABLE IF EXISTS
  forum_reports, forum_posts, forum_threads,
  user_badges, badges, certificates,
  keystrokes, sessions, key_progress, key_groups,
  audit_log, settings, words, themes, blocked_words,
  attempts, progress, levels, courses,
  users
CASCADE;

-- USERS ----------------------------------------------------------
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'admin')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  verification_token_hash VARCHAR(255),
  verification_expires TIMESTAMP,
  reset_token_hash VARCHAR(255),
  reset_expires TIMESTAMP,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  target_wpm INT DEFAULT 40,
  daily_goal_minutes INT DEFAULT 10,
  large_text BOOLEAN DEFAULT FALSE,
  reduced_pressure BOOLEAN DEFAULT FALSE,
  placement_done BOOLEAN DEFAULT FALSE,
  xp INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  streak INT NOT NULL DEFAULT 0,
  last_practice_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- KEYBOARD: key groups and per-user key mastery -------------------
CREATE TABLE key_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  keys VARCHAR(60) NOT NULL,                 -- e.g. 'asdfjkl;'
  prerequisite_group_id INT REFERENCES key_groups(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE key_progress (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_char VARCHAR(1) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'locked'
    CHECK (status IN ('locked', 'in_progress', 'mastered')),
  baseline_ms NUMERIC(8,2),                  -- from the placement test
  avg_ms NUMERIC(8,2),                       -- average time to press the key
  accuracy NUMERIC(5,2),
  attempts INT NOT NULL DEFAULT 0,
  review_stage INT NOT NULL DEFAULT 0,       -- spaced review stage
  CREATE TABLE key_progress (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_char VARCHAR(1) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'locked'
    CHECK (status IN ('locked', 'in_progress', 'mastered')),
  baseline_ms NUMERIC(8,2),                  -- from the placement test
  avg_ms NUMERIC(8,2),                       -- average time to press the key
  accuracy NUMERIC(5,2),
  attempts INT NOT NULL DEFAULT 0,
  review_stage INT NOT NULL DEFAULT 0,       -- spaced review stage
  good_sessions INT NOT NULL DEFAULT 0,      -- good sessions in a row
  next_review_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, key_char)
);
  next_review_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, key_char)
);

-- SESSIONS AND KEYSTROKE LOG (the server computes all scores) -----
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode VARCHAR(20) NOT NULL
    CHECK (mode IN ('placement', 'practice', 'timed', 'certified')),
  text_content TEXT NOT NULL,
  text_source VARCHAR(20) NOT NULL DEFAULT 'server'
    CHECK (text_source IN ('ai', 'fallback', 'cached', 'server')),
  theme VARCHAR(50),
  test_length_sec INT,                       -- 60, 180 or 300 for timed tests
  status VARCHAR(20) NOT NULL DEFAULT 'started'
    CHECK (status IN ('started', 'completed', 'rejected')),
  duration_ms INT,
  gross_wpm NUMERIC(6,2),
  net_wpm NUMERIC(6,2),
  accuracy NUMERIC(5,2),
  xp_earned INT NOT NULL DEFAULT 0,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);
CREATE INDEX idx_sessions_user ON sessions(user_id, started_at DESC);

CREATE TABLE keystrokes (
  id BIGSERIAL PRIMARY KEY,
  session_id INT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  seq INT NOT NULL,
  expected_char VARCHAR(10),
  typed_char VARCHAR(20) NOT NULL,           -- includes 'Backspace'
  is_correct BOOLEAN NOT NULL,
  t_ms NUMERIC(10,2) NOT NULL,               -- ms since the first keystroke
  UNIQUE (session_id, seq)
);

-- REWARDS ---------------------------------------------------------
CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE user_badges (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id INT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE certificates (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id INT REFERENCES sessions(id) ON DELETE SET NULL,
  code VARCHAR(40) UNIQUE NOT NULL,          -- public verification code
  net_wpm NUMERIC(6,2) NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  issued_at TIMESTAMP DEFAULT NOW()
);

-- FORUM -----------------------------------------------------------
CREATE TABLE forum_threads (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE forum_posts (
  id SERIAL PRIMARY KEY,
  thread_id INT NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
-- only one accepted answer per thread
CREATE UNIQUE INDEX one_accepted_per_thread
  ON forum_posts(thread_id) WHERE is_accepted;

CREATE TABLE forum_reports (
  id SERIAL PRIMARY KEY,
  post_id INT NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ADMIN: audit log, settings, content as data ----------------------
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  admin_id INT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id INT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE settings (
  key VARCHAR(100) PRIMARY KEY,
  value NUMERIC NOT NULL,
  description TEXT
);

CREATE TABLE themes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE words (
  id SERIAL PRIMARY KEY,
  word VARCHAR(50) UNIQUE NOT NULL,
  theme_id INT REFERENCES themes(id) ON DELETE SET NULL
);

CREATE TABLE blocked_words (
  word VARCHAR(50) PRIMARY KEY
);

-- STARTER DATA ----------------------------------------------------
-- Key groups (each unlocks when the previous group is mastered)
INSERT INTO key_groups (name, keys, prerequisite_group_id) VALUES
  ('Home row',    'asdfjkl;',    NULL),
  ('Index reach', 'gh',          1),
  ('Top row',     'qwertyuiop',  2),
  ('Bottom row',  'zxcvbnm,./',  3);

-- PLACEHOLDER thresholds: replace with the values from the SRS
INSERT INTO settings (key, value, description) VALUES
  ('accuracy_gate',            90, 'Minimum accuracy to pass a practice session'),
  ('mastery_accuracy',         95, 'Accuracy needed to master a key'),
  ('mastery_sessions',          3, 'Sessions above the threshold to master a key'),
  ('certificate_min_net_wpm',  40, 'Minimum net WPM for a certificate'),
  ('certificate_min_accuracy', 95, 'Minimum accuracy for a certificate');