const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
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
    if (!target || !canModerate(interaction, target)) return interaction.reply({ content: "I can't warn that member. Check role hierarchy and target.", ephemeral: true });
    const id = database.addWarning(interaction.guildId, user.id, interaction.user.id, reason);
    const caseId = database.createCase(interaction.guildId, user.id, interaction.user.id, "Warning", reason);
    await interaction.reply({ content: `⚠️ Warned **${user.tag}**. Warning ID: #${id} • Case #${caseId}. Reason: ${reason}`, ephemeral: true });
    await log(interaction.guild, "Member warned", `**User:** ${user.tag} (${user.id})\n**Moderator:** ${interaction.user.tag}\n**Warning:** #${id}\n**Reason:** ${reason}`, 0xeab308);
  }
};
