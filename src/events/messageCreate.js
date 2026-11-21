const { PermissionFlagsBits } = require("discord.js");
const config = require("../config");
const { log } = require("../utils/logger");
const settings = require("../services/guild-settings");

const recent = new Map();

// Remove stale anti-spam entries so this map cannot grow forever.
const cleanupTimer = setInterval(() => {
  const cutoff = Date.now() - config.spam.windowMs;
  for (const [key, timestamps] of recent) {
    const fresh = timestamps.filter(timestamp => timestamp > cutoff);
    if (fresh.length) recent.set(key, fresh);
    else recent.delete(key);
  }
}, 10 * 60 * 1000);
cleanupTimer.unref?.();

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (!message.guild || message.author.bot || !message.member) return;

    const cfg = settings.get(message.guild.id);
    if (
      message.member.permissions.has(PermissionFlagsBits.ManageMessages) ||
      message.member.permissions.has(PermissionFlagsBits.Administrator) ||
      message.member.roles.cache.some(role => cfg.trustedRoleIds.includes(role.id))
    ) return;

    let reason = null;
    const content = message.content.toLowerCase();

    if (cfg.antiLink && (content.includes("http://") || content.includes("https://"))) {
      reason = "Links are disabled";
    } else if (
      cfg.antiInvite &&
      (content.includes("discord.gg/") || content.includes("discord.com/invite/") || content.includes("discordapp.com/invite/"))
    ) {
      reason = "Discord invites are disabled";
    } else if ((message.mentions.users.size + message.mentions.roles.size) > cfg.maxMentions) {
      reason = "Mention limit exceeded";
    } else if (cfg.badWords.some(word => word && content.includes(word))) {
      reason = "Blocked word detected";
    } else {
      const letters = message.content.replace(/[^a-z]/gi, "");
      if (
        letters.length >= 12 &&
        message.content.length &&
        letters.replace(/[^A-Z]/g, "").length / letters.length * 100 > cfg.maxCapsPercent
      ) {
        reason = "Excessive caps";
      }
    }

    if (reason) {
      await message.delete().catch(() => null);
      const reply = await message.channel.send({
        content: message.author + ", " + reason.toLowerCase() + "."
      }).catch(() => null);
      if (reply) setTimeout(() => reply.delete().catch(() => null), 5000);
      await log(message.guild, "Automod action", message.author.tag + ": " + reason, 0xdc2626);
      return;
    }

    const key = message.guild.id + ":" + message.author.id;
    const now = Date.now();
    const times = (recent.get(key) || []).filter(timestamp => now - timestamp < config.spam.windowMs);
    times.push(now);

    if (times.length < config.spam.maxMessages) {
      recent.set(key, times);
      return;
    }

    recent.delete(key);
    await message.member.timeout(
      config.spam.timeoutMinutes * 60000,
      "NexGuard anti-spam threshold exceeded"
    )
      .then(() => log(
        message.guild,
        "Anti-spam timeout",
        message.author.tag + " timed out for " + config.spam.timeoutMinutes + " minutes.",
        0xdc2626
      ))
      .catch(error => console.error("Anti-spam action failed:", error.message));
  }
};
