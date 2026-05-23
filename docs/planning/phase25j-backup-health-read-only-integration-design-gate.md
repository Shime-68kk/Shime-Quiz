# Phase 25J — Backup Health Read-Only Integration Design Gate

<!--
PHASE25J_BACKUP_HEALTH_READ_ONLY_INTEGRATION_DESIGN_STATUS: COMPLETED_DESIGN_GATE
PHASE25J_BACKUP_HEALTH_READ_ONLY_INTEGRATION_DECISION: PASS_TO_PHASE25K_TEST_ONLY_DEFAULT_OFF_INTEGRATION_PROTOTYPE
-->

## Status token

| Token | Value |
|-------|-------|
| `PHASE25J_BACKUP_HEALTH_READ_ONLY_INTEGRATION_DESIGN_STATUS` | `COMPLETED_DESIGN_GATE` |
| `PHASE25J_BACKUP_HEALTH_READ_ONLY_INTEGRATION_DECISION` | `PASS_TO_PHASE25K_TEST_ONLY_DEFAULT_OFF_INTEGRATION_PROTOTYPE` |

---

## Scope

Phase 25J is docs/design/static-validator/CI-only.
Phase 25J does not change runtime behavior.
Phase 25J does not implement Backup Health UI.
Phase 25J does not import or wire the Phase 25I signal layer into production UI.
Phase 25J does not modify Phase 25I signal layer behavior.
Phase 25J does not modify Phase 25G prototype behavior.
Phase 25J does not modify Phase 24E scaffold behavior.
Phase 25J does not implement production adapter-aware backup/export/restore.
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
Full historical scripts/validate-*.js chain is not used as a Phase 25J merge-blocking requirement.

---

## Inputs

Phase 25J builds on the following completed phases:

**Phase 25I — Backup Health Thin Read-Only Signal Layer:**

- `PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_LAYER_STATUS: COMPLETED_THIN_READ_ONLY_SIGNAL_LAYER`
- `PHASE25I_BACKUP_HEALTH_RUNTIME_SCOPE: READ_ONLY_NO_UI_NO_WRITES_NO_BACKUP_RESTORE_CHANGES`
- `PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_DECISION: PASS_TO_PHASE25J_READ_ONLY_INTEGRATION_DESIGN_GATE`

**Phase 25I-HF1 — Post-Merge Validator Context Fix:**

Phase 25I-HF1 applied a targeted fix to make the Phase 25I static validator context-aware for post-merge main. The fix is CI/static-validator-only; it did not change any runtime, source, or test behavior. Phase 25J starts after both Phase 25I and Phase 25I-HF1 are visible on `origin/main`.

**Prior signal foundation:**

- Phase 25G — Backup Health Test-Only Runtime Prototype (test-only helper)
- Phase 25H — Backup Health Persistence Signal Design Gate (design gate)
- Phase 24E — Scaffold implementation (dormant)

---

## Purpose

Phase 25J decides whether a future Phase 25K may introduce a test-only/default-off read-only integration point that consumes the Phase 25I signal layer, and under what strict limits.

The decision does not approve production UI. It does not approve runtime Backup Health UI implementation. It only permits a carefully scoped subsequent phase to prototype a test-only/default-off integration if all strict guards are met.

---

## Design decision

**Decision: PASS_TO_PHASE25K_TEST_ONLY_DEFAULT_OFF_INTEGRATION_PROTOTYPE**

The Phase 25I signal layer (`src/state/backupHealthSignal.js`) is a stable, read-only, pure-function layer with unit-test coverage. It is safe to prototype a test-only/default-off integration point in a subsequent phase, provided the integration:

- Is test-only or default-off by default.
- Is read-only only.
- Is local-only.
- Makes no writes.
- Does not change backup/export/restore behavior or file formats.
- Adds no telemetry/analytics.
- Adds no sync/cloud/account/auth/backend.
- Performs no storage migration.
- Does not use IndexedDB as production storage.
- Does not claim BETA_READY.

---

## Read-only integration boundary

The read-only integration boundary defines what a future Phase 25K is permitted to do:

- Import `src/state/backupHealthSignal.js` functions only through the Phase 25K import gate.
- Call `createBackupHealthSignal`, `normalizeBackupHealthSignals`, or `deriveBackupHealthFromSignals` in test-only or default-off scope.
- Read existing localStorage keys already maintained by the production backup/restore flow; must not write, delete, or transform them.
- Derive a health signal value for test or development display only.
- Must not introduce UI visible to end users by default.

---

## Allowed future integration scope

The following are allowed in Phase 25K, subject to all strict guards:

- test-only or default-off by default
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

---

## Forbidden future integration scope

The following are explicitly forbidden from Phase 25K integration:

- no production-visible Backup Health UI by default
- no dashboard/settings/library card by default
- no navigation route by default
- no automatic backup claims
- no platform backup preservation claims
- no guaranteed data-loss prevention claims
- no scanning learner content
- no persistent tracking added to calculate health
- no production adapter-aware backup/export/restore

---

## Potential integration target candidates

These are the candidate target locations where a future test-only/default-off integration point might be introduced. None are wired by Phase 25J.

1. **Test harness / fixture only** — The safest candidate. The integration point is exercised only in tests, never in the browser.
2. **Developer/debug panel (default hidden)** — A collapsed or flag-gated dev panel that shows the derived health state; default off in production.
3. **Internal health check hook (test-only export)** — A test-exported hook that calls the signal layer for assertion purposes.

---

## No-go integration targets

The following integration targets are explicitly rejected for Phase 25K:

- Production Dashboard card
- Settings panel visible to end users
- Library panel visible to end users
- Navigation route accessible without a flag
- Any component rendered during normal user flow

---

## Phase 25I signal layer import boundary

In Phase 25K, the Phase 25I signal layer may only be imported if all of the following conditions are met:

1. The import gate check passes at PR review time.
2. The importing file is a test file, a test-only helper, or a default-off development utility.
3. The import is not reachable from a production route or component without an explicit flag.
4. No production file in `src/components/`, `src/pages/`, `src/routes/`, `src/dashboard/`, `src/settings/`, `src/library/`, `src/backup/`, `src/restore/`, `src/export/`, or `src/import/` imports the signal layer except through the explicitly gated test/dev path.

---

## UI and display boundary

Phase 25J does not introduce any UI.

For Phase 25K:

- No production-visible Backup Health UI may be introduced by default.
- Any display must be test-only or behind a default-off flag.
- No new navigation route may be added.
- No card may appear in Dashboard, Settings, or Library by default.
- No copy visible to end users may be added without a prior copy review.

---

## Copy and tone boundary

Phase 25J does not introduce any user-facing copy.

For Phase 25K:

- No user-facing copy may be added unless it is entirely default-off.
- Backup Health copy must not overstate data safety guarantees.
- Copy must not claim automatic backup, platform backup preservation, or guaranteed data-loss prevention.
- Vietnamese-first copy review is required for any user-facing text before it is enabled by default.

---

## Accessibility and i18n plan

Phase 25J introduces no UI, so no accessibility or i18n work is required.

For Phase 25K:

- Any UI introduced (even test-only) must include ARIA labels if it renders interactive elements.
- User-facing copy must be reviewed for Vietnamese-first correctness before any default-on UI.
- i18n keys must not be added to production bundles by default if the feature is default-off.

---

## Phase 25K framing

**Phase 25K — Backup Health Test-Only Default-Off Integration Prototype**

- separate phase
- test-only or default-off by default
- read-only only
- no production-visible UI by default
- may import Phase 25I signal layer only if import gate passes
- must not change backup/export/restore behavior
- must not add telemetry/analytics
- must include unit tests, validator, strict reviewer, and tester if browser/user-facing behavior is claimed

Phase 25K is a separate test-only/default-off runtime integration gate and is not automatically approved.
Phase 25J does not approve runtime Backup Health UI.
Phase 25J does not approve production adapter-aware backup/export/restore.

---

## Evidence plan

**Required evidence for Phase 25K:**

- unit coverage for integration target behavior
- unit coverage proving no writes
- validator coverage for no production-visible UI by default
- validator coverage for no backup/export/restore behavior changes
- validator coverage for no telemetry/analytics
- manual/browser smoke only if browser/user-facing behavior is claimed
- generated/test data only
- no real learner data
- rollback/removal check
- no-new-claim check
- accessibility/i18n copy check if any copy is displayed

---

## Manual/browser smoke plan

Phase 25J requires no manual/browser smoke evidence because it changes no runtime behavior.

For Phase 25K: manual/browser smoke is required only if Phase 25K introduces browser/user-facing behavior. If Phase 25K is test-only with no UI, no browser evidence is required.

---

## Validator plan

**Phase 25J validator:**

`scripts/validate-phase25j-backup-health-read-only-integration-design-gate.js`

Checks:
- Required docs and validator exist.
- CI registers Phase 25J validator.
- CI fetches `origin/main` before Phase 25J validator.
- CI does not run Phase 24D-HF1/HF2 through Phase 25I validators as Phase 25J merge-blocking gates.
- CI does not run full `for f in scripts/validate-*.js` chain as default PR blocker.
- No `continue-on-error: true`.
- Required headings and tokens exist.
- Phase 25I status/runtime scope/decision tokens referenced.
- Phase 25I-HF1 post-merge context fix referenced.
- Required statements and design coverage exist.
- Allowed/forbidden future integration scope defined.
- Phase 25K framing exists.
- Proposed file ownership and evidence plan exist.
- No-go list and rollback plan exist.
- Docs do not claim runtime Backup Health UI or production adapter-aware backup/export/restore.
- Changed files are exact allowed files only.
- No historical validators changed.
- No runtime/source/test/package/ADR/generated files changed.

---

## Rollback/removal plan

Remove docs/planning/phase25j-backup-health-read-only-integration-design-gate.md.
Remove docs/release/phase25j-backup-health-read-only-integration-design-gate-summary.md.
Remove scripts/validate-phase25j-backup-health-read-only-integration-design-gate.js.
Remove Phase 25J CI registration.
No learner data migration or cleanup is required because Phase 25J changes no runtime behavior.

---

## Proposed file ownership for Phase 25K

| File | Owner | Notes |
|------|-------|-------|
| `src/state/backupHealthSignal.js` | Phase 25I (read-only reference) | Do not modify in Phase 25K unless import gate passes |
| `tests/unit/backupHealthIntegration.test.js` | Phase 25K (new, test-only) | Integration test target |
| `scripts/validate-phase25k-*.js` | Phase 25K | Static validator |
| `docs/planning/phase25k-*.md` | Phase 25K | Design doc |
| `docs/release/phase25k-*.md` | Phase 25K | Release summary |
| `.github/workflows/e2e-smoke.yml` | Phase 25K (CI registration only) | Phase 25J comment retained |

---

## Review and tester requirements

**Phase 25J:**

- Strict Reviewer required before push/PR.
- No Tester required because Phase 25J changes no runtime behavior and claims no manual/browser evidence execution.

**Phase 25K (future):**

- Strict Reviewer required.
- Tester required if Phase 25K introduces any browser/user-facing behavior.
- Vietnamese-first copy reviewer required if any user-facing copy is added.

---

## Go/no-go criteria

**Go criteria for Phase 25K:**

1. Phase 25J validator passes on the Phase 25K branch.
2. All Phase 25K tests pass.
3. Build passes.
4. Changed files are within the Phase 25K authorized set.
5. No production-visible UI is introduced by default.
6. No backup/export/restore behavior is changed.
7. No telemetry/analytics is added.
8. Signal layer import gate passes.

**No-go criteria:**

1. Any production UI is visible to end users by default.
2. Any backup/export/restore behavior is changed.
3. Any telemetry/analytics is added.
4. Any storage migration is introduced.
5. Any write to localStorage or IndexedDB from the integration point.
6. Any BETA_READY claim.

---

## What Phase 25J can claim

- Phase 25J defines a conservative design gate for read-only Backup Health integration.
- Phase 25J establishes an explicit allowed/forbidden scope for Phase 25K.
- Phase 25J registers a static validator and CI step.
- Phase 25J references Phase 25I and Phase 25I-HF1 as stable baseline.

---

## What Phase 25J must not claim

Phase 25J does not approve:

- runtime Backup Health UI implementation
- production-visible Backup Health UI
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

---

## Guardrails

1. Phase 25J is docs/design/static-validator/CI-only and does not change runtime behavior.
2. Phase 25J does not import or wire the Phase 25I signal layer into any production component.
3. Phase 25J does not introduce UI, routes, navigation, or copy visible to end users.
4. Phase 25J does not change backup/export/restore behavior or file formats.
5. Phase 25J does not add telemetry/analytics.
6. Phase 25J does not add storage migration.
7. Phase 25J does not add IndexedDB.
8. Phase 25J does not modify package.json or package-lock.json.
9. Phase 25J does not modify `src/**`, `tests/**`, or `e2e/**`.
10. Phase 25J does not modify Phase 25I, Phase 25G, or Phase 24E artifacts.
11. Historical full-chain validators remain manual/local/scheduled audit guidance only.
12. Full historical scripts/validate-*.js chain is not used as a Phase 25J merge-blocking requirement.

---

## Next recommended phase

**Next recommended phase: Phase 25K — Backup Health Test-Only Default-Off Integration Prototype**

Phase 25K is a separate test-only/default-off runtime integration gate and is not automatically approved.
Phase 25J does not approve runtime Backup Health UI.
Phase 25J does not approve production adapter-aware backup/export/restore.

---

*PHASE25J_BACKUP_HEALTH_READ_ONLY_INTEGRATION_DESIGN_STATUS: COMPLETED_DESIGN_GATE*
*PHASE25J_BACKUP_HEALTH_READ_ONLY_INTEGRATION_DECISION: PASS_TO_PHASE25K_TEST_ONLY_DEFAULT_OFF_INTEGRATION_PROTOTYPE*
