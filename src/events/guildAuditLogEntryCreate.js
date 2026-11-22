const { record } = require("../services/anti-nuke");

module.exports = {
  name: "guildAuditLogEntryCreate",
  async execute(entry, guild) {
    try {
      await record(entry, guild);
    } catch (error) {
      console.error("NexGuard anti-nuke handler failed:", error);
    }
  }
};
