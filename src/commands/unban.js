const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { log } = require("../utils/logger");
module.exports = {
 data: new SlashCommandBuilder().setName("unban").setDescription("Remove a ban using a Discord user ID.")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addStringOption(o => o.setName("user_id").setDescription("The banned user ID").setRequired(true))
  .addStringOption(o => o.setName("reason").setDescription("Reason").setMaxLength(500)),
 async execute(interaction) {
  const id = interaction.options.getString("user_id", true).trim();
  if (!/^\d{17,20}$/.test(id)) return interaction.reply({ content: "⛔ Enter a valid Discord user ID.", ephemeral: true });
  const reason = interaction.options.getString("reason") || "No reason provided";
  const ban = await interaction.guild.bans.fetch(id).catch(() => null);
  if (!ban) return interaction.reply({ content: "ℹ️ That user is not currently banned, or the ban could not be found.", ephemeral: true });
  await interaction.guild.members.unban(id, reason + " | Moderator: " + interaction.user.tag);
  const result = new EmbedBuilder().setColor(0x16A34A).setTitle("✅ Member unbanned")
   .setDescription("The ban has been removed successfully.")
   .addFields({ name: "User ID", value: "`" + id + "`", inline: true }, { name: "Moderator", value: interaction.user.tag, inline: true }, { name: "Reason", value: reason })
   .setFooter({ text: "NexGuard Moderation" }).setTimestamp();
  await interaction.reply({ embeds: [result], ephemeral: true });
  await log(interaction.guild, "Member unbanned", "User ID: " + id + "\nModerator: " + interaction.user.tag + "\nReason: " + reason, 0x16a34a);
 }
};
