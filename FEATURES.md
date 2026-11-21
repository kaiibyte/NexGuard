# NexGuard Feature Roadmap

> Status: early MVP. Checked items have initial code in the repository but still require installation and live-server testing. Unchecked items remain planned.

## Free edition

### Moderation
- [x] /ban and /unban
- [x] /kick
- [x] /timeout and /untimeout
- [x] /warn and /warnings
- [x] /clearwarnings and /purge (separate commands)
- [x] /lock and /unlock

### Automod
- [x] Basic in-memory anti-spam threshold (not advanced anti-flood)
- [ ] Anti-link filtering with configurable allowlists
- [ ] Bad-word filter
- [ ] Mention-spam protection
- [ ] Excessive-caps detection
- [ ] Configurable warnings and escalation actions

### Server protection
- [ ] Join and leave alerts
- [ ] Basic anti-raid detection
- [ ] Suspicious-account signals
- [ ] Invite filtering
- [ ] Bot-add alerts
- [ ] Mass-mention protection
- [ ] Basic dangerous-action alerts

### Logs and utilities
- [x] Basic moderation action logs (configured log channel)
- [ ] Member join/leave logs
- [ ] Message edit/delete logs where Discord makes the event available
- [ ] /userinfo, /serverinfo, /avatar, /ping, /help

### Welcome
- [ ] Custom welcome and goodbye messages
- [ ] Welcome embeds
- [ ] Configurable welcome channel
- [ ] Optional automatic member roles

## Premium edition

### Advanced security and anti-nuke
- [ ] Configurable anti-raid thresholds
- [ ] Mass-channel deletion detection
- [ ] Mass-role deletion detection
- [ ] Mass-ban and mass-kick detection
- [ ] Dangerous permission-change alerts
- [ ] Webhook deletion and creation monitoring where supported
- [ ] Suspicious bot-add and privilege escalation alerts
- [ ] Configurable response policies and trusted-admin safeguards

### Server backup and recovery
- [ ] Scheduled snapshots of supported server structure and configuration
- [ ] Incident-time snapshot and evidence preservation
- [ ] Recreate supported channels, categories, and roles
- [ ] Restore supported permission overwrites and role settings
- [ ] Recovery preview and owner confirmation option
- [ ] Recovery activity report and audit trail

Recovery is best-effort. Discord does not provide a universal undo function. Deleted messages cannot be restored by the bot, and some resources or settings may not be recoverable. See SECURITY.md.

### Advanced moderation
- [ ] Custom automod rules
- [ ] Advanced punishment automation
- [ ] Custom warning thresholds
- [ ] Temporary bans
- [ ] Scheduled moderation actions
- [ ] Advanced moderation reports

### Advanced logging and customization
- [ ] Detailed audit-log views
- [ ] Custom log categories
- [ ] Staff activity reports
- [ ] Moderation statistics and exportable reports
- [ ] Custom embeds and bot responses
- [ ] Custom welcome images and templates

## Owner / operator tools
- [ ] Owner-only control panel
- [ ] Manually grant and revoke premium
- [ ] View premium servers and subscription status
- [ ] Bot and guild statistics
- [ ] Global announcements
- [ ] Maintenance mode
- [ ] System health monitoring

## Website and billing
- [ ] Product landing page and Add to Discord flow
- [ ] Discord OAuth login
- [ ] Server dashboard
- [ ] Premium plans and subscription management
- [ ] Server-side payment verification
- [ ] Automatic premium activation and expiration
- [ ] Renewal and payment history
- [ ] Documentation, support, and service status pages

Payment status must never be trusted from a browser redirect or client-side value. Verify payments server-side with the selected provider before changing entitlements.
