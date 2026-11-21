# 🛡️ NexGuard
**Discord Moderation & Server Security Bot**

**MODERATE • PROTECT • SECURE**

NexGuard is a Node.js / Discord.js bot project for moderation, automod, server safety alerts, welcome tools, audit logging, and best-effort server structure recovery.

## Project status
🚧 **Feature-rich MVP under development.** Core moderation commands and several security/configuration modules now have code in the repository. Nothing has been live-tested in a Discord server yet, and this is not production-ready.

## Editions
- **Free foundation:** moderation, basic automod, join/leave and message logs, welcome configuration, security alerts, utilities, and manual backups.
- **Premium roadmap:** advanced containment, scheduled backups, full recovery, reports, customization, premium gating, and billing. Premium access records exist, but paid subscriptions and feature gating are not implemented yet.

See [FEATURES.md](FEATURES.md) for the exact implementation checklist and [SECURITY.md](SECURITY.md) for safeguards and limitations.

## Current code
- Slash-command registration and SQLite persistence.
- Ban, unban, kick, timeout, warn, purge, lock and related moderation tools.
- Basic anti-spam, configurable link/word/mention/caps checks.
- Welcome/goodbye messages and automatic member role.
- Join/leave, message edit/delete, audit-log and webhook-change alerts.
- Join-spike and repeated destructive-action alerts (alert-only).
- Manual structure backups, recovery preview and best-effort recreation of missing roles/channels.
- Owner-only manual premium grant/revoke command.

## Important limitations
The bot has not yet been installed or tested in a live server. Anti-raid and anti-nuke alerts do not automatically punish users or lock down the server. Restore is partial: deleted messages, integrations, webhooks, and guaranteed permission-overwrite recovery are not supported. Website, OAuth dashboard, payment processing, scheduled backups, premium feature gating, and advanced recovery remain unfinished.

See [docs/SETUP.md](docs/SETUP.md) to configure and run the bot, and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the code layout.

**Never commit bot tokens, passwords, API keys, database credentials, or payment secrets.** Use environment variables and the hosting provider's secret manager.

## License
This project is proprietary. See [LICENSE](LICENSE). No public license or permission to reuse the source code is granted.
