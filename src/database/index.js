const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");
const config = require("../config");

const directory = path.dirname(config.databasePath);
fs.mkdirSync(directory, { recursive: true });
const db = new Database(config.databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS warnings_lookup ON warnings(guild_id, user_id);
`);

const insertWarning = db.prepare(
  "INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)"
);
const getWarnings = db.prepare(
  "SELECT id, moderator_id, reason, created_at FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY id DESC"
);
const clearWarnings = db.prepare("DELETE FROM warnings WHERE guild_id = ? AND user_id = ?");

module.exports = {
  addWarning(guildId, userId, moderatorId, reason) {
    return insertWarning.run(guildId, userId, moderatorId, reason).lastInsertRowid;
  },
  getWarnings(guildId, userId) {
    return getWarnings.all(guildId, userId);
  },
  clearWarnings(guildId, userId) {
    return clearWarnings.run(guildId, userId).changes;
  },
  close() {
    db.close();
  }
};
