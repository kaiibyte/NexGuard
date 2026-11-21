# Set up NexGuard

## Requirements
- Node.js 20.11 or newer
- A Discord application and bot from the Discord Developer Portal

## Install
```bash
npm install
```

## Configure Discord
1. Create an application and add a Bot user.
2. Copy the bot token and keep it secret.
3. Enable Server Members Intent and Message Content Intent under Privileged Gateway Intents.
4. Copy the Application ID.
5. Invite with the bot and applications.commands scopes. Grant only required permissions: View Channels, Send Messages, Read Message History, Ban Members, Kick Members, Moderate Members, Manage Messages, and Manage Channels. Do not grant Administrator by default.

## Environment
Copy .env.example to .env and fill in DISCORD_TOKEN and CLIENT_ID. Optionally set GUILD_ID for fast test-server command updates and LOG_CHANNEL_ID for moderation logs. Never commit .env.

## Run
```bash
npm run deploy:commands
npm start
```
Use npm run dev while developing. SQLite data is stored in data/ and ignored by Git.

## Important
The anti-spam module is a simple in-memory message-rate threshold, not a complete raid defense system. It resets on restart. Test in a private server before inviting the bot to a community. Features in FEATURES.md are planned until implemented and tested.
