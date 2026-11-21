const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const database = require("../database");

module.exports = {
  data: new SlashCommandBuilder().setName("warnings").setDescription("View a member's warnings.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName("user").setDescription("Member to check").setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser("user", true);
    const rows = database.getWarnings(interaction.guildId, user.id);
    const embed = new EmbedBuilder().setColor(0x7c3aed).setTitle(`Warnings: ${user.tag}`);
    if (!rows.length) embed.setDescription("No warnings found.");
    else embed.setDescription(rows.slice(0, 10).map(w => `**#${w.id}** — ${w.reason.slice(0, 180)}\nModerator: <@${w.moderator_id}> • ${w.created_at}`).join("\n\n"));
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
