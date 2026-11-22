const { AuditLogEvent, ChannelType, PermissionFlagsBits } = require("discord.js");
const { log } = require("../utils/logger");
const settings = require("./guild-settings");

const windows = new Map();
const DESTRUCTIVE = new Set([
  AuditLogEvent.ChannelDelete,
  AuditLogEvent.RoleDelete,
  AuditLogEvent.MemberBanAdd,
  AuditLogEvent.MemberKick,
  AuditLogEvent.WebhookDelete,
  AuditLogEvent.ChannelOverwriteDelete,
  AuditLogEvent.RoleUpdate,
  AuditLogEvent.ChannelUpdate
]);

async function record(entry, guild) {
  const cfg = settings.get(guild.id);
  if (!cfg.antiNukeEnabled || !DESTRUCTIVE.has(entry.action)) return;

  // Audit-log attribution may be exposed through either property.
  const actor = entry.executorId || entry.executor?.id;
  if (!actor || (cfg.trustedAdminIds || []).includes(actor)) return;

  // Do not exempt the server owner from detection. The owner cannot be
  // stripped of ownership or blocked by channel overwrites, but their
  // destructive actions should still trigger an alert and containment.
  const key = guild.id + ":" + actor;
  const now = Date.now();
  const windowMs = cfg.antiNukeWindowMs || 15000;
  const events = (windows.get(key) || []).filter(time => now - time < windowMs);
  events.push(now);
  windows.set(key, events);

  await log(
    guild,
    "Anti-nuke activity detected",
    `Actor: <@${actor}>${actor === guild.ownerId ? " (server owner)" : ""}
Action code: ${entry.action}
Count in window: ${events.length}/${cfg.antiNukeThreshold || 4}`,
    0xdc2626
  );

  if (events.length < (cfg.antiNukeThreshold || 4)) return;
  windows.delete(key);

  const owner = await guild.fetchOwner().catch(() => null);
  if (owner) {
    const ownerNote = actor === guild.ownerId
      ? "The actions were performed by the server owner. Discord does not allow the bot to override the owner's administrator access."
      : "Review the audit log and the actor's permissions before deciding on staff action.";
    await owner.send(
      `🚨 NexGuard detected ${events.length} destructive/security-sensitive actions by <@${actor}> in **${guild.name}**. Automatic lockdown: ${cfg.autoLockdown ? "enabled" : "disabled"}. ${ownerNote}`
    ).catch(() => {});
  }

  if (!cfg.autoLockdown) {
    await log(guild, "Anti-nuke alert — no lockdown", "The threshold was reached, but automatic lockdown is disabled. Enable it in the security settings if you want automatic containment.", 0xf59e0b);
    return;
  }

  const channels = await guild.channels.fetch().catch(() => guild.channels.cache);
  let locked = 0;
  let failed = 0;
  let skipped = 0;
  let firstError = "";

  for (const channel of channels.values()) {
    if (![ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum].includes(channel.type)) {
      skipped++;
      continue;
    }

    const botPermissions = channel.permissionsFor(guild.members.me);
    if (!botPermissions?.has(PermissionFlagsBits.ManageChannels)) {
      failed++;
      firstError ||= "Bot is missing Manage Channels in one or more channels.";
      continue;
    }

    try {
      await channel.permissionOverwrites.edit(
        guild.roles.everyone,
        { SendMessages: false },
        { reason: "NexGuard anti-nuke emergency containment" }
      );
      locked++;
    } catch (error) {
      failed++;
      firstError ||= error.message;
    }
  }

  const ownerWarning = actor === guild.ownerId
    ? "\nNote: The server owner can bypass @everyone channel restrictions."
    : "";
  const noChannels = locked === 0 && failed === 0
    ? "\nNo eligible text channels remained to lock. Restore the server structure from a backup."
    : "";

  await log(
    guild,
    "Emergency lockdown result",
    `Actor: <@${actor}>
Channels locked: ${locked}
Failed: ${failed}
Other channel types skipped: ${skipped}
${firstError ? "First error: " + firstError : "No permission errors reported."}${ownerWarning}${noChannels}
Run /security unlockdown only after investigating.`,
    locked > 0 ? 0x991b1b : 0xdc2626
  );
}

module.exports = { record };