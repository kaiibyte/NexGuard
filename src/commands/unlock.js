const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { log } = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder().setName("unlock").setDescription("Remove the @everyone send-message lock in this channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const channel = interaction.channel;
    if (!channel?.permissionOverwrites) return interaction.reply({ content: "This channel cannot be unlocked by NexGuard.", ephemeral: true });
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null }, { reason: `Unlocked by ${interaction.user.tag}` });
    await interaction.reply({ content: "🔓 Channel unlocked for @everyone (other overwrites still apply).", ephemeral: false });
    await log(interaction.guild, "Channel unlocked", `**Channel:** <#${channel.id}>\n**Moderator:** ${interaction.user.tag}`);
  }
};
