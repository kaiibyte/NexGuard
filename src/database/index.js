const fs=require("node:fs");const path=require("node:path");const Database=require("better-sqlite3");const config=require("../config");
const directory=path.dirname(config.databasePath);fs.mkdirSync(directory,{recursive:true});const db=new Database(config.databasePath);db.pragma("journal_mode = WAL");db.pragma("foreign_keys = ON");
db.exec(`
CREATE TABLE IF NOT EXISTS warnings(id INTEGER PRIMARY KEY AUTOINCREMENT,guild_id TEXT NOT NULL,user_id TEXT NOT NULL,moderator_id TEXT NOT NULL,reason TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS warnings_lookup ON warnings(guild_id,user_id);
CREATE TABLE IF NOT EXISTS guild_settings(guild_id TEXT PRIMARY KEY,settings_json TEXT NOT NULL,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS backups(id INTEGER PRIMARY KEY AUTOINCREMENT,guild_id TEXT NOT NULL,snapshot_json TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS backups_lookup ON backups(guild_id,id DESC);
CREATE TABLE IF NOT EXISTS premium(guild_id TEXT PRIMARY KEY,granted_by TEXT NOT NULL,expires_at TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS incidents(id INTEGER PRIMARY KEY AUTOINCREMENT,guild_id TEXT NOT NULL,actor_id TEXT,action TEXT NOT NULL,details TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS owner_settings(key TEXT PRIMARY KEY,value TEXT NOT NULL,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS owner_blacklist(kind TEXT NOT NULL,target_id TEXT NOT NULL,reason TEXT NOT NULL,created_by TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(kind,target_id));
CREATE TABLE IF NOT EXISTS owner_audit(id INTEGER PRIMARY KEY AUTOINCREMENT,owner_id TEXT NOT NULL,action TEXT NOT NULL,target_id TEXT,details TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
`);
const insertWarning=db.prepare("INSERT INTO warnings(guild_id,user_id,moderator_id,reason) VALUES(?,?,?,?)");
const getWarnings=db.prepare("SELECT id,moderator_id,reason,created_at FROM warnings WHERE guild_id=? AND user_id=? ORDER BY id DESC");
const clearWarnings=db.prepare("DELETE FROM warnings WHERE guild_id=? AND user_id=?");
const getSettings=db.prepare("SELECT settings_json FROM guild_settings WHERE guild_id=?");
const putSettings=db.prepare("INSERT INTO guild_settings(guild_id,settings_json,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(guild_id) DO UPDATE SET settings_json=excluded.settings_json,updated_at=CURRENT_TIMESTAMP");
const insertBackup=db.prepare("INSERT INTO backups(guild_id,snapshot_json) VALUES(?,?)");
const listBackup=db.prepare("SELECT id,created_at FROM backups WHERE guild_id=? ORDER BY id DESC LIMIT 10");
const getBackupStmt=db.prepare("SELECT id,snapshot_json,created_at FROM backups WHERE guild_id=? AND id=?");
const getOwnerSettingStmt=db.prepare("SELECT value FROM owner_settings WHERE key=?");
module.exports={
 addWarning(g,u,m,r){return insertWarning.run(g,u,m,r).lastInsertRowid;},getWarnings(g,u){return getWarnings.all(g,u);},clearWarnings(g,u){return clearWarnings.run(g,u).changes;},
 getGuildSettings(g){const row=getSettings.get(g);if(!row)return null;try{return JSON.parse(row.settings_json);}catch{return null;}},
 setGuildSettings(g,s){putSettings.run(g,JSON.stringify(s));},
 saveBackup(g,s){return insertBackup.run(g,JSON.stringify(s)).lastInsertRowid;},listBackups(g){return listBackup.all(g);},getBackup(g,id){return getBackupStmt.get(g,id)||null;},
 grantPremium(g,by,expiresAt=null){db.prepare("INSERT INTO premium(guild_id,granted_by,expires_at) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET granted_by=excluded.granted_by,expires_at=excluded.expires_at").run(g,by,expiresAt);},
 revokePremium(g){return db.prepare("DELETE FROM premium WHERE guild_id=?").run(g).changes;},
 hasPremium(g){const row=db.prepare("SELECT expires_at FROM premium WHERE guild_id=?").get(g);return !!row&&(!row.expires_at||Date.parse(row.expires_at)>Date.now());},
 getOwnerSetting(k){return getOwnerSettingStmt.get(k)?.value??null;},setOwnerSetting(k,v){db.prepare("INSERT INTO owner_settings(key,value,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP").run(k,String(v));},
 addBlacklist(k,id,reason,by){db.prepare("INSERT INTO owner_blacklist(kind,target_id,reason,created_by) VALUES(?,?,?,?) ON CONFLICT(kind,target_id) DO UPDATE SET reason=excluded.reason,created_by=excluded.created_by").run(k,id,reason,by);},removeBlacklist(k,id){return db.prepare("DELETE FROM owner_blacklist WHERE kind=? AND target_id=?").run(k,id).changes;},getBlacklist(k,id){return db.prepare("SELECT reason FROM owner_blacklist WHERE kind=? AND target_id=?").get(k,id)||null;},
 addOwnerAudit(owner,action,target=null,details=null){db.prepare("INSERT INTO owner_audit(owner_id,action,target_id,details) VALUES(?,?,?,?)").run(owner,action,target,details);},getOwnerAudit(limit=20){return db.prepare("SELECT owner_id,action,target_id,details,created_at FROM owner_audit ORDER BY id DESC LIMIT ?").all(limit);},
 close(){db.close();}
};