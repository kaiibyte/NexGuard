const db=require("../database");
const defaults={logChannelId:null,chatLogChannelId:null,antiLink:false,antiInvite:true,badWords:[],maxMentions:5,maxCapsPercent:80,welcomeChannelId:null,goodbyeChannelId:null,autoRoleId:null,antiRaid:true,antiNukeEnabled:false,antiNukeThreshold:4,antiNukeWindowMs:60000,autoLockdown:false,trustedAdminIds:[],trustedRoleIds:[],backupIntervalHours:null,nsfwEnabled:false,verificationEnabled:false,verificationRoleId:null,verificationChannelId:null};
function get(guildId){
 const stored=db.getGuildSettings(guildId)||{};
 // Upgrade the previous 15-second default to the new 60-second window.
 if(stored.antiNukeWindowMs===15000){
  stored.antiNukeWindowMs=60000;
  db.setGuildSettings(guildId,stored);
 }
 return {...defaults,...stored};
}
function set(guildId,patch){const next={...get(guildId),...patch};db.setGuildSettings(guildId,next);return next;}
module.exports={defaults,get,set};
