# Phase 31B — Data Safety Center UX Spec

## Status

```text
PHASE31B_DATA_SAFETY_UX_DESIGN_STATUS: COMPLETED_DATA_SAFETY_UX_DESIGN_GATE
PHASE31B_DESIGN_SCOPE: DESIGN_ONLY_NO_RUNTIME_BACKUP_RESTORE_SYNC_CLOUD_OR_BACKEND
```

This UX spec is a design-only output. No runtime implementation. No storage writes. No sync/cloud/backend. No telemetry. No production-visible UI changes in Phase 31B.

## UX goal

Surface the app's local-first data storage model in the UI so users understand where their data lives, how to back it up manually, and what the known risks and limitations are — before data loss occurs.

## User problem

Limited beta users currently receive out-of-band caveats about localStorage data safety (Phase 30B conditions). Without an in-app explanation:
- Users may assume data is automatically synced or backed up.
- Users may be surprised by data loss if browser storage is cleared.
- Users may not know how to export or import their flashcard data.
- Users may not understand why restore can overwrite all current data.

The Data Safety Center / Local Backup Center panel directly addresses this gap.

## Design principles

1. **Honest and bounded**: Every claim must be accurate. No guarantees of data safety, no implied server backups.
2. **User-first**: Explain technical concepts (localStorage, browser scope) in plain, user-readable language.
3. **Conservative default**: When in doubt, show less functionality and more explanation. Don't imply capabilities that don't exist.
4. **Local-first**: Reinforce that all data is local. No cloud, no sync, no server.
5. **Action-oriented**: Where applicable, surface a clear action (export backup, import backup) with appropriate caution.
6. **Accessible**: Copy must be readable. Avoid jargon. Prefer short sentences.
7. **No over-claiming**: No claim of BETA_READY, public production readiness, guaranteed data-loss prevention, or BYOC/WebDAV/P2P availability.

## Information architecture

```
Settings
└── Data Safety (collapsible section)
    ├── Overview card
    │   └── Local-first storage model explanation
    ├── Local Backup Center
    │   ├── Export backup action placeholder
    │   ├── Import preview action placeholder
    │   └── Last backup status (read-only, timestamp if available)
    ├── Restore caution block
    │   └── Warning about restore overwrite risk
    ├── Backup reminder concept
    │   └── Prompt to export if no recent backup
    ├── Storage/browser limitation explanation
    │   └── localStorage quota, browser scope, clearing risk
    ├── Evidence gaps / beta limitations panel
    │   └── Known limitations and open evidence gaps
    └── Help / FAQ block
        └── Q&A about data safety, export, import, local storage
```

The settings panel section (Surface A) is the primary architecture for Phase 31C prototype.

## Candidate screen sections

### Readiness/status summary

A brief status banner at the top of the Data Safety section. Includes:
- Current readiness status: "Limited beta candidate — not yet BETA_READY."
- Link to evidence gaps panel for details.
- No positive readiness claims.

### Local data explanation

A card or block that explains:
- "Your flashcard data is stored locally in your browser using browser storage (localStorage)."
- "This means your data is on your device, not on any server."
- "We do not sync your data to any server or cloud service."
- "If you clear your browser data, your flashcard data may be lost."
- "To keep your data safe, export a backup regularly."

### Export backup action placeholder

A section with:
- Label: "Export your data" or "Back up your data."
- Description: "Download a copy of your flashcard data as a backup file."
- Action button placeholder: "Export backup" (entry point only; triggers existing export flow; no new export behavior in Phase 31B).
- Last backup timestamp display (read-only, from localStorage if available; empty state if no backup yet).

### Import preview action placeholder

A section with:
- Label: "Import a backup" or "Restore from backup."
- Description: "Import a previously exported backup file to restore your flashcard data."
- Action button placeholder: "Import backup" (entry point only; triggers existing import-with-preview flow; no new import behavior in Phase 31B).
- Caution note: "Importing a backup will replace your current data. This action cannot be undone."

### Restore caution block

A prominent warning block displayed before any restore action. Includes:
- Warning icon or visual indicator.
- "Restoring from a backup will overwrite all your current flashcard data."
- "This action cannot be undone."
- "Make sure you have exported a backup of your current data before restoring."
- Confirmation requirement (design-only; actual confirmation behavior in Phase 31C or later).

### Backup reminder concept

A conditional prompt displayed when no recent export is detected. Includes:
- "You have not exported a backup recently."
- "We recommend exporting a backup before closing your browser."
- Prompt to export (entry point only; triggers existing export flow).
- Design-only in Phase 31B; read-only localStorage check deferred to Phase 31C.

### Storage/browser limitation explanation

A section explaining browser storage constraints. Includes:
- "This app uses browser storage (localStorage) to store your data."
- "Browser storage is limited. If you add many large decks, you may approach the storage limit."
- "If browser storage is cleared (by you, by your browser, or by a device reset), your data may be lost."
- "There is no automatic backup. Export your data regularly to protect it."
- Storage quota note (read-only; no runtime quota check in Phase 31B).

### Evidence gaps / beta limitations panel

A disclosure panel listing known limitations. Includes:
- "This is a limited beta version. Some features are not yet fully tested."
- List of open evidence gaps (restore rehearsal blocked, adapter-awareness browser lane blocked, etc.).
- "Data recovery from a failed restore has not been rehearsed in a live browser environment."
- "This panel reflects current evidence status and will be updated as evidence is collected."
- No positive BETA_READY claim.

### Help / FAQ block

A collapsible FAQ block. Required Q&A pairs:
- Q: "Is my data safe?" — A: "Your data is stored locally. We cannot guarantee it will not be lost if browser storage is cleared. Export regularly."
- Q: "Does this app sync my data to the cloud?" — A: "No. All data is local. There is no cloud sync."
- Q: "What happens if I clear my browser data?" — A: "Your flashcard data may be lost. Export a backup before clearing browser data."
- Q: "Can I transfer my data to another device?" — A: "Export a backup and import it on the other device. There is no automatic device transfer."
- Q: "Does this app collect analytics?" — A: "No external analytics or telemetry are collected in this version."

## State model

| State | Trigger | Display |
|---|---|---|
| Empty | No export history in localStorage | Show "No backup yet" message; show export prompt; no timestamp |
| Has backup | Export timestamp in localStorage | Show last export date; show "Back up again" prompt; show export entry point |
| Error | Export or import failed | Show error message; offer retry; do not claim data was saved |
| Disabled/default-off | Feature behind a default-off flag | Panel hidden or placeholder shown; no partial functionality visible |
| Quota warning | Approaching localStorage limit | Warn user; suggest export; no automatic cleanup |
| Restore caution | User initiates restore | Show caution block; require confirmation; no execution in Phase 31B |
| Loading | Reading localStorage for last export timestamp | Show loading indicator or empty placeholder; no spinner required in design |

All state transitions are design-only in Phase 31B. Runtime state management is deferred to Phase 31C or later.

## Copy rules

1. Never claim data is "safe," "secure," or "protected" without qualification.
2. Never imply automatic backup, cloud sync, or server storage.
3. Always use "browser storage" or "localStorage" when referring to local storage, not "our servers" or "the cloud."
4. Always include restore risk warning before any restore action.
5. Always disclose known beta limitations in the evidence gaps panel.
6. Keep sentences short. Prefer active voice.
7. Vietnamese-first: all copy must be translatable and free of English idioms that don't translate.
8. Use "export" for backup action and "import" for restore action to maintain consistency with existing UX.

## Warning patterns

Required warning patterns for the Data Safety Center:

**Restore overwrite warning** (HIGH severity):
```
⚠ Restoring from a backup will replace all your current data.
This cannot be undone.
Export a backup of your current data before restoring.
```

**No automatic backup warning** (MEDIUM severity):
```
This app does not back up your data automatically.
Export your data regularly to protect it.
```

**Beta limitations warning** (MEDIUM severity):
```
This is a limited beta version.
Some features have not been fully tested in all browser environments.
See known limitations below.
```

**Local storage clearing risk warning** (MEDIUM severity):
```
If you clear your browser data, your flashcard data may be lost.
Export a backup before clearing browser data.
```

All warning patterns are design-only in Phase 31B.

## Evidence and instrumentation boundaries

Phase 31B defines the following evidence boundaries:

**Allowed in Phase 31C prototype**:
- Read-only display of last export timestamp from existing localStorage key (if key already exists; no new writes).
- Design-only rendering of state model (empty, has backup, error, disabled).
- Generated/test-only data for any evidence run.

**Not allowed in Phase 31B or Phase 31C unless separately gated**:
- New localStorage writes from Data Safety Center UI.
- New localStorage keys created by Phase 31B or 31C code.
- Real learner data in any prototype evidence run.
- Telemetry or analytics events.
- Instrumentation that sends data to any external service.

## Accessibility notes

1. All warning blocks must have visible, readable contrast (not color-only indicators).
2. FAQ collapsible sections must be keyboard-navigable.
3. Action buttons must have descriptive labels (not just "Click here").
4. Restore caution block must not be dismissible without explicit user acknowledgment.
5. Evidence gaps panel must be readable by screen readers.
6. Copy must be readable at standard font sizes without horizontal scrolling.

## Prototype constraints

Phase 31C prototype must operate under the following constraints:

- No real backup/export/restore behavior changes. Existing flow is entry-point only.
- No storage writes from new Data Safety Center UI code.
- No new localStorage keys created by Phase 31B or 31C prototype code.
- No sync/cloud/backend. All data remains local.
- No telemetry. No analytics events.
- No production navigation change unless explicitly scoped in Phase 31C gate.
- Use generated/test-only copy and fixtures if any prototype evidence run needs data.
- Default-off flag required. Prototype must not be visible in production without explicit activation.
- Rollback plan required. If regression detected, flag is disabled and settings page reverts to Phase 31A baseline.

## Out of scope

The following are explicitly out of scope for Phase 31B and Phase 31C prototype:

- Cloud sync / server-based backup.
- BYOC (Bring Your Own Cloud) / WebDAV encrypted backup.
- P2P / WebRTC device-to-device transfer.
- Automatic backup scheduling.
- Guaranteed data-loss prevention.
- Restore execution or restore rehearsal.
- Real learner data handling in any prototype.
- Telemetry or analytics.
- Built-in AI / OCR / API-key / BYOK behavior.
- Backend account, authentication, or authorization.
- Broad beta release or public production readiness.
- BETA_READY advancement.
- Dedicated route (`/data-safety` or `/backup`) — deferred to a later phase.
- Dashboard section (Surface B) — deferred until primary surface is proven.

## Handoff to Phase 31C

Phase 31C receives:
- This UX spec.
- Phase 31B design gate doc: `docs/planning/phase31b-data-safety-ux-design-gate.md`.
- Phase 31B release summary: `docs/release/phase31b-data-safety-ux-design-gate-summary.md`.
- Phase 31C seed: `docs/planning/phase31c-data-safety-ux-prototype-seed.md`.

Phase 31C is a separate prototype gate and is not automatically approved by Phase 31B.

Phase 31C must use Surface A (settings panel section) as the primary prototype surface. Phase 31C must operate behind a default-off flag. Phase 31C must not approve BETA_READY, sync/cloud/account/auth/backend, or BYOC/WebDAV/P2P/device-transfer.

Next recommended phase: Phase 31C — Data Safety UX Prototype.
Phase 31C is a separate prototype gate and is not automatically approved.
Phase 31B confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 31B does not approve BETA_READY.
Phase 31B does not approve public production readiness.
Phase 31B does not approve guaranteed data-loss prevention.
Phase 31B does not approve restore execution.
Phase 31B does not approve production restore rehearsal.
Phase 31B does not approve real learner data restore rehearsal.
Phase 31B does not approve runtime backup/export/restore changes.
Phase 31B does not approve backup file format changes.
Phase 31B does not approve restore overwrite behavior changes.
Phase 31B does not approve storage migration.
Phase 31B does not approve sync/cloud/account/auth/backend.
Phase 31B does not approve telemetry/analytics.
Phase 31B does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 31B does not approve BYOC/WebDAV/P2P/device-transfer implementation.
