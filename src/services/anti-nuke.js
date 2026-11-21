const { PermissionFlagsBits, ChannelType } = require("discord.js");
const { log } = require("../utils/logger");
const settings = require("./guild-settings");
const windows = new Map();
const DESTRUCTIVE = new Set(["ChannelDelete","RoleDelete","MemberBanAdd","MemberKick","WebhookDelete"]);
async function record(entry, guild) {
  const cfg = settings.get(guild.id);
  if (!cfg.antiNukeEnabled || !DESTRUCTIVE.has(entry.action)) return;
  const actor = entry.executorId;
  if (!actor || actor === guild.ownerId || (cfg.trustedAdminIds || []).includes(actor)) return;
  const key = guild.id + ":" + actor, now = Date.now();
  const events = (windows.get(key) || []).filter(x => now - x < (cfg.antiNukeWindowMs || 15000));
  events.push(now); windows.set(key, events);
  await log(guild, "Anti-nuke activity detected", `Actor: <@${actor}>\nAction: ${entry.action}\nCount: ${events.length}`, 0xdc2626);
  const threshold = cfg.antiNukeThreshold || 4;
  if (events.length < threshold) return;
  windows.delete(key);
  const owner = await guild.fetchOwner().catch(() => null);
  if (owner) await owner.send(`🚨 NexGuard detected ${events.length} destructive actions by <@${actor}> in **${guild.name}**. Automatic containment: ${cfg.autoLockdown ? "enabled" : "disabled"}.`).catch(() => {});
  if (!cfg.autoLockdown) return;
  // Conservative containment: pause @everyone message sending in ordinary text channels.
  // Does not punish/remove a person based on uncertain audit attribution.
  for (const channel of guild.channels.cache.values()) {
    if (![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type)) continue;
    await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false }, { reason: "NexGuard configured anti-nuke containment" }).catch(() => {});
  }
  await log(guild, "Emergency lockdown applied", "NexGuard disabled @everyone message sending in text and announcement channels. Review /security lockdown disable after investigating.", 0x991b1b);
}
module.exports = { record };
