require("dotenv").config();

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

module.exports = {
  token: () => required("DISCORD_TOKEN"),
  clientId: () => required("CLIENT_ID"),
  guildId: process.env.GUILD_ID || null,
  logChannelId: process.env.LOG_CHANNEL_ID || null,
  databasePath: process.env.DATABASE_PATH || "./data/nexguard.sqlite",
  spam: {
    maxMessages: Math.max(3, Number.parseInt(process.env.SPAM_MAX_MESSAGES || "6", 10)),
    windowMs: Math.max(3000, Number.parseInt(process.env.SPAM_WINDOW_SECONDS || "8", 10) * 1000),
    timeoutMinutes: Math.max(1, Number.parseInt(process.env.SPAM_TIMEOUT_MINUTES || "5", 10))
  }
};
