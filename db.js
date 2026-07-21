// db.js
// Sets up a local SQLite database file (data/dental.db).
// The UNIQUE(date, time) constraint is the real safety net against
// double-booking: even if two requests hit the server at the exact
// same millisecond, SQLite itself will reject the second insert.

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'dental.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    treatment TEXT,
    date TEXT NOT NULL,          -- 'YYYY-MM-DD'
    time TEXT NOT NULL,          -- 'HH:MM' 24-hour, 30-min increments
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed | cancelled
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(date, time, status)
  );
`);

// NOTE on the UNIQUE constraint:
// UNIQUE(date, time, status) alone would still technically allow a
// cancelled row and a confirmed row to coexist at the same slot -
// which is exactly what we want (a cancelled slot frees the time up).
// The application layer additionally double-checks for an existing
// *confirmed* row before insert (see routes/appointments.js) so the
// error message returned to the user is friendly rather than a raw
// SQLite constraint error.

module.exports = db;
