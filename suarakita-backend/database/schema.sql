PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 100),
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'warga' CHECK (role IN ('warga', 'admin')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 5 AND 150),
  description TEXT NOT NULL CHECK (length(trim(description)) BETWEEN 10 AND 5000),
  location_name TEXT NOT NULL CHECK (length(trim(location_name)) BETWEEN 3 AND 300),
  latitude REAL CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  longitude REAL CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
  urgency TEXT NOT NULL DEFAULT 'sedang' CHECK (urgency IN ('rendah', 'sedang', 'tinggi', 'kritis')),
  status TEXT NOT NULL DEFAULT 'diajukan' CHECK (status IN ('diajukan', 'diverifikasi', 'diproses', 'selesai', 'ditolak')),
  photo_path TEXT NOT NULL,
  priority_score REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS report_supports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (report_id, user_id)
);

CREATE TABLE IF NOT EXISTS report_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  changed_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  old_status TEXT CHECK (old_status IS NULL OR old_status IN ('diajukan', 'diverifikasi', 'diproses', 'selesai', 'ditolak')),
  new_status TEXT NOT NULL CHECK (new_status IN ('diajukan', 'diverifikasi', 'diproses', 'selesai', 'ditolak')),
  note TEXT,
  changed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category_id);
CREATE INDEX IF NOT EXISTS idx_reports_urgency ON reports(urgency);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON reports(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_supports_report ON report_supports(report_id);
CREATE INDEX IF NOT EXISTS idx_history_report ON report_status_history(report_id, changed_at DESC);
