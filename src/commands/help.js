const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("help").setDescription("Show NexGuard's available commands."),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x7c3aed)
      .setTitle("🛡️ NexGuard Help")
      .setDescription("Moderation and security tools currently available.")
      .addFields(
        { name: "Moderation", value: "`/ban` `/kick` `/timeout` `/warn` `/warnings` `/clearwarnings` `/purge` `/lock` `/unlock`" },
        { name: "Utility", value: "`/ping` `/help`" }
      )
      .setFooter({ text: "MODERATE • PROTECT • SECURE" });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
