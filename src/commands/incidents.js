const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const db = require("../database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("incidents")
    .setDescription("View NexGuard's recent security incidents.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
    .addIntegerOption(option =>
      option.setName("limit")
        .setDescription("Number of incidents to show (1-10).")
        .setMinValue(1)
        .setMaxValue(10)
    ),
  async execute(interaction) {
    const rows = db.listIncidents(interaction.guildId, interaction.options.getInteger("limit") || 5);
    if (!rows.length) {
      return interaction.reply({ content: "No recorded security incidents yet.", ephemeral: true });
    }
    const embed = new EmbedBuilder()
      .setColor(0x7c3aed)
      .setTitle("NexGuard — Recent Incidents")
      .setDescription(rows.map(row =>
        `**#${row.id} · ${row.action}**\nActor: ${row.actor_id ? `<@!${row.actor_id}>` : "Unknown"}\n${String(row.details || "").slice(0, 500)}\n< t:${Math.floor(Date.parse(row.created_at + "Z") / 1000)}:R>`
      ).join("\n\n").slice(0, 4000))
      .setFooter({ text: "Showing the latest recorded incidents" })
      .setTimestamp();
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
