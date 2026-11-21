const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const settings = require("../services/guild-settings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configure NexGuard for this server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub => sub
      .setName("logs")
      .setDescription("Set the channel NexGuard uses for server logs.")
      .addChannelOption(option => option
        .setName("channel")
        .setDescription("Channel where NexGuard should send logs.")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)))
    .addSubcommand(sub => sub
      .setName("logs-disable")
      .setDescription("Disable the custom log channel and use the environment fallback.")),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({ content: "Use this command inside a server.", ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "logs") {
      const channel = interaction.options.getChannel("channel", true);
      const botMember = interaction.guild.members.me;
      const permissions = channel.permissionsFor(botMember);

      if (!permissions?.has(PermissionFlagsBits.ViewChannel) ||
          !permissions.has(PermissionFlagsBits.SendMessages) ||
          !permissions.has(PermissionFlagsBits.EmbedLinks)) {
        return interaction.reply({
          content: "I need View Channel, Send Messages, and Embed Links in that channel before I can use it.",
          ephemeral: true
        });
      }

      settings.set(interaction.guildId, { logChannelId: channel.id });
      return interaction.reply({
        content: `NexGuard logs will now be sent to ${channel}.`,
        ephemeral: true
      });
    }

    settings.set(interaction.guildId, { logChannelId: null });
    return interaction.reply({
      content: "Custom log channel disabled. NexGuard will use LOG_CHANNEL_ID from the host environment, if configured.",
      ephemeral: true
    });
  }
};
