const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  Options
} = require("discord.js");

const fs = require("node:fs");
const path = require("node:path");
const config = require("./config");
const database = require("./database");
const scheduler = require("./services/backup-scheduler");

// Keep Discord.js caches small for low-RAM hosting.
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
  makeCache: Options.cacheWithLimits({
    MessageManager: 0,
    GuildMemberManager: 25,
    ThreadMemberManager: 0,
    PresenceManager: 0,
    ReactionManager: 0,
    VoiceStateManager: 0,
    StageInstanceManager: 0,
    GuildScheduledEventManager: 0
  }),
  sweepers: {
    messages: {
      interval: 300,
      lifetime: 60
    }
  }
});

client.commands = new Collection();

for (const file of fs.readdirSync(path.join(__dirname, "commands")).filter(file => file.endsWith(".js"))) {
  const command = require(path.join(__dirname, "commands", file));
  client.commands.set(command.data.name, command);
}

for (const file of fs.readdirSync(path.join(__dirname, "events")).filter(file => file.endsWith(".js"))) {
  const event = require(path.join(__dirname, "events", file));
  const handler = (...args) => event.execute(...args, client);
  if (event.once) client.once(event.name, handler);
  else client.on(event.name, handler);
}

process.on("unhandledRejection", error => console.error("Unhandled rejection:", error));

function shutdown() {
  scheduler.stop();
  database.close();
  client.destroy();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

client.login(config.token()).catch(error => {
  console.error("Login failed. Check DISCORD_TOKEN and bot settings:", error.message);
  process.exit(1);
});
