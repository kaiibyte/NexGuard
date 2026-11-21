const {SlashCommandBuilder,EmbedBuilder}=require("discord.js");
module.exports={data:new SlashCommandBuilder().setName("help").setDescription("Show NexGuard's available commands."),async execute(i){const e=new EmbedBuilder().setColor(0x7c3aed).setTitle("🛡️ NexGuard Help").setDescription("Moderation and server-security tools. Some advanced features remain in development.").addFields(
{name:"Moderation",value:"/ban • /unban • /kick • /timeout • /untimeout • /warn • /warnings • /clearwarnings • /purge • /lock • /unlock • /report"},
{name:"Automod and setup",value:"/automod • /welcome"},
{name:"Security and recovery",value:"/backup create • /backup list • /restore • /premium"},
{name:"Utilities",value:"/ping • /userinfo • /serverinfo • /avatar • /stats • /help"}
).setFooter({text:"MODERATE • PROTECT • SECURE"});return i.reply({embeds:[e],ephemeral:true});}};