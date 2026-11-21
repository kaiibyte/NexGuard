const { capture } = require("./backup");
const db = require("../database");
const timers = new Map();
async function run(client) {
  for (const guild of client.guilds.cache.values()) {
    const cfg = require("./guild-settings").get(guild.id);
    if (!cfg.backupIntervalHours || !db.hasPremium(guild.id)) continue;
    const last = db.listBackups(guild.id)[0];
    const due = !last || Date.now() - Date.parse(last.created_at + "Z") >= cfg.backupIntervalHours * 3600000;
    if (due) await capture(guild).catch(error => console.error("Scheduled backup failed:", guild.id, error.message));
  }
}
function start(client) {
  if (timers.has("main")) return;
  const timer = setInterval(() => run(client).catch(console.error), 15 * 60 * 1000);
  timer.unref?.(); timers.set("main", timer);
  run(client).catch(console.error);
}
function stop() { for (const timer of timers.values()) clearInterval(timer); timers.clear(); }
module.exports = { start, stop };
