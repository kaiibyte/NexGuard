const db = require("../database");
const { ownerId } = require("../config");
const settings = require("../services/guild-settings");
module.exports = {
 name: "interactionCreate",
 async execute(interaction) {
  if (interaction.isButton() && interaction.customId.startsWith("nexguard:verify:")) {
   const guildId = interaction.customId.split(":")[2];
   if (!interaction.guild || interaction.guild.id !== guildId) return interaction.reply({ content: "This verification button belongs to another server.", ephemeral: true });
   const cfg = settings.get(guildId);
   if (!cfg.verificationEnabled || !cfg.verificationRoleId) return interaction.reply({ content: "Verification is currently disabled. Contact a moderator.", ephemeral: true });
   const role = interaction.guild.roles.cache.get(cfg.verificationRoleId);
   if (!role) return interaction.reply({ content: "The verification role no longer exists. Please contact a moderator.", ephemeral: true });
   const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
   if (!member) return interaction.reply({ content: "Could not find your server membership. Please try again.", ephemeral: true });
   if (!member.roles.cache.has(role.id)) return interaction.reply({ content: "You are already verified. Welcome!", ephemeral: true });
   try {
    await member.roles.remove(role, "NexGuard verification completed");
    return interaction.reply({ content: "✅ You are verified! You can now access the server.", ephemeral: true });
   } catch (error) {
    console.error("Verification failed:", error);
    return interaction.reply({ content: "I could not update your role. Please contact a moderator.", ephemeral: true });
   }
  }
  if (!interaction.isChatInputCommand()) return;
  if (db.getBlacklist("user", interaction.user.id)) return interaction.reply({ content: "You are blocked from using NexGuard commands.", ephemeral: true }).catch(() => null);
  if (interaction.guildId && db.getBlacklist("guild", interaction.guildId)) return interaction.reply({ content: "This server is blocked from using NexGuard.", ephemeral: true }).catch(() => null);
  if (db.getOwnerSetting("maintenance") === "true" && interaction.user.id !== ownerId && interaction.commandName !== "help") return interaction.reply({ content: "NexGuard is temporarily in maintenance mode. Please try again later.", ephemeral: true }).catch(() => null);
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return interaction.reply({ content: "That command is not available.", ephemeral: true }).catch(() => null);
  try { await command.execute(interaction); }
  catch (error) {
   console.error("Command error:", error);
   const payload = { content: "Something went wrong while running that command. The error has been logged.", ephemeral: true };
   if (interaction.deferred || interaction.replied) await interaction.followUp(payload).catch(() => null);
   else await interaction.reply(payload).catch(() => null);
  }
 }
};