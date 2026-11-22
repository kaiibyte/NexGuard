const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { canModerate, hasBotPermission } = require("../utils/permissions");
const { log } = require("../utils/logger");
module.exports = {
 data: new SlashCommandBuilder().setName("untimeout").setDescription("Remove a member timeout.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(o => o.setName("user").setDescription("Member to untimeout").setRequired(true))
  .addStringOption(o => o.setName("reason").setDescription("Reason").setMaxLength(500)),
 async execute(interaction) {
  const user = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason") || "No reason provided";
  const target = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (!target || !canModerate(interaction, target)) return interaction.reply({ content: "⛔ I cannot moderate that member. Check role hierarchy and target.", ephemeral: true });
  if (!hasBotPermission(interaction, PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: "⛔ I need the Moderate Members permission.", ephemeral: true });
  await target.timeout(null, reason + " | Moderator: " + interaction.user.tag);
  const result = new EmbedBuilder().setColor(0x16A34A).setTitle("✅ Timeout removed")
   .setDescription("The member can now chat and interact in this server again.")
   .setThumbnail(user.displayAvatarURL({ size: 128 }))
   .addFields({ name: "Member", value: user.tag + "\n`" + user.id + "`", inline: true }, { name: "Moderator", value: interaction.user.tag, inline: true }, { name: "Reason", value: reason })
   .setFooter({ text: "NexGuard Moderation" }).setTimestamp();
  await interaction.reply({ embeds: [result], ephemeral: true });
  await log(interaction.guild, "Timeout removed", "**User:** " + user.tag + " (" + user.id + ")\n**Moderator:** " + interaction.user.tag + "\n**Reason:** " + reason, 0x16a34a);
 }
};
