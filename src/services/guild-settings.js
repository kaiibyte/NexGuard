const db=require("../database");
const defaults={antiLink:false,antiInvite:true,badWords:[],maxMentions:5,maxCapsPercent:80,welcomeChannelId:null,goodbyeChannelId:null,autoRoleId:null,antiRaid:true,antiNuke:true,trustedRoleIds:[]};
function get(guildId){return {...defaults,...(db.getGuildSettings(guildId)||{})};}
function set(guildId,patch){const next={...get(guildId),...patch};db.setGuildSettings(guildId,next);return next;}
module.exports={defaults,get,set};