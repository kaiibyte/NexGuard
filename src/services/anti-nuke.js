const { AuditLogEvent, ChannelType, PermissionFlagsBits } = require("discord.js");
const { log } = require("../utils/logger");
const settings = require("./guild-settings");

const activity = new Map();
const handled = new Map();
const WINDOW_MS = 15000;
const INCIDENT_COOLDOWN_MS = 60000;

const DESTRUCTIVE = new Map([
  [AuditLogEvent.ChannelDelete, "Channel deleted"],
  [AuditLogEvent.RoleDelete, "Role deleted"],
  [AuditLogEvent.MemberBanAdd, "Member banned"],
  [AuditLogEvent.MemberKick, "Member kicked"],
  [AuditLogEvent.WebhookDelete, "Webhook deleted"],
  [AuditLogEvent.ChannelOverwriteDelete, "Channel permission overwrite deleted"]
]);

async function record(entry, guild) {
  const cfg = settings.get(guild.id);
  if (!cfg.antiNukeEnabled || !DESTRUCTIVE.has(entry.action)) return;

  const actorId = entry.executorId || entry.executor?.id;
  if (!actorId || actorId === guild.ownerId) return;
  if ((cfg.trustedAdminIds || []).includes(actorId)) return;

  const now = Date.now();
  const key = `${guild.id}:${actorId}`;
  const previous = activity.get(key) || [];
  const recent = previous.filter(item => now - item.time <= (cfg.antiNukeWindowMs || WINDOW_MS));
  if (recent.some(item => item.id === entry.id)) return;

  recent.push({ id: entry.id, time: now, action: DESTRUCTIVE.get(entry.action), targetId: entry.targetId || null });
  activity.set(key, recent);

  const threshold = cfg.antiNukeThreshold || 4;
  if (recent.length < threshold) return;
  if (handled.has(key) && now - handled.get(key) < INCIDENT_COOLDOWN_MS) return;
  handled.set(key, now);
  activity.delete(key);

  const member = await guild.members.fetch(actorId).catch(() => null);
  const botMember = guild.members.me || await guild.members.fetchMe().catch(() => null);
  const isAdmin = Boolean(member && (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.permissions.has(PermissionFlagsBits.ManageGuild) ||
    member.permissions.has(PermissionFlagsBits.ManageChannels) ||
    member.permissions.has(PermissionFlagsBits.ManageRoles)
  ));

  let banStatus = "Not attempted — actor is not a current administrator or could not be fetched.";
  if (isAdmin) {
    if (!botMember?.permissions.has(PermissionFlagsBits.BanMembers)) {
      banStatus = "Failed — NexGuard needs the Ban Members permission.";
    } else if (!member.bannable) {
      banStatus = "Failed — the actor is above/equal to NexGuard's highest role, or cannot be banned.";
    } else {
      try {
        await guild.members.ban(actorId, {
          reason: `NexGuard anti-nuke: ${recent.length} destructive actions within ${Math.round((cfg.antiNukeWindowMs || WINDOW_MS) / 1000)} seconds.`
        });
        banStatus = "Successfully banned the responsible administrator.";
      } catch (error) {
        banStatus = `Failed — ${error.message}`;
      }
    }
  }

  let locked = 0;
  let lockFailed = 0;
  let lockStatus = cfg.autoLockdown ? "Attempted" : "Disabled";
  if (cfg.autoLockdown) {
    const channels = await guild.channels.fetch().catch(() => guild.channels.cache);
    for (const channel of channels.values()) {
      if (![ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum].includes(channel.type)) continue;
      const permissions = channel.permissionsFor(botMember);
      if (!permissions?.has(PermissionFlagsBits.ManageRoles)) {
        lockFailed++;
        continue;
      }
      try {
        await channel.permissionOverwrites.edit(
          guild.roles.everyone,
          { SendMessages: false },
          { reason: "NexGuard anti-nuke emergency lockdown" }
        );
        locked++;
      } catch {
        lockFailed++;
      }
    }
    lockStatus = `Locked ${locked} text channels; ${lockFailed} failed.`;
  }

  const actions = recent.map((item, index) =>
    `${index + 1}. ${item.action}${item.targetId ? ` (target: ${item.targetId})` : ""}`
  ).join("\n");

  await log(
    guild,
    "🚨 NexGuard Anti-Nuke Incident",
    [
      `**Responsible administrator:** <@! ${actorId}>`,
      `**Actions detected:** ${recent.length} in ${Math.round((cfg.antiNukeWindowMs || WINDOW_MS) / 1000)} seconds (threshold: ${threshold})`,
      "",
      "**Detected actions**",
      actions,
      "",
      `**Automatic ban:** ${banStatus}`,
      `**Emergency lockdown:** ${lockStatus}`,
      "",
      "Review the Discord audit log. Deleted channels and roles cannot be recreated automatically by this action."
    ].join("\n"),
    0xdc2626
  );

  const owner = await guild.fetchOwner().catch(() => null);
  if (owner) {
    await owner.send(
      `🚨 NexGuard detected a destructive-action incident in **${guild.name}** involving <@!${actorId}>. Ban: ${banStatus} Lockdown: ${lockStatus} Check the security log for the incident report.`
    ).catch(() => {});
  }
}

module.exports = { record };
