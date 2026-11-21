module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`🛡️ NexGuard online as ${client.user.tag}`);
    console.log(`Serving ${client.guilds.cache.size} server(s).`);
    client.user.setActivity("MODERATE • PROTECT • SECURE");
  }
};
