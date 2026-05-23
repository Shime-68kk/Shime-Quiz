# Phase 25L — Backup Health Production UI Design Gate

## Status token

```
PHASE25L_BACKUP_HEALTH_PRODUCTION_UI_DESIGN_STATUS: COMPLETED_DESIGN_GATE
```

## Scope

Phase 25L is docs/design/static-validator/CI-only.
Phase 25L does not change runtime behavior.
Phase 25L does not implement Backup Health UI.
Phase 25L does not import or wire the Phase 25K prototype into production UI.
Phase 25L does not import or wire the Phase 25I signal layer into production UI.
Phase 25L does not modify Phase 25K prototype behavior.
Phase 25L does not modify Phase 25I signal layer behavior.
Phase 25L does not modify Phase 25G prototype behavior.
Phase 25L does not modify Phase 24E scaffold behavior.
Phase 25L does not implement production adapter-aware backup/export/restore.
Production backup/export/restore behavior remains unchanged by this patch.
Backup file format remains unchanged.
Restore overwrite behavior remains unchanged.
Current localStorage backup compatibility remains unchanged.
Default storage driver remains unchanged.
No IndexedDB.
No storage migration.
No sync/cloud/account/auth/backend.
No telemetry or analytics.
No BETA_READY.
Historical full-chain validators remain manual/local/scheduled audit guidance.
Full historical scripts/validate-*.js chain is not used as a Phase 25L merge-blocking requirement.

## Inputs

Phase 25K baseline:

```
PHASE25K_BACKUP_HEALTH_TEST_ONLY_DEFAULT_OFF_INTEGRATION_STATUS: COMPLETED_TEST_ONLY_DEFAULT_OFF_PROTOTYPE
PHASE25K_BACKUP_HEALTH_INTEGRATION_SCOPE: TEST_ONLY_DEFAULT_OFF_READ_ONLY_NO_UI_NO_WRITES
PHASE25K_BACKUP_HEALTH_INTEGRATION_DECISION: PASS_TO_PHASE25L_PRODUCTION_UI_DESIGN_GATE_ONLY
```

Phase 25I baseline:

```
PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_LAYER_STATUS: COMPLETED_THIN_READ_ONLY_SIGNAL_LAYER
PHASE25I_BACKUP_HEALTH_RUNTIME_SCOPE: READ_ONLY_NO_UI_NO_WRITES_NO_BACKUP_RESTORE_CHANGES
PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_DECISION: PASS_TO_PHASE25J_READ_ONLY_INTEGRATION_DESIGN_GATE
```

Phase 25K approved a test-only/default-off integration prototype (no production UI). Phase 25K explicitly passed to Phase 25L as a production UI design gate only. This phase honors that decision and defines the constraints under which a future Phase 25M limited/default-off UI prototype may proceed.

## Purpose

Phase 25L establishes a design gate for future production-visible Backup Health UI. It defines:

- What a future Phase 25M UI prototype may do (limited scope, default-off, read-only)
- What a future Phase 25M UI prototype must not do (broad rollout, writes, telemetry, backup behavior changes)
- The evidence plan Phase 25M must satisfy before any UI is claimed as user-facing
- The import, write, and backup/restore boundaries Phase 25M must honor
- Vietnamese-first copy requirements and accessibility requirements
- Rollback/removal plan so Phase 25M UI can be removed cleanly if needed

This design gate does not itself implement UI or change any runtime behavior.

## Design decision

```
PHASE25L_BACKUP_HEALTH_PRODUCTION_UI_DECISION: PASS_TO_PHASE25M_LIMITED_DEFAULT_OFF_UI_PROTOTYPE_WITH_STRICT_GATES
```

Phase 25L approves passing to Phase 25M under strict gates only.

Phase 25L does not approve:
- runtime Backup Health UI implementation
- production-visible Backup Health UI by default
- broad dashboard/settings/library rollout
- production adapter-aware backup/export/restore
- backup file format changes
- restore overwrite behavior changes
- IndexedDB production storage
- storage migration
- sync/cloud/account/auth/backend
- telemetry/analytics
- BETA_READY
- guaranteed data-loss prevention
- platform backup preservation claims
- automatic backup claims
- persistent backup health tracking writes

## Production UI boundary

The production UI boundary for Phase 25L is: no production-visible UI change.

Phase 25L itself makes zero changes to any src/ file, any route, any settings panel, any library card, any dashboard widget, or any navigation entry.

Any future Phase 25M UI must remain behind an explicit default-off gate. It must not be shown to users by default. It must not be wired into broad routes or navigation without a separate design gate.

## Allowed future Phase 25M UI prototype scope

A future Phase 25M limited/default-off UI prototype may proceed only under these constraints:

- default-off by default
- limited-surface prototype only
- read-only only
- local-only
- no writes
- no backup/export/restore behavior changes
- no backup file format changes
- no restore overwrite behavior changes
- no telemetry/analytics
- no sync/cloud/account/auth/backend
- no storage migration
- no IndexedDB production storage
- no BETA_READY
- must use calm Vietnamese-first copy
- must avoid alarmist language
- must show backup health as a reminder/status hint, not a guarantee
- may import Phase 25K prototype only if import gate passes
- must include unit tests, validator, strict reviewer, and tester if browser/user-facing behavior is claimed

## Forbidden future UI scope

The following are explicitly forbidden in any future Phase 25M:

- no production-visible UI by default without explicit gate
- no broad dashboard/settings/library rollout
- no navigation route by default
- no automatic backup claims
- no platform backup preservation claims
- no guaranteed data-loss prevention claims
- no scanning learner content
- no persistent tracking added to calculate health
- no production adapter-aware backup/export/restore
- no telemetry/analytics
- no account/cloud recovery copy

## Potential UI surfaces

Phase 25M may explore a limited subset of the following surfaces only under the constraints above:

- An opt-in backup health reminder hint visible only when an explicit opt-in gate is active
- A small status indicator in a developer/tester-only surface (not production-visible by default)
- A read-only display of the last backup timestamp derived from Phase 25I signal layer output

All of the above require the default-off gate to be explicitly active and must not be shown without user opt-in or developer/tester activation.

## No-go UI surfaces

The following UI surfaces are explicitly not approved for Phase 25M:

- A dashboard card visible to all users by default
- A settings panel with backup health controls wired into production settings
- A library modal or overlay showing backup health state
- A navigation entry leading to a backup health page
- Any modal, toast, or notification shown without explicit user opt-in
- Any banner or alert that implies data is at risk
- Any UI that claims automatic backup or platform backup preservation

## Copy and tone requirements

All future Phase 25M copy must:

- Be calm and non-alarmist
- Present backup health as a status reminder or hint, not a guarantee
- Avoid language that implies guaranteed data-loss prevention
- Avoid language that implies automatic backup is in progress
- Avoid language that implies the platform preserves backups independently of user action
- Use clear, plain language
- Not use technical jargon visible to end users

Forbidden copy patterns:
- "Your data is safe" (guarantee)
- "Automatic backup enabled" (automatic backup claim)
- "Backup preserved by Shime" (platform preservation claim)
- "Data loss will be prevented" (guarantee)
- "Backup health: Critical" (alarmist)

Acceptable copy patterns (subject to further review in Phase 25M):
- "Lần sao lưu gần nhất: [date]" (last backup: [date])
- "Bạn chưa sao lưu gần đây. Hãy xuất dữ liệu nếu muốn giữ an toàn." (reminder, not guarantee)

## Vietnamese-first copy requirements

All Phase 25M UI copy must be authored in Vietnamese first, then optionally adapted for other locales.

- Primary copy language: Vietnamese
- No English-only copy visible to Vietnamese-locale users
- All copy must be reviewed for cultural fit before any UI is claimed as user-facing
- Status hints must use natural Vietnamese phrasing, not literal translation from English

## Accessibility requirements

All future Phase 25M UI must:

- Meet WCAG 2.1 AA for any visible component
- Provide aria-label or aria-describedby for status indicators
- Not rely on color alone to convey backup health status
- Be keyboard navigable if interactive
- Not introduce motion/animation without prefers-reduced-motion check

These requirements must be verified in the Phase 25M evidence plan before any browser/user-facing behavior is claimed.

## Phase 25K prototype import boundary

Phase 25M may import `src/state/backupHealthIntegrationPrototype.js` only if:

- The import gate explicitly passes in Phase 25M's validator
- The import is used only to read state, not to trigger writes
- No production UI, route, settings, or navigation file imports the prototype by default
- The prototype is gated behind the existing enabled+mode gate

Phase 25L does not import or modify the Phase 25K prototype.

## Phase 25I signal layer import boundary

Phase 25M may access the Phase 25I signal layer (`src/state/backupHealthSignal.js`) only via the Phase 25K integration prototype. Direct imports from Phase 25I signal layer into Phase 25M UI components are not permitted without a separate design gate.

Phase 25L does not import or modify the Phase 25I signal layer.

## No-write and no-telemetry boundary

All Phase 25M UI must be provably non-writing:

- No localStorage.setItem for backup health state
- No IndexedDB write for backup health state
- No backup file modification triggered by UI
- No restore behavior triggered by UI
- No telemetry or analytics event emitted by UI
- No analytics event for backup health status display

The Phase 25M validator must include unit tests proving no writes occur.

## Backup/export/restore boundary

Phase 25M must not change:

- Backup file format
- Restore overwrite behavior
- LocalStorage backup key layout
- Default storage driver behavior
- Export trigger or export file structure

Phase 25L makes no changes to any backup/export/restore module. The backup/export/restore boundary is fully preserved.

## Phase 25M framing

Phase 25M — Backup Health Limited Default-Off UI Prototype

- separate phase
- default-off by default
- limited UI surface only
- read-only only
- may import Phase 25K prototype only if import gate passes
- must not change backup/export/restore behavior
- must not add telemetry/analytics
- must include unit tests, validator, strict reviewer, and tester if browser/user-facing behavior is claimed

Phase 25M is not automatically approved by Phase 25L. Phase 25M requires a fresh design review confirming all strict gates above are met before implementation begins.

## Evidence plan

A future Phase 25M must provide:

- unit coverage for UI state mapping
- unit coverage proving no writes
- validator coverage for default-off UI
- validator coverage for no broad production rollout
- validator coverage for no backup/export/restore behavior changes
- validator coverage for no telemetry/analytics
- manual/browser smoke required if browser/user-facing behavior is claimed
- generated/test data only
- no real learner data
- rollback/removal check
- no-new-claim check
- accessibility check
- Vietnamese-first copy review

## Manual/browser smoke plan

Phase 25L itself requires no manual or browser evidence because it changes no runtime behavior.

Phase 25M must provide manual/browser smoke evidence before claiming any user-facing behavior:

- Screenshots of the limited-surface UI in a browser (Chromium, gated by default-off flag)
- Screenshot showing default state with gate off (no UI visible)
- Screenshot showing UI visible only when gate is explicitly active
- Smoke confirming no backup/export/restore behavior change
- Smoke confirming no writes to localStorage or IndexedDB
- Smoke confirming Vietnamese-first copy is correct
- Accessibility review (keyboard navigation, color independence, aria labels)

All screenshots must use generated/test data. No real learner data in evidence.

## Validator plan

Phase 25L validator (`scripts/validate-phase25l-backup-health-production-ui-design-gate.js`) checks:

- Required docs and validator exist
- CI registers Phase 25L validator
- CI fetches origin/main before Phase 25L validator
- CI does not run Phase 24D-HF1 through Phase 25K validators as active merge-blocking steps
- CI does not run full `for f in scripts/validate-*.js` loop
- Workflow has no `continue-on-error: true`
- Required headings and tokens exist in planning and release docs
- Phase 25K status/scope/decision tokens are referenced
- Phase 25I status/scope/decision tokens are referenced
- Required guardrail statements are present
- Allowed and forbidden future UI scope is defined
- Phase 25M framing is present
- Proposed file ownership and evidence plan are present
- No-go list and rollback plan are present
- Docs do not claim runtime UI, production-visible UI, production adapter-aware backup/export/restore, broad backup reliability, or guaranteed data-loss prevention
- Changed files match exact allowed set (post-merge-main safe)
- No historical validators changed
- No runtime/source/test/package/ADR/generated files changed

## Rollback/removal plan

Remove docs/planning/phase25l-backup-health-production-ui-design-gate.md.
Remove docs/release/phase25l-backup-health-production-ui-design-gate-summary.md.
Remove scripts/validate-phase25l-backup-health-production-ui-design-gate.js.
Remove Phase 25L CI registration.
No learner data migration or cleanup is required because Phase 25L changes no runtime behavior.

## Proposed file ownership for Phase 25M

If Phase 25M proceeds under the strict gates above, the following new files may be created:

- `src/components/BackupHealthHint.jsx` — default-off backup health hint component (read-only)
- `tests/unit/BackupHealthHint.test.js` — unit tests for BackupHealthHint (including no-write and default-off coverage)
- `docs/testing/phase25m-backup-health-limited-default-off-ui-prototype.md` — Phase 25M testing doc
- `docs/release/phase25m-backup-health-limited-default-off-ui-prototype-summary.md` — Phase 25M release summary
- `scripts/validate-phase25m-backup-health-limited-default-off-ui-prototype.js` — Phase 25M validator

The following files must not be created or modified by Phase 25M without a separate design gate:

- Any file under `src/routes/`
- Any file under `src/settings/` or `src/components/settings/`
- Any file under `src/library/` or `src/components/library/`
- Any file under `src/dashboard/` or `src/components/dashboard/`
- `src/state/backupHealthSignal.js`
- `src/state/backupHealthIntegrationPrototype.js`
- Any backup, export, or restore module in `src/`
- `sw.js`
- `boot-guard.js`
- `package.json`
- `package-lock.json`

## Review and tester requirements

Phase 25L (this phase):
- Strict Reviewer required before push/PR
- Tester not required because no runtime behavior is claimed

Phase 25M (future):
- Strict Reviewer required
- Tester required if any browser/user-facing behavior is claimed
- Vietnamese-first copy reviewer required
- Accessibility reviewer required before any user-facing claim

## Go/no-go criteria

Phase 25L go criteria (all must be true to proceed with Phase 25M):

- Phase 25L planning doc exists with all required headings and tokens
- Phase 25L release summary exists with all required headings and tokens
- Phase 25L validator passes
- Phase 25L CI registration confirmed
- npm ci passes
- npm run build passes
- npm run test:unit passes
- No runtime/source/test/package/ADR/generated files changed by this patch
- No forbidden claims made by Phase 25L docs

Phase 25M no-go triggers (any of these blocks Phase 25M proceed):

- Phase 25L validator fails
- Any doc claims production-visible UI is ready
- Any doc claims guaranteed data-loss prevention
- Any doc claims BETA_READY
- Any runtime/source/test file modified by Phase 25L patch
- CI continues-on-error is true in Phase 25L workflow registration

## What Phase 25L can claim

- Phase 25L design gate completed
- Phase 25L defines conservative constraints for a future Phase 25M limited/default-off UI prototype
- Phase 25L records the production UI boundary decisions in versioned docs
- Phase 25L ensures Phase 25M cannot proceed without strict gate evidence
- Phase 25L validator enforces no Phase 25L runtime changes

## What Phase 25L must not claim

- Phase 25L must not claim production-visible Backup Health UI is ready
- Phase 25L must not claim production adapter-aware backup/export/restore is implemented
- Phase 25L must not claim broad backup reliability
- Phase 25L must not claim guaranteed data-loss prevention is provided
- Phase 25L must not claim BETA_READY
- Phase 25L must not claim automatic backup is in place
- Phase 25L must not claim platform backup preservation

## Guardrails

Phase 25L is docs/design/static-validator/CI-only.
Phase 25L does not change runtime behavior.
Phase 25L does not implement Backup Health UI.
Phase 25L does not import or wire the Phase 25K prototype into production UI.
Phase 25L does not import or wire the Phase 25I signal layer into production UI.
Phase 25L does not modify Phase 25K prototype behavior.
Phase 25L does not modify Phase 25I signal layer behavior.
Phase 25L does not modify Phase 25G prototype behavior.
Phase 25L does not modify Phase 24E scaffold behavior.
Phase 25L does not implement production adapter-aware backup/export/restore.
Production backup/export/restore behavior remains unchanged by this patch.
Backup file format remains unchanged.
Restore overwrite behavior remains unchanged.
Current localStorage backup compatibility remains unchanged.
Default storage driver remains unchanged.
No IndexedDB.
No storage migration.
No sync/cloud/account/auth/backend.
No telemetry or analytics.
No BETA_READY.
Historical full-chain validators remain manual/local/scheduled audit guidance.
Full historical scripts/validate-*.js chain is not used as a Phase 25L merge-blocking requirement.

## Next recommended phase

Next recommended phase: Phase 25M — Backup Health Limited Default-Off UI Prototype
Phase 25M is a separate limited/default-off runtime UI prototype gate and is not automatically approved.
Phase 25L does not approve production-visible Backup Health UI by default.
Phase 25L does not approve production adapter-aware backup/export/restore.
