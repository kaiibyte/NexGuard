const { AuditLogEvent, ChannelType, PermissionFlagsBits } = require("discord.js");
const { log } = require("../utils/logger");
const settings = require("./guild-settings");
const db = require("../database");
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
 [AuditLogEvent.ChannelOverwriteDelete, "Channel permission overwrite deleted"],
 [AuditLogEvent.RoleUpdate, "Role permissions or settings changed"],
 [AuditLogEvent.ChannelUpdate, "Channel settings or permissions changed"],
 [AuditLogEvent.MemberRoleUpdate, "Member roles changed"],
 [AuditLogEvent.WebhookCreate, "Webhook created"],
 [AuditLogEvent.BotAdd, "Bot added to server"]
]);
async function record(entry, guild) {
 const cfg = settings.get(guild.id);
 if (!cfg.antiNukeEnabled || !DESTRUCTIVE.has(entry.action)) return;
 const actorId = entry.executorId || entry.executor?.id;
 if (!actorId || actorId === guild.ownerId || (cfg.trustedAdminIds || []).includes(actorId)) return;
 const now = Date.now(), key = guild.id + ":" + actorId;
 const recent = (activity.get(key) || []).filter(item => now - item.time <= (cfg.antiNukeWindowMs || WINDOW_MS));
 if (recent.some(item => item.id === entry.id)) return;
 recent.push({ id: entry.id, time: now, action: DESTRUCTIVE.get(entry.action), targetId: entry.targetId || null });
 activity.set(key, recent);
 const threshold = cfg.antiNukeThreshold || 4;
 if (recent.length < threshold || (handled.has(key) && now - handled.get(key) < INCIDENT_COOLDOWN_MS)) return;
 handled.set(key, now); activity.delete(key);
 const member = await guild.members.fetch(actorId).catch(() => null);
 const botMember = guild.members.me || await guild.members.fetchMe().catch(() => null);
 const isAdmin = Boolean(member && (member.permissions.has(PermissionFlagsBits.Administrator) || member.permissions.has(PermissionFlagsBits.ManageGuild) || member.permissions.has(PermissionFlagsBits.ManageChannels) || member.permissions.has(PermissionFlagsBits.ManageRoles)));
 const banReason = "NexGuard anti-nuke: " + recent.length + " suspicious security actions within " + Math.round((cfg.antiNukeWindowMs || WINDOW_MS) / 1000) + " seconds.";
 let banStatus = "Not attempted — actor is not a current administrator or could not be fetched.";
 if (isAdmin) {
  if (!botMember?.permissions.has(PermissionFlagsBits.BanMembers)) banStatus = "Failed — NexGuard needs the Ban Members permission.";
  else if (!member.bannable) banStatus = "Failed — actor is above/equal to NexGuard's highest role.";
  else {
   const dmSent = await member.user.send({ embeds: [{ color: 0xdc2626, title: "You have been banned", description: "You were banned from **" + guild.name + "** by NexGuard automated security protection.\n\n**Reason:** " + banReason + "\n**Actions detected:** " + recent.map(x => x.action).join(", ") + "\n\nIf you believe this was a mistake, contact the server owner." }] }).then(() => true).catch(() => false);
   try {
    await guild.members.ban(actorId, { reason: banReason });
    banStatus = "Successfully banned the responsible administrator. DM " + (dmSent ? "sent." : "could not be delivered.");
    db.createCase(guild.id, actorId, guild.client.user.id, "Anti-nuke ban", banReason);
   } catch (error) { banStatus = "Failed — " + error.message; }
  }
 }
 let locked = 0, lockFailed = 0;
 let lockStatus = cfg.autoLockdown ? "Attempted" : "Disabled";
 if (cfg.autoLockdown) {
  const channels = await guild.channels.fetch().catch(() => guild.channels.cache);
  for (const channel of channels.values()) {
   if (![ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum].includes(channel.type)) continue;
   const permissions = channel.permissionsFor(botMember);
   if (!permissions?.has(PermissionFlagsBits.ManageRoles)) { lockFailed++; continue; }
   try {
    await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false }, { reason: "NexGuard anti-nuke emergency lockdown" });
    locked++;
   } catch { lockFailed++; }
  }
  lockStatus = "Locked " + locked + " text channels; " + lockFailed + " failed.";
 }
 const actions = recent.map((item,index)=>(index+1)+". "+item.action+(item.targetId?" (target: "+item.targetId+")":"")).join("\n");
 const details = ["Actor: "+actorId,"Actions: "+recent.map(x=>x.action).join(", "),"Automatic ban: "+banStatus,"Emergency lockdown: "+lockStatus].join("\n");
 db.addIncident(guild.id, actorId, "Anti-nuke", details);
 await log(guild, "🚨 NexGuard Anti-Nuke Incident", [
  "**Responsible administrator:** <@"+actorId+">",
  "**Actions detected:** "+recent.length+" in "+Math.round((cfg.antiNukeWindowMs || WINDOW_MS)/1000)+" seconds (threshold: "+threshold+")",
  "", "**Detected actions**", actions, "",
  "**Automatic ban:** "+banStatus, "**Emergency lockdown:** "+lockStatus, "",
  "Review the Discord audit log. Deleted channels and roles cannot be recreated automatically."
 ].join("\n"), 0xdc2626);
 const owner = await guild.fetchOwner().catch(() => null);
 if (owner) await owner.send("🚨 NexGuard detected a destructive-action incident in **"+guild.name+"** involving <@!"+actorId+">. Ban: "+banStatus+" Lockdown: "+lockStatus+" Check the security log for the incident report.").catch(() => {});
}
module.exports = { record };