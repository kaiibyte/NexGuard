# 🛡️ NexGuard
**Advanced Discord Moderation & Security Bot**

**MODERATE • PROTECT • SECURE**

NexGuard is planned as an all-in-one Discord bot focused on reliable moderation, configurable automod, server protection, security monitoring, and incident recovery.

## Project status
🚧 **Early development / planning.** Features in the roadmap are planned and are not yet represented as working commands. This repository is private.

## Planned editions
- **Free:** Essential moderation, automod, server safety alerts, welcome tools, and basic logs.
- **Premium:** Advanced security automation, anti-nuke safeguards, configurable recovery backups, deeper audit reporting, and customization.

See [FEATURES.md](FEATURES.md) for the roadmap and [SECURITY.md](SECURITY.md) for the security design.

## Core principles
- Least-privilege permissions wherever possible.
- Secure handling of bot tokens and payment credentials.
- Clear moderation logs and accountable actions.
- Conservative automated responses to reduce false positives.
- No claim of recovery unless the operation is verified.

## Current MVP
The repository now contains a Node.js / Discord.js starter bot with slash-command registration, SQLite warning storage, moderation commands, a basic in-memory anti-spam threshold, and optional moderation logs. These components still need installation and live Discord testing before production use.

See [docs/SETUP.md](docs/SETUP.md) to configure and run the bot, and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the code layout.

Hosting, dashboard, and payment provider have not yet been selected.

**Never commit bot tokens, passwords, API keys, database credentials, or payment secrets.** Use environment variables and the hosting provider's secret manager.

## License
This project is proprietary. See [LICENSE](LICENSE). No public license or permission to reuse the source code is granted.
