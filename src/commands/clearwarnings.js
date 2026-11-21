const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const database = require("../database");
const { log } = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder().setName("clearwarnings").setDescription("Clear all stored warnings for a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName("user").setDescription("Member whose warnings will be cleared").setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser("user", true);
    const count = database.clearWarnings(interaction.guildId, user.id);
    await interaction.reply({ content: `Cleared ${count} warning(s) for **${user.tag}**.`, ephemeral: true });
    await log(interaction.guild, "Warnings cleared", `**User:** ${user.tag} (${user.id})\n**Moderator:** ${interaction.user.tag}\n**Count:** ${count}`);
  }
};
