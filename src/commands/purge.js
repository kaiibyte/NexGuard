const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { log } = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder().setName("purge").setDescription("Bulk-delete recent messages (2-100).")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(o => o.setName("amount").setDescription("Number of messages").setMinValue(2).setMaxValue(100).setRequired(true)),
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount", true);
    if (!interaction.channel?.bulkDelete) return interaction.reply({ content: "This channel does not support bulk deletion.", ephemeral: true });
    await interaction.deferReply({ ephemeral: true });
    const deleted = await interaction.channel.bulkDelete(amount, true);
    await interaction.editReply(`🧹 Deleted ${deleted.size} recent message(s). Messages older than 14 days cannot be bulk-deleted by Discord.`);
    await log(interaction.guild, "Messages purged", `**Channel:** <#${interaction.channelId}>\n**Moderator:** ${interaction.user.tag}\n**Deleted:** ${deleted.size}`);
  }
};
