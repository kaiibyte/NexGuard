// NexGuard bootstrap entry point
// Loads environment variables, then starts the main Discord bot.

require("dotenv").config();

console.log("🍓 NexGuard Bootstrap starting...");
console.log("Token present:", Boolean(process.env.DISCORD_TOKEN));

if (!process.env.DISCORD_TOKEN) {
  console.error("Missing DISCORD_TOKEN. Add it to your hosting environment variables.");
  process.exit(1);
}

console.log("🚀 Starting NexGuard...");
require("./src/index.js");
