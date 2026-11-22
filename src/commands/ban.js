const database = require("../database");
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { canModerate, hasBotPermission } = require("../utils/permissions");
const { log } = require("../utils/logger");

module.exports = {
 data: new SlashCommandBuilder().setName("ban").setDescription("Ban a member from this server.")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption(o => o.setName("user").setDescription("Member to ban").setRequired(true))
  .addStringOption(o => o.setName("reason").setDescription("Reason for the ban").setMaxLength(500)),
 async execute(interaction) {
  const user = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason") || "No reason provided";
  const target = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (!target || !canModerate(interaction, target)) return interaction.reply({ content: "⛔ I can't moderate that member. Check role hierarchy and target.", ephemeral: true });
  if (!hasBotPermission(interaction, PermissionFlagsBits.BanMembers)) return interaction.reply({ content: "⛔ I need the **Ban Members** permission.", ephemeral: true });

  await target.ban({ reason: reason + " | Moderator: " + interaction.user.tag });
  const dmEmbed = new EmbedBuilder().setColor(0xDC2626).setTitle("🔨 You have been banned")
   .setDescription("You are no longer able to access **" + interaction.guild.name + "**.")
   .addFields({ name: "Reason", value: reason }, { name: "Moderator", value: interaction.user.tag }, { name: "Appeals", value: "If you believe this action was a mistake, contact the server staff through their official appeal process." })
   .setFooter({ text: "NexGuard Moderation • Ban notice" }).setTimestamp();
  const dmSent = await user.send({ embeds: [dmEmbed] }).then(() => true).catch(() => false);
  const caseId = database.createCase(interaction.guildId, user.id, interaction.user.id, "Ban", reason);
  const result = new EmbedBuilder().setColor(0xDC2626).setTitle("🔨 Member banned")
   .setDescription("The member has been successfully banned from this server.")
   .setThumbnail(user.displayAvatarURL({ size: 128 }))
   .addFields({ name: "Member", value: user.tag + "\n`" + user.id + "`", inline: true }, { name: "Case", value: "`#" + caseId + "`", inline: true }, { name: "Reason", value: reason }, { name: "DM notice", value: dmSent ? "✅ Delivered" : "⚠️ Could not deliver (DMs may be closed)", inline: true }, { name: "Moderator", value: interaction.user.tag, inline: true })
   .setFooter({ text: "NexGuard Moderation" }).setTimestamp();
  await interaction.reply({ embeds: [result], ephemeral: true });
  await log(interaction.guild, "Member banned", "**User:** " + user.tag + " (" + user.id + ")\n**Moderator:** " + interaction.user.tag + "\n**Reason:** " + reason + "\n**Case:** #" + caseId, 0xdc2626);
 }
};
