const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const db = require("../database");
module.exports = {
 data: new SlashCommandBuilder().setName("case").setDescription("View moderation case history.")
 .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
 .addSubcommand(s=>s.setName("view").setDescription("View one case.").addIntegerOption(o=>o.setName("id").setDescription("Case ID").setRequired(true)))
 .addSubcommand(s=>s.setName("list").setDescription("List cases for a member.").addUserOption(o=>o.setName("user").setDescription("Member").setRequired(true)))
 .addSubcommand(s=>s.setName("note").setDescription("Add a staff note to a case.").addIntegerOption(o=>o.setName("id").setDescription("Case ID").setRequired(true)).addStringOption(o=>o.setName("note").setDescription("Staff-only note").setRequired(true).setMaxLength(500))),
 async execute(i){
  const sub=i.options.getSubcommand();
  if(sub==="view"){
   const id=i.options.getInteger("id",true), row=db.getCase(i.guildId,id);
   if(!row)return i.reply({content:"Case not found in this server.",ephemeral:true});
   const embed=new EmbedBuilder().setColor(0x7c3aed).setTitle("Moderation Case #"+row.id).addFields(
    {name:"User",value:"<@"+row.user_id+"> ("+row.user_id+")",inline:false},
    {name:"Action",value:row.action,inline:true},
    {name:"Moderator",value:"<@"+row.moderator_id+">",inline:true},
    {name:"Reason",value:row.reason.slice(0,1000)},
    {name:"Duration",value:row.duration||"Permanent / not applicable",inline:true},
    {name:"Staff note",value:row.note||"No note",inline:false}
   ).setTimestamp(new Date(row.created_at+"Z"));
   return i.reply({embeds:[embed],ephemeral:true});
  }
  if(sub==="list"){
   const user=i.options.getUser("user",true), rows=db.listCases(i.guildId,user.id);
   return i.reply({content:rows.length?rows.map(r=>"#"+r.id+" • "+r.action+" • "+r.reason.slice(0,120)).join("\n"):"No cases found for that member.",ephemeral:true});
  }
  const id=i.options.getInteger("id",true), note=i.options.getString("note",true), row=db.getCase(i.guildId,id);
  if(!row)return i.reply({content:"Case not found in this server.",ephemeral:true});
  db.addCaseNote(i.guildId,id,note);
  return i.reply({content:"Staff note saved to case #"+id+".",ephemeral:true});
 }
};