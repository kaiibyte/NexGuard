const { record } = require("../services/anti-nuke");

module.exports = {
  name: "guildAuditLogEntryCreate",
  async execute(entry, guild) {
    console.log("[Anti-Nuke] Audit log event received:", {
      guildId: guild?.id || null,
      action: entry?.action ?? null,
      actionName: entry?.actionName || null,
      executorId: entry?.executorId || entry?.executor?.id || null,
      targetId: entry?.targetId || null,
      entryId: entry?.id || null
    });

    try {
      await record(entry, guild);
    } catch (error) {
      console.error("[Anti-Nuke] Handler failed:", error);
    }
  }
};
