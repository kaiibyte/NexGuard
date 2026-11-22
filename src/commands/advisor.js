const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const settings = require("../services/guild-settings");
const config = require("../config");
module.exports={
 data:new SlashCommandBuilder().setName("advisor").setDescription("Ask NexGuard's built-in security advisor a question.")
 .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
 .addStringOption(o=>o.setName("question").setDescription("What would you like help securing?").setRequired(true).setMaxLength(300)),
 async execute(i){
  const q=i.options.getString("question",true).toLowerCase(), cfg=settings.get(i.guildId), guild=i.guild;
  let title="NexGuard Security Advisor", advice=[];
  if(q.includes("raid")||q.includes("join")){
   title="Protecting against join raids";
   advice=["Keep anti-raid detection enabled and review the join log when many accounts arrive together.","Use /verification setup with a dedicated unverified role and a public verification channel.","Set channel permissions so the unverified role cannot view normal server channels.","Treat young account age as a warning signal, not proof that an account is malicious."];
  }else if(q.includes("nuke")||q.includes("admin")||q.includes("permission")){
   title="Protecting administrator permissions";
   advice=["Enable /security antinuke enabled:true and configure a threshold appropriate for your server.","Enable /security lockdown enabled:true if you want NexGuard to attempt emergency channel lockdown after a trigger.","Keep trusted-admin exemptions limited to people you genuinely trust.","Give NexGuard View Audit Log, Ban Members, and Manage Roles; keep its role above the staff roles it must act on.","Review powerful @everyone permissions and avoid giving Administrator to bots unnecessarily."];
  }else if(q.includes("backup")||q.includes("recover")||q.includes("restore")){
   title="Backup and recovery";
   advice=["Run /backup create before major server changes and keep multiple recent snapshots.","Use /backup list to find a snapshot, then /restore with confirm:false to preview.","Only use confirm:true after reviewing the preview. Recovery is best-effort and cannot restore deleted messages or every Discord setting.","Restrict backup and restore commands to trusted administrators."];
  }else if(q.includes("spam")||q.includes("automod")||q.includes("link")){
   title="Reducing spam and harmful content";
   advice=["Use /automod status to inspect current filters.","Enable anti-link and anti-invite filters only if they fit your community rules.","Set a reasonable mention limit and keep blocked-word rules specific to avoid false positives.","Use a dedicated security log channel so moderators can review automated actions."];
  }else{
   advice=["Use /recommendations for a live security score and server-specific findings.","Use /incidents to review recent anti-nuke alerts.","Use /case list to review a member's moderation history.","Use /verification setup to add a button-based new-member gate.","Run /backup create regularly and preview recovery before applying it."];
  }
  const embed=new EmbedBuilder().setColor(0x7c3aed).setTitle(title).setDescription(advice.map((x,n)=>"**"+(n+1)+".** "+x).join("\n\n")).setFooter({text:"Built-in rule-based advisor • No external AI service or automatic server changes"}).setTimestamp();
  return i.reply({embeds:[embed],ephemeral:true});
 }
};