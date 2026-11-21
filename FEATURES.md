# NexGuard Feature Roadmap

> Status key: **Implemented in code** means code exists but is not yet proven in a live Discord server. **External setup required** means credentials, hosting, or a provider are still needed. Nothing is marked production-ready without testing.

## Free edition
### Moderation
- [x] /ban, /unban, /kick, /timeout, /untimeout
- [x] /warn, /warnings, /clearwarnings, /purge
- [x] /lock, /unlock, /report
- [x] /userinfo, /serverinfo, /avatar, /ping, /help, /stats
### Automod
- [x] Basic anti-spam rate threshold
- [x] Configurable anti-link and Discord invite filtering
- [x] Blocked-word list, mention threshold, caps threshold
- [x] Trusted-role exemptions
- [ ] Invite allowlist and per-channel exemptions
- [ ] Persistent escalation ladder, flood detection and temp bans
### Community and logs
- [x] Welcome/goodbye channel and auto-role configuration
- [x] Member join/leave, cached message edit/delete logs
- [x] Moderation/security audit logging
- [x] Basic join-spike and new-account-age risk alerts
- [ ] Configurable raid thresholds, bot-add review workflow and per-channel log routing
### Backup
- [x] Manual backup create/list and restore preview
- [x] Best-effort recreation of missing roles/categories/channels
- [ ] Full permission overwrite restoration, position reconciliation, channel topic/slowmode/NSFW completeness
- [ ] External encrypted backup storage and retention UI

## Premium edition
- [x] Configurable anti-nuke detection threshold and trusted-admin allowlist
- [x] Optional conservative automatic text-channel lockdown after threshold
- [x] Scheduled backup interval setting (6/12/24h) and periodic scheduler
- [ ] Premium feature gating across every premium command and configuration
- [ ] Full backup fidelity and safe interactive restore confirmation
- [ ] Advanced custom automod rules, warning ladders, scheduled moderation and temp bans
- [ ] Staff activity reports, moderation analytics and export
- [ ] Custom embeds, welcome templates and images
- [ ] Self-service subscription entitlement lifecycle

## Owner / operator
- [x] Owner-only manual per-server premium grant/revoke and status
- [ ] Web owner dashboard, guild directory, global announcements, maintenance controls
- [ ] Health monitoring, structured error reporting and audit dashboard

## Website and billing
- [ ] Landing page and Add to Discord flow
- [ ] Discord OAuth and server dashboard
- [ ] Monthly/yearly plans
- [ ] Payment-provider adapter and verified signed webhook
- [ ] Activation, expiration, renewal, refund and payment history
- [ ] Docs, support and public status pages
- [x] Secure integration requirements documented in docs/WEB-DASHBOARD-BILLING.md

## Safety and recovery limits
Discord does not provide a universal undo. Deleted messages cannot be restored. Audit-log actor attribution may be delayed or unavailable. Automatic lockdown only blocks @everyone sending messages in standard text/announcement channels; it does not remove roles or ban users. Restore is best-effort and must be previewed. Keep off-host backups before trusting recovery.
