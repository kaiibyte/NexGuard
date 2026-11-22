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
    .addSubcommand(sub => sub.setName("logs").setDescription("Set security and moderation log channel.")
      .addChannelOption(option => option.setName("channel").setDescription("Security and moderation logs.")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true)))
    .addSubcommand(sub => sub.setName("logs-disable").setDescription("Use the environment fallback for security logs."))
    .addSubcommand(sub => sub.setName("chat-logs").setDescription("Set deleted and edited message log channel.")
      .addChannelOption(option => option.setName("channel").setDescription("Deleted and edited message logs.")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true)))
    .addSubcommand(sub => sub.setName("chat-logs-disable").setDescription("Send chat logs to the normal log channel."))
    .addSubcommand(sub => sub.setName("nsfw").setDescription("Enable or disable image NSFW moderation.")
      .addBooleanOption(option => option.setName("enabled").setDescription("Enable image scanning.").setRequired(true))),

  async execute(interaction) {
    if (!interaction.inGuild()) return interaction.reply({ content: "Use this command inside a server.", ephemeral: true });
    const subcommand = interaction.options.getSubcommand();
    const botMember = interaction.guild.members.me;

    if (subcommand === "nsfw") {
      const enabled = interaction.options.getBoolean("enabled", true);
      settings.set(interaction.guildId, { nsfwEnabled: enabled });
      return interaction.reply({
        content: enabled
          ? "Image NSFW scanning enabled. Images are sent to the third-party moderation API. High-confidence detections only are actioned; uncertain results are logged for review."
          : "Image NSFW scanning disabled.",
        ephemeral: true
      });
    }

    if (subcommand === "logs" || subcommand === "chat-logs") {
      const channel = interaction.options.getChannel("channel", true);
      if (!canSendLogs(channel, botMember)) {
        return interaction.reply({ content: "I need View Channel, Send Messages, and Embed Links in that channel.", ephemeral: true });
      }
      if (subcommand === "chat-logs") {
        settings.set(interaction.guildId, { chatLogChannelId: channel.id });
        return interaction.reply({ content: `Deleted and edited message logs will now go to ${channel}.`, ephemeral: true });
      }
      settings.set(interaction.guildId, { logChannelId: channel.id });
      return interaction.reply({ content: `Security and moderation logs will now be sent to ${channel}.`, ephemeral: true });
    }

    if (subcommand === "chat-logs-disable") {
      settings.set(interaction.guildId, { chatLogChannelId: null });
      return interaction.reply({ content: "Dedicated chat logs disabled. They will use your normal log channel.", ephemeral: true });
    }

    settings.set(interaction.guildId, { logChannelId: null });
    return interaction.reply({ content: "Custom security/moderation log channel disabled. NexGuard will use LOG_CHANNEL_ID if configured.", ephemeral: true });
  }
};