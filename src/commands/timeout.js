const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
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
    if (!target || !canModerate(interaction, target)) return interaction.reply({ content: "I can't timeout that member. Check role hierarchy and target.", ephemeral: true });
    if (!hasBotPermission(interaction, PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: "I need the **Moderate Members** permission.", ephemeral: true });
    await target.timeout(minutes * 60 * 1000, `${reason} | Moderator: ${interaction.user.tag}`);
    await interaction.reply({ content: `⏳ Timed out **${user.tag}** for ${minutes} minute(s). Reason: ${reason}`, ephemeral: true });
    await log(interaction.guild, "Member timed out", `**User:** ${user.tag} (${user.id})\n**Moderator:** ${interaction.user.tag}\n**Duration:** ${minutes} minutes\n**Reason:** ${reason}`, 0xd97706);
  }
};
