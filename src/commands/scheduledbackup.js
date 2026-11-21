const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const settings = require("../services/guild-settings");
const db = require("../database");
module.exports = {
 data:new SlashCommandBuilder().setName("scheduledbackup").setDescription("Configure automatic server backups (Premium).").setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
 .addSubcommand(s=>s.setName("set").setDescription("Set backup interval.").addIntegerOption(o=>o.setName("hours").setDescription("Every 6, 12 or 24 hours").setRequired(true).addChoices({name:"6 hours",value:6},{name:"12 hours",value:12},{name:"24 hours",value:24})))
 .addSubcommand(s=>s.setName("disable").setDescription("Disable scheduled backups."))
 .addSubcommand(s=>s.setName("status").setDescription("View scheduled backup settings.")),
 async execute(i){const sub=i.options.getSubcommand(),cfg=settings.get(i.guildId);if(sub==="status")return i.reply({content:`Scheduled backups: **${cfg.backupIntervalHours?cfg.backupIntervalHours+" hours":"Off"}**\nPremium: **${db.hasPremium(i.guildId)?"Active":"Inactive"}**`,ephemeral:true});if(!db.hasPremium(i.guildId))return i.reply({content:"Scheduled backups require NexGuard Premium.",ephemeral:true});if(sub==="disable"){settings.set(i.guildId,{backupIntervalHours:null});return i.reply({content:"Scheduled backups disabled.",ephemeral:true});}settings.set(i.guildId,{backupIntervalHours:i.options.getInteger("hours",true)});return i.reply({content:"Scheduled backup interval saved. NexGuard checks the schedule every 15 minutes while online.",ephemeral:true});}
};
