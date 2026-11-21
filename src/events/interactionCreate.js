const db=require("../database");const {ownerId}=require("../config");
module.exports={name:"interactionCreate",async execute(interaction){
 if(!interaction.isChatInputCommand())return;
 if(db.getBlacklist("user",interaction.user.id))return interaction.reply({content:"You are blocked from using NexGuard commands.",ephemeral:true}).catch(()=>null);
 if(interaction.guildId&&db.getBlacklist("guild",interaction.guildId))return interaction.reply({content:"This server is blocked from using NexGuard.",ephemeral:true}).catch(()=>null);
 if(db.getOwnerSetting("maintenance")==="true"&&interaction.user.id!==ownerId&&interaction.commandName!=="help")return interaction.reply({content:"NexGuard is temporarily in maintenance mode. Please try again later.",ephemeral:true}).catch(()=>null);
 const command=interaction.client.commands.get(interaction.commandName);if(!command)return interaction.reply({content:"That command is not available.",ephemeral:true}).catch(()=>null);
 try{await command.execute(interaction);}catch(error){console.error("Command error:",error);const payload={content:"Something went wrong while running that command. The error has been logged.",ephemeral:true};if(interaction.deferred||interaction.replied)await interaction.followUp(payload).catch(()=>null);else await interaction.reply(payload).catch(()=>null);}
}};