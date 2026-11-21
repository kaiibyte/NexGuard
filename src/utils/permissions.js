const { PermissionFlagsBits } = require("discord.js");

function canModerate(interaction, target) {
  if (!interaction.inGuild() || !target) return false;
  if (target.id === interaction.user.id) return false;
  if (target.id === interaction.guild.ownerId) return false;
  if (interaction.user.id !== interaction.guild.ownerId &&
      interaction.member.roles.highest.comparePositionTo(target.roles.highest) <= 0) return false;
  const botMember = interaction.guild.members.me;
  if (!botMember || botMember.roles.highest.comparePositionTo(target.roles.highest) <= 0) return false;
  return true;
}

function hasBotPermission(interaction, permission) {
  return interaction.guild.members.me?.permissions.has(permission) ?? false;
}

module.exports = { canModerate, hasBotPermission, PermissionFlagsBits };
