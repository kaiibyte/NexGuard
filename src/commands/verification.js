const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const settings = require("../services/guild-settings");
module.exports={
 data:new SlashCommandBuilder().setName("verification").setDescription("Set up a button-based new-member verification gate.")
 .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
 .addSubcommand(s=>s.setName("setup").setDescription("Choose the unverified role and verification channel.")
  .addRoleOption(o=>o.setName("role").setDescription("Role assigned to new members until they verify.").setRequired(true))
  .addChannelOption(o=>o.setName("channel").setDescription("Public channel for the verify button.").addChannelTypes(ChannelType.GuildText).setRequired(true)))
 .addSubcommand(s=>s.setName("disable").setDescription("Disable the verification gate.")),
 async execute(i){
  if(i.options.getSubcommand()==="disable"){settings.set(i.guildId,{verificationEnabled:false,verificationRoleId:null,verificationChannelId:null});return i.reply({content:"Join verification disabled. Remove the old role/panel manually if desired.",ephemeral:true});}
  const role=i.options.getRole("role",true), channel=i.options.getChannel("channel",true), me=i.guild.members.me;
  if(role.id===i.guild.id||role.managed||role.position>=me.roles.highest.position)return i.reply({content:"I cannot manage that role. Put the unverified role below NexGuard's highest role.",ephemeral:true});
  const perms=channel.permissionsFor(me);
  if(!perms?.has(PermissionFlagsBits.ViewChannel)||!perms.has(PermissionFlagsBits.SendMessages)||!perms.has(PermissionFlagsBits.EmbedLinks))return i.reply({content:"I need View Channel, Send Messages, and Embed Links in that channel.",ephemeral:true});
  settings.set(i.guildId,{verificationEnabled:true,verificationRoleId:role.id,verificationChannelId:channel.id});
  const embed=new EmbedBuilder().setColor(0x7c3aed).setTitle("🛡️ Verify to access the server").setDescription("Welcome! Press the button below to verify and receive access. If you need help, contact a moderator.");
  const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("nexguard:verify:"+i.guildId).setLabel("Verify").setStyle(ButtonStyle.Success).setEmoji("✅"));
  await channel.send({embeds:[embed],components:[row]});
  return i.reply({content:"Verification is enabled. New members will receive the unverified role, and this channel now has a verification panel. Make sure your other channels deny View Channel to that role.",ephemeral:true});
 }
};