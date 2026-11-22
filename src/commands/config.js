const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const settings = require("../services/guild-settings");

function canSendLogs(channel, botMember) {
  const permissions = channel.permissionsFor(botMember);
  return permissions?.has(PermissionFlagsBits.ViewChannel) &&
    permissions.has(PermissionFlagsBits.SendMessages) &&
    permissions.has(PermissionFlagsBits.EmbedLinks);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configure NexGuard for this server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub => sub
      .setName("logs")
      .setDescription("Set the channel NexGuard uses for security and moderation logs.")
      .addChannelOption(option => option
        .setName("channel")
        .setDescription("Channel where NexGuard should send security and moderation logs.")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)))
    .addSubcommand(sub => sub
      .setName("logs-disable")
      .setDescription("Disable the custom log channel and use the environment fallback."))
    .addSubcommand(sub => sub
      .setName("chat-logs")
      .setDescription("Set the channel for deleted and edited message logs.")
      .addChannelOption(option => option
        .setName("channel")
        .setDescription("Channel where NexGuard should send chat logs.")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)))
    .addSubcommand(sub => sub
      .setName("chat-logs-disable")
      .setDescription("Send chat logs to the normal log channel instead.")),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({ content: "Use this command inside a server.", ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const botMember = interaction.guild.members.me;

    if (subcommand === "logs" || subcommand === "chat-logs") {
      const channel = interaction.options.getChannel("channel", true);
      if (!canSendLogs(channel, botMember)) {
        return interaction.reply({
          content: "I need View Channel, Send Messages, and Embed Links in that channel before I can use it.",
          ephemeral: true
        });
      }

      if (subcommand === "chat-logs") {
        settings.set(interaction.guildId, { chatLogChannelId: channel.id });
        return interaction.reply({
          content: `Deleted and edited message logs will now go to ${channel}.`,
          ephemeral: true
        });
      }

      settings.set(interaction.guildId, { logChannelId: channel.id });
      return interaction.reply({
        content: `Security and moderation logs will now be sent to ${channel}.`,
        ephemeral: true
      });
    }

    if (subcommand === "chat-logs-disable") {
      settings.set(interaction.guildId, { chatLogChannelId: null });
      return interaction.reply({
        content: "Dedicated chat logs disabled. Deleted and edited message logs will use your normal log channel.",
        ephemeral: true
      });
    }

    settings.set(interaction.guildId, { logChannelId: null });
    return interaction.reply({
      content: "Custom security/moderation log channel disabled. NexGuard will use LOG_CHANNEL_ID from the host environment, if configured.",
      ephemeral: true
    });
  }
};