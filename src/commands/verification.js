const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const settings = require("../services/guild-settings");
module.exports = {
 data: new SlashCommandBuilder().setName("verification").setDescription("Set up a button-based new-member verification gate.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(s => s.setName("setup").setDescription("Choose the unverified role and verification channel.")
   .addRoleOption(o => o.setName("role").setDescription("Role assigned to new members until they verify.").setRequired(true))
   .addChannelOption(o => o.setName("channel").setDescription("Public channel for the verify button.").addChannelTypes(ChannelType.GuildText).setRequired(true)))
  .addSubcommand(s => s.setName("disable").setDescription("Disable the verification gate.")),
 async execute(i) {
  if (i.options.getSubcommand() === "disable") {
   settings.set(i.guildId, { verificationEnabled: false, verificationRoleId: null, verificationChannelId: null });
   return i.reply({ content: "Join verification disabled. The old role and panel are not deleted automatically.", ephemeral: true });
  }
  const role = i.options.getRole("role", true);
  const channel = i.options.getChannel("channel", true);
  const me = i.guild.members.me;
  if (role.id === i.guild.id || role.managed || role.position >= me.roles.highest.position) {
   return i.reply({ content: "I cannot manage that role. Put the unverified role below NexGuard's highest role.", ephemeral: true });
  }
  if (!me.permissions.has(PermissionFlagsBits.ManageRoles)) {
   return i.reply({ content: "I need Manage Roles to assign the unverified role and apply channel restrictions.", ephemeral: true });
  }
  const perms = channel.permissionsFor(me);
  if (!perms?.has(PermissionFlagsBits.ViewChannel) || !perms.has(PermissionFlagsBits.SendMessages) || !perms.has(PermissionFlagsBits.EmbedLinks)) {
   return i.reply({ content: "I need View Channel, Send Messages, and Embed Links in the verification channel.", ephemeral: true });
  }
  await i.deferReply({ ephemeral: true });
  let protectedChannels = 0;
  let failedChannels = 0;
  for (const target of i.guild.channels.cache.values()) {
   if (target.type !== ChannelType.GuildCategory && !target.isTextBased() && !target.isVoiceBased()) continue;
   try {
    if (target.id === channel.id) {
     await target.permissionOverwrites.edit(role, {
      ViewChannel: true, SendMessages: true, ReadMessageHistory: true
     }, { reason: "NexGuard verification channel access" });
    } else {
     await target.permissionOverwrites.edit(role, {
      ViewChannel: false
     }, { reason: "NexGuard restrict unverified members" });
    }
    protectedChannels++;
   } catch (error) {
    failedChannels++;
    console.error("Verification permission update failed:", target.id, error.message);
   }
  }
  if (failedChannels) {
   settings.set(i.guildId, { verificationEnabled: false, verificationRoleId: null, verificationChannelId: null });
   return i.editReply("I could not safely finish verification setup. " + protectedChannels + " channels updated; " + failedChannels + " failed. Review NexGuard's Manage Roles permission and channel overrides, then run setup again. Verification was left disabled.");
  }
  settings.set(i.guildId, { verificationEnabled: true, verificationRoleId: role.id, verificationChannelId: channel.id });
  const embed = new EmbedBuilder().setColor(0x7c3aed).setTitle("🛡️ Verify to access the server")
   .setDescription("Welcome! Press the button below to verify and receive access. If you need help, contact a moderator.");
  const row = new ActionRowBuilder().addComponents(
   new ButtonBuilder().setCustomId("nexguard:verify:" + i.guildId).setLabel("Verify").setStyle(ButtonStyle.Success).setEmoji("✅")
  );
  await channel.send({ embeds: [embed], components: [row] });
  return i.editReply("Verification is enabled. New members will receive the unverified role. NexGuard restricted that role in " + protectedChannels + " channels/categories. Check the permissions and make sure your unverified role is below NexGuard.");
 }
};