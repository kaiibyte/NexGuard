const database = require("../database");
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { canModerate, hasBotPermission } = require("../utils/permissions");
const { log } = require("../utils/logger");
module.exports = {
 data: new SlashCommandBuilder().setName("kick").setDescription("Kick a member from this server.")
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption(o => o.setName("user").setDescription("Member to kick").setRequired(true))
  .addStringOption(o => o.setName("reason").setDescription("Reason").setMaxLength(500)),
 async execute(interaction) {
  const user = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason") || "No reason provided";
  const target = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (!target || !canModerate(interaction, target)) return interaction.reply({ content: "⛔ I can't moderate that member. Check role hierarchy and target.", ephemeral: true });
  if (!hasBotPermission(interaction, PermissionFlagsBits.KickMembers)) return interaction.reply({ content: "⛔ I need the **Kick Members** permission.", ephemeral: true });
  await target.kick(reason + " | Moderator: " + interaction.user.tag);
  const dmEmbed = new EmbedBuilder().setColor(0xF97316).setTitle("👢 You have been kicked")
   .setDescription("You have been removed from **" + interaction.guild.name + "**.")
   .addFields({ name: "Reason", value: reason }, { name: "Moderator", value: interaction.user.tag })
   .setFooter({ text: "NexGuard Moderation • Kick notice" }).setTimestamp();
  const dmSent = await user.send({ embeds: [dmEmbed] }).then(() => true).catch(() => false);
  const caseId = database.createCase(interaction.guildId, user.id, interaction.user.id, "Kick", reason);
  const result = new EmbedBuilder().setColor(0xF97316).setTitle("👢 Member kicked")
   .setDescription("The member has been removed from this server.")
   .setThumbnail(user.displayAvatarURL({ size: 128 }))
   .addFields({ name: "Member", value: user.tag + "\n`" + user.id + "`", inline: true }, { name: "Case", value: "`#" + caseId + "`", inline: true }, { name: "Reason", value: reason }, { name: "DM notice", value: dmSent ? "✅ Delivered" : "⚠️ Could not deliver", inline: true }, { name: "Moderator", value: interaction.user.tag, inline: true })
   .setFooter({ text: "NexGuard Moderation" }).setTimestamp();
  await interaction.reply({ embeds: [result], ephemeral: true });
  await log(interaction.guild, "Member kicked", "**User:** " + user.tag + " (" + user.id + ")\n**Moderator:** " + interaction.user.tag + "\n**Reason:** " + reason + "\n**Case:** #" + caseId, 0xf97316);
 }
};
