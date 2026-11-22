const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const database = require("../database");
const { canModerate } = require("../utils/permissions");
const { log } = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder().setName("warn").setDescription("Add a warning to a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName("user").setDescription("Member to warn").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason").setRequired(true).setMaxLength(500)),
  async execute(interaction) {
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);
    const target = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!target || !canModerate(interaction, target)) return interaction.reply({ content: "⛔ I can't warn that member. Check role hierarchy and target.", ephemeral: true });
    const id = database.addWarning(interaction.guildId, user.id, interaction.user.id, reason);
    const caseId = database.createCase(interaction.guildId, user.id, interaction.user.id, "Warning", reason);
    const dmEmbed = new EmbedBuilder().setColor(0xEAB308).setTitle("⚠️ You have received a warning")
      .setDescription("A moderator has issued you a warning in **" + interaction.guild.name + "**.")
      .addFields({ name: "Reason", value: reason }, { name: "Warning ID", value: "`#" + id + "`", inline: true }, { name: "Case", value: "`#" + caseId + "`", inline: true })
      .setFooter({ text: "NexGuard Moderation • Warning notice" }).setTimestamp();
    const dmSent = await user.send({ embeds: [dmEmbed] }).then(() => true).catch(() => false);
    const result = new EmbedBuilder().setColor(0xEAB308).setTitle("⚠️ Warning issued")
      .setDescription("The warning has been added to the member's moderation history.")
      .setThumbnail(user.displayAvatarURL({ size: 128 }))
      .addFields({ name: "Member", value: user.tag + "\n`" + user.id + "`", inline: true }, { name: "Warning ID", value: "`#" + id + "`", inline: true }, { name: "Case", value: "`#" + caseId + "`", inline: true }, { name: "Reason", value: reason }, { name: "DM notice", value: dmSent ? "✅ Delivered" : "⚠️ Could not deliver", inline: true }, { name: "Moderator", value: interaction.user.tag, inline: true })
      .setFooter({ text: "NexGuard Moderation" }).setTimestamp();
    await interaction.reply({ embeds: [result], ephemeral: true });
    await log(interaction.guild, "Member warned", "**User:** " + user.tag + " (" + user.id + ")\n**Moderator:** " + interaction.user.tag + "\n**Warning:** #" + id + "\n**Reason:** " + reason + "\n**Case:** #" + caseId, 0xeab308);
  }
};
