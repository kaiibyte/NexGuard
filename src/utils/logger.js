const { EmbedBuilder } = require("discord.js");
const config = require("../config");
const settings = require("../services/guild-settings");

async function log(guild, title, description, color = 0x7c3aed) {
  if (!guild) return;
  const channelId = settings.get(guild.id).logChannelId || config.logChannelId;
  if (!channelId) return;
  const channel = await guild.channels.fetch(channelId).catch(() => null);
  if (!channel || !channel.isTextBased() || !channel.send) return;
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(String(description).slice(0, 4000))
    .setTimestamp();
  await channel.send({ embeds: [embed] }).catch(() => null);
}

module.exports = { log };
