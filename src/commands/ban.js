const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
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
    if (!target || !canModerate(interaction, target)) return interaction.reply({ content: "I can't moderate that member. Check role hierarchy and target.", ephemeral: true });
    if (!hasBotPermission(interaction, PermissionFlagsBits.BanMembers)) return interaction.reply({ content: "I need the **Ban Members** permission.", ephemeral: true });
    await target.ban({ reason: `${reason} | Moderator: ${interaction.user.tag}` });
    await interaction.reply({ content: `🔨 Banned **${user.tag}**. Reason: ${reason}`, ephemeral: true });
    await log(interaction.guild, "Member banned", `**User:** ${user.tag} (${user.id})\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`, 0xdc2626);
  }
};
