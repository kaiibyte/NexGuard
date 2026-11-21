# NexGuard Architecture

- src/index.js: startup, command/event loading, shutdown.
- src/config.js: environment configuration.
- src/commands/: one slash command per file.
- src/events/: Discord gateway event handlers.
- src/database/: SQLite persistence.
- src/utils/: shared permission and logging helpers.

## Extension rules
- Validate permissions and role hierarchy on every moderation action.
- Keep premium entitlements server-side; never trust a client-side premium flag.
- Add migrations when database schemas change.
- Minimize stored personal data and define retention periods.
- Test destructive automation before enabling it on real servers.
