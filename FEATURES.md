# NexGuard Feature Roadmap

> Status: expanding MVP. A checked item has code in the repository, but still needs live Discord testing. A planned item is not implemented yet.

## Free edition
### Moderation
- [x] /ban, /unban, /kick, /timeout, /untimeout
- [x] /warn, /warnings, /clearwarnings, /purge
- [x] /lock, /unlock
- [x] /report
### Automod
- [x] Basic anti-spam rate threshold (in-memory; resets on restart)
- [x] Configurable anti-link toggle
- [x] Configurable blocked-word list
- [x] Mention limit and excessive-caps checks
- [ ] Invite allowlists and per-channel exemptions
- [ ] Configurable warning/escalation ladder and advanced flood detection
### Server protection and logs
- [x] Member join/leave logs
- [x] Welcome/goodbye channel and auto-role configuration
- [x] Message edit/delete logs when Discord provides cached content
- [x] Audit-log alerts for channel/role deletion, bans, kicks, role/channel changes and webhook changes
- [x] Owner alert after repeated destructive audit actions (alert only; no automatic punishment)
- [ ] Reliable anti-raid join velocity detection and configurable lockdown
- [ ] Automatic safe response policies and trusted-admin allowlists
- [ ] Bot-add / permission escalation detection with actor confidence scoring
### Utilities
- [x] /ping, /help, /userinfo, /serverinfo, /avatar, /stats
- [x] /automod configuration
- [x] /welcome configuration
- [x] /backup create and /backup list
- [x] /restore preview and owner/admin-confirmed best-effort restore

## Premium edition
- [ ] Advanced anti-raid and configurable thresholds
- [ ] Anti-nuke automatic containment policies
- [ ] Scheduled automatic backups and retention controls
- [ ] Full role/channel permission overwrite restoration and position reconciliation
- [ ] Recovery of additional supported server settings
- [ ] Custom automod rules, warning thresholds, temp bans and scheduled moderation
- [ ] Staff activity reports, moderation statistics and exportable reports
- [ ] Custom embeds, welcome templates and images
- [ ] Premium feature gating and self-service entitlements

## Owner / operator
- [x] Manual per-server premium grant/revoke command (host must set BOT_OWNER_ID and BOT_OWNER_KEY)
- [x] Per-server premium status
- [ ] Web-based owner dashboard, guild directory, global announcements and maintenance controls
- [ ] Health monitoring, error reporting and audit dashboard

## Website and billing
- [ ] Landing page and Add to Discord flow
- [ ] Discord OAuth and server dashboard
- [ ] Monthly/yearly subscription plans
- [ ] Payment provider integration with server-side webhook verification
- [ ] Automatic activation, expiration, renewals and payment history
- [ ] Documentation, support and public status pages

## Recovery limitations
Backups cover a best-effort subset of server structure. Restore currently recreates missing roles/categories/channels; it does not restore deleted messages, guarantee permission overwrite recovery, restore integrations/webhooks, or reverse every Discord setting. Preview before applying and keep backups outside the bot host too.