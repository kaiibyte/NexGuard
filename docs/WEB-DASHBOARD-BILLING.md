# NexGuard dashboard and billing implementation plan

The bot-side security and moderation features live in the Node.js application. A production web dashboard requires a separately deployed HTTPS web service and persistent session storage.

## Required production components
- Discord OAuth2 authorization-code flow with state/PKCE, strict redirect URI allowlist, secure HttpOnly cookies, CSRF protection, and server-side guild permission checks.
- Dashboard API that only exposes guilds where the logged-in user has Manage Guild or Administrator, and only allows configuration changes they are authorized to make.
- Owner console protected by a separate owner allowlist and MFA.
- Billing adapter for a selected payment provider. Never trust browser success redirects; verify signed provider webhooks, event IDs, amount, currency, product, and payment state server-side before granting entitlements.
- Subscription lifecycle: pending, active, past_due, cancelled, expired; idempotent webhook processing; renewal and refund handling; immutable payment audit records.
- Public status page, docs, support form, health checks, metrics, and incident history.

## Deployment blockers
No domain, OAuth client secret, payment provider, webhook signing secret, or hosting target has been supplied. Those credentials must be added as deployment secrets, never committed to Git. This repository deliberately does not fake successful payments or grant premium from a client-side callback.

## Current implementation boundary
The Discord bot already has owner-only manual premium grant/revoke. This document specifies the safe integration contract; it is not claiming that OAuth, a website, or payment processing is already live.
