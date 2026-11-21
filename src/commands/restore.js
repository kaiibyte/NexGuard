const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db=require("../database"); const {restore}=require("../services/backup");
module.exports={data:new SlashCommandBuilder().setName("restore").setDescription("Preview or apply a best-effort server structure recovery.").setDefaultMemberPermissions(PermissionFlagsBits.Administrator).addIntegerOption(o=>o.setName("backup_id").setDescription("Backup ID from /backup list").setRequired(true)).addBooleanOption(o=>o.setName("confirm").setDescription("Set true to apply the previewed recovery.")),async execute(i){
 const id=i.options.getInteger("backup_id",true); const row=db.getBackup(i.guildId,id); if(!row)return i.reply({content:"Backup not found for this server.",ephemeral:true});
 const snapshot=JSON.parse(row.snapshot_json); await i.deferReply({ephemeral:true}); const confirm=i.options.getBoolean("confirm")===true;
 const actions=await restore(i.guild,snapshot,!confirm); if(!actions.length)return i.editReply("No missing supported roles or channels were found.");
 if(confirm)return i.editReply("Recovery attempted. "+actions.length+" item(s) were processed. Check the server and NexGuard logs; recovery is best-effort.");
 return i.editReply("**Recovery preview (no changes made):**\n"+actions.slice(0,35).map(x=>"• "+x).join("\n")+(actions.length>35?"\n…and "+(actions.length-35)+" more.":"")+"\n\nTo apply: run /restore again with confirm:true. Deleted messages and unsupported resources cannot be restored.");
}};