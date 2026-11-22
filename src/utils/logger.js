const { EmbedBuilder } = require("discord.js");
const config = require("../config");
const settings = require("../services/guild-settings");

async function sendToChannel(guild, channelId, title, description, color) {
  if (!guild || !channelId) return false;
  const channel = await guild.channels.fetch(channelId).catch(() => null);
  if (!channel || !channel.isTextBased() || !channel.send) return false;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(String(description).slice(0, 4000))
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => null);
  return true;
}

async function log(guild, title, description, color = 0x7c3aed) {
  if (!guild) return;
  const cfg = settings.get(guild.id);
  const channelId = cfg.logChannelId || config.logChannelId;
  return sendToChannel(guild, channelId, title, description, color);
}

async function chatLog(guild, title, description, color = 0x7c3aed) {
  if (!guild) return;
  const cfg = settings.get(guild.id);
  // If no dedicated chat-log channel is configured, use the normal log channel.
  const channelId = cfg.chatLogChannelId || cfg.logChannelId || config.logChannelId;
  return sendToChannel(guild, channelId, title, description, color);
}

module.exports = { log, chatLog };