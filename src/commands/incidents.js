const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const db = require("../database");
module.exports = {
 data: new SlashCommandBuilder().setName("incidents").setDescription("Search NexGuard's recent security incidents.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
  .addIntegerOption(o => o.setName("limit").setDescription("Number of incidents (1-10)").setMinValue(1).setMaxValue(10))
  .addUserOption(o => o.setName("user").setDescription("Filter by responsible user"))
  .addStringOption(o => o.setName("keyword").setDescription("Search action or details").setMaxLength(80)),
 async execute(interaction) {
  const limit = interaction.options.getInteger("limit") || 5;
  const userId = interaction.options.getUser("user")?.id || null;
  const keyword = (interaction.options.getString("keyword") || "").toLowerCase();
  const rows = db.listIncidents(interaction.guildId, 25).filter(row =>
   (!userId || row.actor_id === userId) &&
   (!keyword || (row.action + " " + (row.details || "")).toLowerCase().includes(keyword))
  ).slice(0, limit);
  if (!rows.length) return interaction.reply({ content: "No matching security incidents found in the latest 25 records.", ephemeral: true });
  const embed = new EmbedBuilder().setColor(0x7c3aed).setTitle("NexGuard — Security Incident History")
   .setDescription(rows.map(row => "**#" + row.id + " · " + row.action + "**\nActor: " + (row.actor_id ? "<@!" + row.actor_id + ">" : "Unknown") + "\n" + String(row.details || "").slice(0, 450) + "\n<t:" + Math.floor(Date.parse(row.created_at + "Z") / 1000) + ":R>").join("\n\n").slice(0, 4000))
   .setFooter({ text: "Showing " + rows.length + " matching incident(s) from the latest 25 records" }).setTimestamp();
  return interaction.reply({ embeds: [embed], ephemeral: true });
 }
};