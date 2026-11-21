const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { log } = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder().setName("lock").setDescription("Prevent @everyone from sending messages in this channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const channel = interaction.channel;
    if (!channel?.permissionOverwrites) return interaction.reply({ content: "This channel cannot be locked by NexGuard.", ephemeral: true });
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false }, { reason: `Locked by ${interaction.user.tag}` });
    await interaction.reply({ content: "🔒 Channel locked for @everyone.", ephemeral: false });
    await log(interaction.guild, "Channel locked", `**Channel:** <#${channel.id}>\n**Moderator:** ${interaction.user.tag}`);
  }
};
