const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
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
    if (!target || !canModerate(interaction, target)) return interaction.reply({ content: "I can't moderate that member. Check role hierarchy and target.", ephemeral: true });
    if (!hasBotPermission(interaction, PermissionFlagsBits.KickMembers)) return interaction.reply({ content: "I need the **Kick Members** permission.", ephemeral: true });
    await target.kick(`${reason} | Moderator: ${interaction.user.tag}`);
    await interaction.reply({ content: `👢 Kicked **${user.tag}**. Reason: ${reason}`, ephemeral: true });
    await log(interaction.guild, "Member kicked", `**User:** ${user.tag} (${user.id})\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`, 0xf97316);
  }
};
