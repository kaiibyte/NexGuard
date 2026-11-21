const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Check NexGuard's response time."),
  async execute(interaction) {
    await interaction.reply({ content: `Pong! 🛡️ API latency: ${Math.round(interaction.client.ws.ping)}ms`, ephemeral: true });
  }
};
