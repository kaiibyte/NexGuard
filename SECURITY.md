# NexGuard Security Design

## Goals
NexGuard should help server owners detect destructive activity, preserve evidence, and recover supported server configuration where possible. It must not promise a universal undo function.

## Anti-nuke detection
Planned signals include:
- Unusually high channel or category deletions/creations.
- Unusually high role deletions or permission changes.
- Bursts of bans or kicks.
- Webhook changes and suspicious bot additions.
- Dangerous server configuration changes.

Use Discord audit-log entries to attribute actions where possible. Attribution can be delayed, incomplete, or unavailable; correlate events carefully and retain uncertainty in incident reports.

## Response safeguards
- Configure thresholds per server rather than using one aggressive global threshold.
- Allow owners to define trusted users and protected roles.
- Prefer alerting and temporary containment before irreversible punishment.
- Never automatically punish an actor based only on an uncertain attribution.
- Record what triggered a response and which actions the bot took.
- Require appropriate permissions and role hierarchy; do not request Administrator by default if narrower permissions work.

## Backup and recovery
Backups should capture supported guild structure and configuration before an incident. Recovery should:
1. Preserve incident evidence and the latest available backup.
2. Show the owner what can and cannot be restored.
3. Recreate supported channels, categories, and roles.
4. Restore supported permission overwrites and role settings where Discord permits.
5. Record every recovery action and any failure.

### Important limitations
- Discord has no universal server rollback or undo endpoint.
- Deleted messages cannot be restored by the bot.
- Some webhooks, integrations, external app state, and settings may not be recoverable.
- Restoring positions, permissions, and other configuration may be limited by Discord API rules, permissions, and role hierarchy.
- A backup only helps if it exists and is recent enough. Schedule and verify backups.

## Secrets and data
- Store bot tokens, OAuth secrets, database credentials, and payment-provider secrets in environment variables or a secrets manager.
- Never commit secrets to Git, logs, screenshots, or client-side code.
- Use least-privilege Discord permissions and restrict access to operational dashboards.
- Protect stored backups and logs; define retention and deletion policies.
- Validate all interaction inputs and enforce authorization server-side.

## Premium and payment security
- Never grant premium based solely on a client-side flag or success redirect.
- Verify provider events server-side, validate signatures, and make webhook processing idempotent.
- Keep entitlement changes in trusted backend code.
- Log manual owner grants and revocations.

## Incident handling
Document detection time, relevant audit-log evidence, actor attribution confidence, automated actions, owner notifications, recovery attempts, and unresolved damage. Avoid claiming an action was reversed unless Discord confirms the resulting state.
