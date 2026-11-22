const database = require("../database");
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { canModerate, hasBotPermission } = require("../utils/permissions");
const { log } = require("../utils/logger");
module.exports = {
 data: new SlashCommandBuilder().setName("timeout").setDescription("Temporarily timeout a member.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(o => o.setName("user").setDescription("Member to timeout").setRequired(true))
  .addIntegerOption(o => o.setName("minutes").setDescription("Duration in minutes (1-40320)").setMinValue(1).setMaxValue(40320).setRequired(true))
  .addStringOption(o => o.setName("reason").setDescription("Reason").setMaxLength(500)),
 async execute(interaction) {
  const user = interaction.options.getUser("user", true);
  const minutes = interaction.options.getInteger("minutes", true);
  const reason = interaction.options.getString("reason") || "No reason provided";
  const target = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (!target || !canModerate(interaction, target)) return interaction.reply({ content: "⛔ I can't timeout that member. Check role hierarchy and target.", ephemeral: true });
  if (!hasBotPermission(interaction, PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: "⛔ I need the **Moderate Members** permission.", ephemeral: true });
  await target.timeout(minutes * 60 * 1000, reason + " | Moderator: " + interaction.user.tag);
  const duration = minutes >= 1440 ? Math.floor(minutes / 1440) + " day(s)" : minutes >= 60 ? Math.floor(minutes / 60) + " hour(s)" : minutes + " minute(s)";
  const dmEmbed = new EmbedBuilder().setColor(0xD97706).setTitle("⏳ You have been timed out")
   .setDescription("You cannot send messages or interact in **" + interaction.guild.name + "** until your timeout ends.")
   .addFields({ name: "Duration", value: duration, inline: true }, { name: "Reason", value: reason }, { name: "Moderator", value: interaction.user.tag })
   .setFooter({ text: "NexGuard Moderation • Timeout notice" }).setTimestamp();
  const dmSent = await user.send({ embeds: [dmEmbed] }).then(() => true).catch(() => false);
  const caseId = database.createCase(interaction.guildId, user.id, interaction.user.id, "Timeout", reason, minutes + " minutes");
  const result = new EmbedBuilder().setColor(0xD97706).setTitle("⏳ Member timed out")
   .setDescription("The timeout has been applied successfully.")
   .setThumbnail(user.displayAvatarURL({ size: 128 }))
   .addFields({ name: "Member", value: user.tag + "\n`" + user.id + "`", inline: true }, { name: "Duration", value: duration, inline: true }, { name: "Case", value: "`#" + caseId + "`", inline: true }, { name: "Reason", value: reason }, { name: "DM notice", value: dmSent ? "✅ Delivered" : "⚠️ Could not deliver", inline: true }, { name: "Moderator", value: interaction.user.tag, inline: true })
   .setFooter({ text: "NexGuard Moderation" }).setTimestamp();
  await interaction.reply({ embeds: [result], ephemeral: true });
  await log(interaction.guild, "Member timed out", "**User:** " + user.tag + " (" + user.id + ")\n**Moderator:** " + interaction.user.tag + "\n**Duration:** " + duration + "\n**Reason:** " + reason + "\n**Case:** #" + caseId, 0xd97706);
 }
};
