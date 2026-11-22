const database = require("../database");
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
    const dmSent = await user.send({ embeds: [{ color: 0xdc2626, title: "You have been banned", description: `You were banned from **${interaction.guild.name}**.\n\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}\n\nIf you believe this was a mistake, contact the server staff through their official appeal process.` }] }).then(() => true).catch(() => false);
    await target.ban({ reason: `${reason} | Moderator: ${interaction.user.tag}` });
    const caseId = database.createCase(interaction.guildId, user.id, interaction.user.id, "Ban", reason);
    await interaction.reply({ content: `🔨 Banned **${user.tag}**. Reason: ${reason}\nBan notice DM: ${dmSent ? "sent" : "could not be delivered (DMs may be closed)."} • Case #${caseId}`, ephemeral: true });
    await log(interaction.guild, "Member banned", `**User:** ${user.tag} (${user.id})\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`, 0xdc2626);
  }
};
