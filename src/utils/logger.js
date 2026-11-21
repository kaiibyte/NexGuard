const { EmbedBuilder } = require("discord.js");
const config = require("../config");

async function log(guild, title, description, color = 0x7c3aed) {
  if (!config.logChannelId || !guild) return;
  const channel = await guild.channels.fetch(config.logChannelId).catch(() => null);
  if (!channel || !channel.isTextBased()) return;
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description.slice(0, 4000))
    .setTimestamp();
  await channel.send({ embeds: [embed] }).catch(() => null);
}

module.exports = { log };
