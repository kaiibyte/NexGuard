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
3. Enable **Server Members Intent** and **Message Content Intent** under Privileged Gateway Intents.
4. Copy the Application ID.
5. Invite with the `bot` and `applications.commands` scopes.
6. Grant only the permissions you use: View Channels, Send Messages, Read Message History, View Audit Log, Ban Members, Kick Members, Moderate Members, Manage Messages, Manage Channels, and Manage Roles. Do not grant Administrator by default.
7. Put NexGuard's bot role above any roles it must assign or moderate.

## Environment
Copy `.env.example` to `.env` and fill in `DISCORD_TOKEN` and `CLIENT_ID`. Optionally set `GUILD_ID` for fast test-server command updates, `LOG_CHANNEL_ID` for moderation/security logs, and `BOT_OWNER_ID` for the private owner control center. Set it to your Discord user ID. Never commit `.env`.

## Run
```bash
npm run deploy:commands
npm start
```
Use `npm run dev` while developing. SQLite data is stored in `data/` and ignored by Git.

## First test
1. Run `/ping` and `/help`.
2. Configure a log channel in `LOG_CHANNEL_ID`, restart the bot, and test a warning in a private server.
3. Configure `/automod` and `/welcome`.
4. Create a test backup with `/backup create`, inspect it with `/backup list`, and use `/restore` preview before applying anything.
5. Confirm audit-log alerts appear after test actions.

## Important limitations
The anti-spam module is an in-memory threshold and resets on restart. Audit-log detection alerts owners but does not automatically remove permissions or punish administrators. Backup restore currently recreates missing supported roles, categories and channels; it does not restore deleted messages, permission overwrites, integrations, webhooks, or every server setting. Recovery is best-effort, not a universal undo. Test in a private server before inviting the bot to a community. See `FEATURES.md` and `SECURITY.md`.
