const {record}=require("../services/anti-nuke");
const {log}=require("../utils/logger");
module.exports={name:"guildAuditLogEntryCreate",async execute(entry,guild){const actor=entry.executorId||"unknown";await log(guild,"Security audit: "+String(entry.action),`Actor: <@${actor}> (${actor})\nTarget: ${entry.targetId||"unknown"}\nAudit entry: ${entry.id}\nAudit attribution can be delayed; verify before acting.`,0xdc2626);await record(entry,guild).catch(error=>console.error("Anti-nuke handler:",error.message));}};
