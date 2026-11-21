const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const db = require("../database");
const { capture } = require("../services/backup");
module.exports = { data:new SlashCommandBuilder().setName("backup").setDescription("Create or view server structure backups.").setDefaultMemberPermissions(PermissionFlagsBits.Administrator).addSubcommand(s=>s.setName("create").setDescription("Save a snapshot of roles and channels.")).addSubcommand(s=>s.setName("list").setDescription("List saved snapshots.")), async execute(i) {
  if (i.options.getSubcommand()==="create") { await i.deferReply({ephemeral:true}); const result=await capture(i.guild); return i.editReply("Backup #"+result.id+" saved. It includes supported roles, categories, channels and basic permission data. Store regular backups before incidents."); }
  const rows=db.listBackups(i.guildId); return i.reply({content:rows.length?rows.map(x=>"#"+x.id+" • "+x.created_at).join("\n"):"No backups yet. Run /backup create.",ephemeral:true});
} };