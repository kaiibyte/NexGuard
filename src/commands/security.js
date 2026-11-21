const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const settings = require("../services/guild-settings");
const { log } = require("../utils/logger");
const { requirePremium } = require("../services/premium");
module.exports = {
 data: new SlashCommandBuilder().setName("security").setDescription("Configure NexGuard server protection.")
 .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
 .addSubcommand(s=>s.setName("status").setDescription("View protection settings."))
 .addSubcommand(s=>s.setName("antinuke").setDescription("Enable or disable anti-nuke detection.").addBooleanOption(o=>o.setName("enabled").setDescription("Enabled").setRequired(true)))
 .addSubcommand(s=>s.setName("threshold").setDescription("Set destructive-action threshold.").addIntegerOption(o=>o.setName("count").setDescription("3 to 10").setMinValue(3).setMaxValue(10).setRequired(true)))
 .addSubcommand(s=>s.setName("lockdown").setDescription("Enable or disable automatic emergency lockdown.").addBooleanOption(o=>o.setName("enabled").setDescription("Enabled").setRequired(true)))
 .addSubcommand(s=>s.setName("trustedadmin").setDescription("Add or remove a trusted administrator.").addStringOption(o=>o.setName("action").setDescription("Action").setRequired(true).addChoices({name:"Add",value:"add"},{name:"Remove",value:"remove"})).addUserOption(o=>o.setName("user").setDescription("Trusted user").setRequired(true)))
 .addSubcommand(s=>s.setName("unlockdown").setDescription("Restore @everyone SendMessages after a NexGuard lockdown.")),
 async execute(i) {
  const sub=i.options.getSubcommand(), cfg=settings.get(i.guildId);
  if(["antinuke","threshold","lockdown","trustedadmin"].includes(sub) && !requirePremium(i,"Advanced anti-nuke protection")) return;
  if(sub==="status") return i.reply({content:`Anti-nuke: **${cfg.antiNukeEnabled?"On":"Off"}**\nThreshold: **${cfg.antiNukeThreshold} actions**\nAuto-lockdown: **${cfg.autoLockdown?"On":"Off"}**\nTrusted admins: **${(cfg.trustedAdminIds||[]).length}**`,ephemeral:true});
  if(sub==="antinuke"){settings.set(i.guildId,{antiNukeEnabled:i.options.getBoolean("enabled",true)});return i.reply({content:"Anti-nuke setting saved.",ephemeral:true});}
  if(sub==="threshold"){settings.set(i.guildId,{antiNukeThreshold:i.options.getInteger("count",true)});return i.reply({content:"Threshold saved.",ephemeral:true});}
  if(sub==="lockdown"){settings.set(i.guildId,{autoLockdown:i.options.getBoolean("enabled",true)});return i.reply({content:"Automatic lockdown setting saved. It only activates after the configured anti-nuke threshold.",ephemeral:true});}
  if(sub==="trustedadmin"){const user=i.options.getUser("user",true), list=new Set(cfg.trustedAdminIds||[]);i.options.getString("action")==="add"?list.add(user.id):list.delete(user.id);settings.set(i.guildId,{trustedAdminIds:[...list]});return i.reply({content:"Trusted-admin list updated.",ephemeral:true});}
  await i.deferReply({ephemeral:true});
  let changed=0;
  for(const channel of i.guild.channels.cache.values()){if(![0,5].includes(channel.type))continue;try{await channel.permissionOverwrites.edit(i.guild.roles.everyone,{SendMessages:null},{reason:"Owner requested NexGuard lockdown release"});changed++;}catch{}}
  await log(i.guild,"Lockdown release requested",`Released @everyone SendMessages overwrite in ${changed} channels. Review channel-specific overrides manually.`,0x16a34a);
  return i.editReply(`Lockdown release attempted in ${changed} channels. Please verify permissions manually.`);
 }
};
