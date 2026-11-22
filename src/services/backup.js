const db = require("../database");
const { ChannelType } = require("discord.js");
async function capture(guild) {
  await guild.roles.fetch();
  await guild.channels.fetch();
  const snapshot = {
    guildId: guild.id, guildName: guild.name, createdAt: new Date().toISOString(),
    roles: guild.roles.cache.filter(r => r.id !== guild.id && !r.managed).map(r => ({ id:r.id, name:r.name, color:r.color, hoist:r.hoist, mentionable:r.mentionable, permissions:r.permissions.bitfield.toString(), position:r.position })),
    channels: guild.channels.cache.filter(c => c.type !== ChannelType.GuildCategory).map(c => ({ id:c.id, name:c.name, type:c.type, parentName:c.parent?.name || null, topic:c.topic || null, nsfw:!!c.nsfw, rateLimitPerUser:c.rateLimitPerUser || 0, permissionOverwrites:c.permissionOverwrites.cache.map(o => ({ id:o.id, type:o.type, allow:o.allow.bitfield.toString(), deny:o.deny.bitfield.toString() })) })),
    categories: guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).map(c => ({ id:c.id, name:c.name, position:c.position, permissionOverwrites:c.permissionOverwrites.cache.map(o => ({ id:o.id, type:o.type, allow:o.allow.bitfield.toString(), deny:o.deny.bitfield.toString() })) }))
  };
  const id = db.saveBackup(guild.id, snapshot);
  return { id, snapshot };
}
async function restore(guild, snapshot, dryRun = true) {
  const actions = [];
  const roleMap = new Map([[guild.id, guild.id]]);
  for (const role of snapshot.roles || []) {
    const existing = guild.roles.cache.find(r => r.name === role.name);
    if (existing) { roleMap.set(role.name, existing.id); continue; }
    actions.push("Create role: " + role.name);
    if (!dryRun) { const created = await guild.roles.create({ name:role.name, color:role.color, hoist:role.hoist, mentionable:role.mentionable, permissions:BigInt(role.permissions), reason:"NexGuard backup recovery" }); roleMap.set(role.id || role.name, created.id); }
  }
  const categoryMap = new Map();
  for (const category of snapshot.categories || []) {
    let existing = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === category.name);
    if (!existing) { actions.push("Create category: " + category.name); if (!dryRun) existing = await guild.channels.create({ name:category.name, type:ChannelType.GuildCategory, reason:"NexGuard backup recovery" }); }
    if (existing) { categoryMap.set(category.name, existing.id); if (!dryRun && category.permissionOverwrites?.length) { const overwrites=category.permissionOverwrites.map(o=>({id:roleMap.get(o.id)||o.id,allow:BigInt(o.allow),deny:BigInt(o.deny)})); await existing.permissionOverwrites.set(overwrites,"NexGuard backup recovery").catch(()=>null); } }
  }
  for (const channel of snapshot.channels || []) {
    const exists = guild.channels.cache.find(c => c.name === channel.name && c.type === channel.type);
    if (exists) continue;
    actions.push("Create channel: " + channel.name);
    if (!dryRun) {
      const options = { name:channel.name, type:channel.type, topic:channel.topic || undefined, nsfw:channel.nsfw, rateLimitPerUser:channel.rateLimitPerUser, parent:categoryMap.get(channel.parentName) || undefined, reason:"NexGuard backup recovery" };
      const created = await guild.channels.create(options);
      if (channel.permissionOverwrites?.length) { const overwrites=channel.permissionOverwrites.map(o=>({id:roleMap.get(o.id)||o.id,allow:BigInt(o.allow),deny:BigInt(o.deny)})); await created.permissionOverwrites.set(overwrites,"NexGuard backup recovery").catch(()=>null); }
    }
  }
  return actions;
}
module.exports = { capture, restore };