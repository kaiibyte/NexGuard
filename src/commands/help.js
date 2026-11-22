const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
module.exports = {
 data: new SlashCommandBuilder().setName("help").setDescription("Show NexGuard's available commands."),
 async execute(i) {
  const embed = new EmbedBuilder().setColor(0x7c3aed).setTitle("🛡️ NexGuard Help")
   .setDescription("Moderation, verification, incident response, and server-security tools.")
   .addFields(
    { name: "Moderation", value: "/ban • /unban • /kick • /timeout • /untimeout • /warn • /warnings • /clearwarnings • /case view • /case list • /case note" },
    { name: "Verification & automod", value: "/verification setup • /verification disable • /automod • /welcome • /setup" },
    { name: "Security", value: "/security • /recommendations • /advisor • /incidents • /config logs • /config nsfw" },
    { name: "Backup & recovery", value: "/backup create • /backup list • /restore" },
    { name: "Utilities", value: "/ping • /userinfo • /serverinfo • /avatar • /stats • /help" }
   )
   .setFooter({ text: "MODERATE • PROTECT • SECURE" });
  return i.reply({ embeds: [embed], ephemeral: true });
 }
};