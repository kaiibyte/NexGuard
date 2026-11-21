const { AuditLogEvent, ChannelType } = require("discord.js");
const { log } = require("../utils/logger");
const settings = require("./guild-settings");
const windows = new Map();
const DESTRUCTIVE = new Set([AuditLogEvent.ChannelDelete,AuditLogEvent.RoleDelete,AuditLogEvent.MemberBanAdd,AuditLogEvent.MemberKick,AuditLogEvent.WebhookDelete,AuditLogEvent.ChannelOverwriteDelete,AuditLogEvent.RoleUpdate,AuditLogEvent.ChannelUpdate]);
async function record(entry,guild){
 const cfg=settings.get(guild.id);
 if(!cfg.antiNukeEnabled||!DESTRUCTIVE.has(entry.action))return;
 const actor=entry.executorId;
 if(!actor||actor===guild.ownerId||(cfg.trustedAdminIds||[]).includes(actor))return;
 const key=guild.id+":"+actor,now=Date.now();
 const events=(windows.get(key)||[]).filter(t=>now-t<(cfg.antiNukeWindowMs||15000));
 events.push(now);windows.set(key,events);
 await log(guild,"Anti-nuke activity detected",`Actor: <@${actor}>\nAction code: ${entry.action}\nCount in window: ${events.length}`,0xdc2626);
 if(events.length<(cfg.antiNukeThreshold||4))return;
 windows.delete(key);
 const owner=await guild.fetchOwner().catch(()=>null);
 if(owner)await owner.send(`🚨 NexGuard detected ${events.length} destructive or security-sensitive audit actions by <@${actor}> in **${guild.name}**. Automatic containment: ${cfg.autoLockdown?"enabled":"disabled"}. Verify the audit log before taking staff action.`).catch(()=>{});
 if(!cfg.autoLockdown)return;
 let locked=0;
 for(const channel of guild.channels.cache.values()){
  if(![ChannelType.GuildText,ChannelType.GuildAnnouncement].includes(channel.type))continue;
  try{await channel.permissionOverwrites.edit(guild.roles.everyone,{SendMessages:false},{reason:"NexGuard configured anti-nuke containment"});locked++;}catch{}
 }
 await log(guild,"Emergency lockdown applied",`NexGuard applied @everyone SendMessages deny to ${locked} text/announcement channels. Run /security unlockdown after investigating; verify every channel manually.`,0x991b1b);
}
module.exports={record};
