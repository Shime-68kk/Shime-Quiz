# Phase 31G — Data Safety UX Internal Visibility Implementation Seed

## Status token

```text
PHASE31G_DATA_SAFETY_UX_INTERNAL_VISIBILITY_IMPLEMENTATION_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 31G is a separate implementation/prototype gate and is not automatically approved by Phase 31F. An explicit Phase 31G planning output must be produced. Phase 31F does not approve any visibility change.

## Purpose

Phase 31G is a Data Safety UX Internal Visibility Implementation phase. Its goal is to prototype and evaluate a minimal default-off internal visibility mechanism for the Phase 31C Data Safety UX prototype — restricted to developers and testers only, behind an explicit non-default flag/config, with no ordinary-user exposure.

Phase 31G must not approve BETA_READY. Phase 31G must not approve ordinary-user limited settings visibility without a separate explicit gate. Phase 31G must not implement runtime backup/export/restore behavior changes. Phase 31G must not implement storage migration. Phase 31G must not approve production restore rehearsal.

## Inputs from Phase 31F

From Phase 31F:
- Internal visibility gate doc: `docs/testing/phase31f-data-safety-ux-internal-visibility-gate.md`
- Release summary: `docs/release/phase31f-data-safety-ux-internal-visibility-summary.md`
- This seed: `docs/planning/phase31g-data-safety-ux-internal-visibility-implementation-seed.md`

Phase 31F tokens:

```text
PHASE31F_DATA_SAFETY_UX_INTERNAL_VISIBILITY_STATUS: COMPLETED_INTERNAL_VISIBILITY_GATE
PHASE31F_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE31F_DATA_SAFETY_UX_INTERNAL_VISIBILITY_DECISION: PASS_TO_PHASE31G_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION
PHASE31F_VISIBILITY_SCOPE: INTERNAL_VISIBILITY_GATE_ONLY_NO_RUNTIME_VISIBILITY_CHANGE
PHASE31F_MANUAL_BROWSER_EVIDENCE_STATUS: NOT_PROVIDED_NOT_CLAIMED
```

Key limitations carried forward from Phase 31F:
- Manual browser evidence is NOT_PROVIDED_NOT_CLAIMED. This must be resolved in Phase 31G before any runtime visibility change is approved.
- No real user testing has been conducted.
- No restore rehearsal with real data.
- BETA_READY has not been approved.
- Ordinary-user limited settings visibility is not approved.

## Implementation constraints

Phase 31G must operate under the following constraints:

1. Any internal visibility must be explicitly gated — the prototype must not become visible by default without a separate approved gate.
2. The internal flag/config must be non-default and must not surface to production users.
3. No BETA_READY approval without a separate explicit gate with full evidence.
4. No production restore rehearsal.
5. No real learner data in any internal visibility prototype.
6. No runtime backup/export/restore behavior changes.
7. No storage migration.
8. No sync/cloud/backend/account/auth.
9. No telemetry.
10. Internal visibility scope only — developer/tester only.
11. Manual browser evidence must be collected during Phase 31G before any runtime visibility change is approved.
12. Ordinary-user settings panel access is not allowed without a separate explicit gate beyond Phase 31G.
13. Rollback must be confirmed: flag disable restores baseline without data loss.

## Allowed implementation surface

Phase 31G may prototype one or more of the following, subject to its own gate decision:

1. **Internal dev/test flag only** — a non-default flag in the codebase that, when explicitly enabled by a developer/tester, makes the Data Safety UX prototype visible in the settings panel. Never surfaced to production users. Flag must not be committed as `true` or enabled by default.
2. **Internal settings panel visibility** — when the internal flag is enabled, the prototype is shown in the settings panel. Visible only when the flag is explicitly set. Not part of the production settings panel for ordinary users.
3. **Developer fixture route** — a `/dev/` route that renders the prototype for internal review, separate from the production settings flow.

Any option beyond "continue default-off" requires its own Phase 31G decision, browser evidence, and explicit gate output.

## Required internal flag behavior

Any internal flag implemented in Phase 31G must:
1. Default to `false` / disabled.
2. Not be set to `true` in any committed production code.
3. Not be readable or settable by ordinary users.
4. Not persist to user settings storage as a user preference.
5. Not affect any backup, export, or restore behavior.
6. Not affect any storage driver or migration.
7. Be removable without data loss or user impact.
8. Be documented in the Phase 31G gate output.

## Required rollback plan

Phase 31G must document and verify a rollback plan:
1. Disabling the internal flag must restore the settings panel to its baseline state (no Data Safety UX section visible to ordinary users).
2. No user data is written, modified, or deleted by enabling or disabling the flag.
3. No backup files are modified by enabling or disabling the flag.
4. No storage migration is triggered by enabling or disabling the flag.
5. The rollback plan must be verified in a real browser before any implementation is approved.

## Required evidence plan

Phase 31G must collect or review:

**Manual browser evidence (missing from Phase 31D/31E/31F):**
- Prototype renders correctly when the internal flag is enabled.
- All 9 sections visible and readable.
- All action buttons visibly disabled.
- Copy matches required boundaries.
- Settings page is unchanged when prototype flag is disabled (default state).
- No regressions in existing Settings panels (FSRS, EduGen).
- No console errors or layout breakage.

**Copy review evidence:**
- Vietnamese-first copy is readable and accurate.
- No forbidden claim strings in rendered copy.
- All required disclaimers present.
- Evidence gaps / beta limitations panel visible.
- No BETA_READY or production readiness claim in rendered UI.

**Rollback evidence:**
- Flag disable restores settings page to baseline without data loss.
- Settings page reverts to baseline when flag is disabled.
- No backup, export, restore, or storage side effects.

**Internal flag evidence:**
- Flag is non-default (disabled by default).
- Flag is not surfaced to production users.
- Flag is not stored in user settings storage.

## Decision options

Phase 31G must choose one of the following decisions:

```text
HOLD_INTERNAL_VISIBILITY_IMPLEMENTATION
NEEDS_BROWSER_EVIDENCE
PASS_TO_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION
```

- `HOLD_INTERNAL_VISIBILITY_IMPLEMENTATION`: Evidence is insufficient, regressions found, copy boundaries not met, rollback not verified, or design issues discovered. Hold until resolved.
- `NEEDS_BROWSER_EVIDENCE`: Manual browser evidence is still missing or incomplete. More evidence required before any visibility implementation is approved.
- `PASS_TO_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION`: Manual browser evidence collected and reviewed; rollback verified; internal flag confirmed as non-default; approve internal/tester-only visibility behind an explicit non-default flag; still default-off for all production users.

Phase 31G is a separate implementation/prototype gate and is not automatically approved by Phase 31F.

## Forbidden default approvals

Phase 31G must not approve by default:

- BETA_READY.
- Public production readiness.
- Guaranteed data-loss prevention.
- Production restore rehearsal.
- Real learner data restore rehearsal.
- Restore execution guarantees.
- Backup file format changes.
- Restore overwrite behavior changes.
- Storage migration.
- Sync/cloud/account/auth/backend.
- Telemetry/analytics approval.
- BYOC/WebDAV/P2P/device-transfer implementation.
- Built-in AI/OCR/API-key/BYOK behavior.
- Removal of the default-off flag without a separate production-wiring gate.
- Phase 31G approval based solely on Phase 31F static evidence (manual browser evidence is required).
- Any visibility change without explicit Phase 31G decision.
- Ordinary-user limited settings visibility without a separate explicit gate.
- Any visibility to production users without a separate ordinary-user visibility gate.

## Recommended next step

Phase 31G should begin by:
1. Reviewing Phase 31F internal visibility gate doc and confirming the limited scope.
2. Defining the minimal internal flag mechanism (option 1: dev/test flag only is safest).
3. Collecting manual browser evidence (the key gap from Phase 31D/31E/31F).
4. Verifying rollback in a real browser.
5. Making an explicit Phase 31G internal visibility implementation decision based on Phase 31G evidence.

Phase 31G is a separate implementation/prototype gate and is not automatically approved.
Phase 31F confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 31F does not approve BETA_READY.
Phase 31F does not approve public production readiness.
Phase 31F does not approve guaranteed data-loss prevention.
Phase 31F does not approve restore execution.
Phase 31F does not approve production restore rehearsal.
Phase 31F does not approve real learner data restore rehearsal.
Phase 31F does not approve runtime backup/export/restore behavior changes.
Phase 31F does not approve backup file format changes.
Phase 31F does not approve restore overwrite behavior changes.
Phase 31F does not approve storage migration.
Phase 31F does not approve sync/cloud/account/auth/backend.
Phase 31F does not approve telemetry/analytics.
Phase 31F does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 31F does not approve BYOC/WebDAV/P2P/device-transfer implementation.
Phase 31F does not approve limited settings visibility to ordinary users.
Phase 31F does not change runtime visibility.
