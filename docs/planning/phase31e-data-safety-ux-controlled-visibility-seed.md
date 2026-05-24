# Phase 31E — Data Safety UX Controlled Visibility Seed

## Status token

```text
PHASE31E_DATA_SAFETY_UX_CONTROLLED_VISIBILITY_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 31E is a separate visibility gate and is not automatically approved by Phase 31D.
An explicit Phase 31E planning output must be produced. Phase 31D does not approve any visibility change.

## Purpose

Phase 31E is a Data Safety UX Controlled Visibility Gate phase. Its goal is to evaluate whether and how the Phase 31C default-off prototype should be made visible to a controlled set of internal users — and under what constraints, gates, and evidence requirements.

Phase 31E must not approve BETA_READY. Phase 31E must not approve production restore rehearsal. Phase 31E must not implement runtime backup/export/restore behavior changes. Phase 31E must not implement storage migration.

## Inputs from Phase 31D

From Phase 31D:
- Evidence review doc: `docs/testing/phase31d-data-safety-ux-evidence-review.md`
- Release summary: `docs/release/phase31d-data-safety-ux-evidence-review-summary.md`
- This seed: `docs/planning/phase31e-data-safety-ux-controlled-visibility-seed.md`

Phase 31D tokens:
```text
PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW_STATUS: COMPLETED_DEFAULT_OFF_DATA_SAFETY_UX_EVIDENCE_REVIEW
PHASE31D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE31D_DATA_SAFETY_UX_EVIDENCE_DECISION: PASS_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE
PHASE31D_EVIDENCE_SCOPE: DEFAULT_OFF_PROTOTYPE_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE31D_MANUAL_BROWSER_EVIDENCE_STATUS: NOT_PROVIDED_NOT_CLAIMED
```

Known limitations from Phase 31D:
- Manual browser evidence was NOT_PROVIDED_NOT_CLAIMED. This must be resolved before any visibility change.
- No real user testing has been conducted.
- No restore rehearsal with real data.
- BETA_READY has not been approved.

## Visibility constraints

Phase 31E must operate under the following constraints:

1. Any visibility change must be explicitly gated — the prototype must not become visible by default without a separate approved gate.
2. No BETA_READY approval without a separate explicit gate with full evidence.
3. No production restore rehearsal.
4. No real learner data in any controlled visibility prototype.
5. No runtime backup/export/restore behavior changes.
6. No storage migration.
7. No sync/cloud/backend/account/auth.
8. No telemetry.
9. Conservative scope — if in doubt, hold.
10. Manual browser evidence must be collected before any visibility change is approved.

## Allowed visibility options

Phase 31E may evaluate one of the following controlled visibility options:

1. **Continue default-off** — keep the prototype hidden; collect missing evidence (browser, user testing) before any visibility change.
2. **Internal dev/test flag only** — allow internal/tester-only visibility behind an explicit non-default flag, never surfaced to production users.
3. **Limited settings visibility** — show the prototype to a controlled subset of users (e.g., internal beta users) behind an explicit flag, with strict copy and disclaimer requirements.

Any option beyond "continue default-off" requires its own separate gate with evidence.

## Required gates before any visibility change

Before Phase 31E can approve any visibility change:

1. Manual browser evidence must be collected and reviewed — `PHASE31D_MANUAL_BROWSER_EVIDENCE_STATUS: PROVIDED_AND_REVIEWED`.
2. All nine sections must be verified as rendering correctly in a real browser.
3. All action buttons must be verified as visibly disabled in a real browser.
4. Copy boundaries must be verified in a real browser (no forbidden claims visible).
5. Settings page must be verified unchanged when prototype is disabled.
6. No regressions in existing Settings panels (FSRS, EduGen) must be verified.
7. No console errors or layout breakage must be verified.
8. An explicit Phase 31E planning output must be produced with a separate decision.

## Required evidence plan

Phase 31E must collect or review:

**Manual browser evidence (missing from Phase 31D):**
- Prototype renders correctly when enabled in dev mode (`{ enabled: true, mode: 'dev' }`).
- All 9 sections visible and readable.
- All action buttons visibly disabled.
- Copy matches required boundaries.
- Settings page is unchanged when prototype flag is disabled (default state).
- No regressions in existing Settings panels.
- No console errors or layout breakage.

**Copy review evidence:**
- Vietnamese-first copy is readable and accurate.
- No forbidden claim strings in rendered copy.
- All required disclaimers present.
- Evidence gaps / beta limitations panel visible.
- No BETA_READY or production readiness claim in rendered UI.

**Rollback evidence:**
- Flag can be disabled without data loss.
- Settings page reverts to baseline when flag is disabled.

**Visibility risk assessment:**
- What is the risk of making the prototype visible to any user?
- What is the minimum safe visibility scope?
- What copy changes, if any, are needed before any visibility?

## Decision options

Phase 31E must choose one of the following decisions:

```text
HOLD_DATA_SAFETY_UX_VISIBILITY
NEEDS_MORE_EVIDENCE
PASS_TO_DEFAULT_OFF_INTERNAL_VISIBILITY
PASS_TO_LIMITED_SETTINGS_VISIBILITY
```

- `HOLD_DATA_SAFETY_UX_VISIBILITY`: Evidence is insufficient, regressions found, copy boundaries not met, or design issues discovered. Hold until resolved.
- `NEEDS_MORE_EVIDENCE`: Evidence collected but gaps remain (e.g., manual browser evidence still missing). More evidence required before a visibility decision.
- `PASS_TO_DEFAULT_OFF_INTERNAL_VISIBILITY`: Evidence complete; approve internal/tester-only visibility behind explicit flag. Still default-off for production users.
- `PASS_TO_LIMITED_SETTINGS_VISIBILITY`: Evidence complete; approve limited settings visibility for controlled beta users behind an explicit gate.

Phase 31E is a separate visibility gate and is not automatically approved by Phase 31D.

## Forbidden default approvals

Phase 31E must not approve by default:

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
- Phase 31E approval based solely on Phase 31D static evidence (manual browser evidence is required for any visibility change).
- Any visibility change without explicit Phase 31E decision.

## Recommended next step

Phase 31E should begin by:
1. Reviewing Phase 31D evidence doc and confirming the limited scope.
2. Collecting manual browser evidence (the key gap from Phase 31D).
3. Running Phase 31D validator to confirm the static baseline.
4. Making an explicit Phase 31E visibility decision based on Phase 31E evidence reviewed.

Phase 31E is a separate visibility gate and is not automatically approved.
Phase 31D confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 31D does not approve BETA_READY.
Phase 31D does not approve public production readiness.
Phase 31D does not approve guaranteed data-loss prevention.
Phase 31D does not approve restore execution.
Phase 31D does not approve production restore rehearsal.
Phase 31D does not approve real learner data restore rehearsal.
Phase 31D does not approve runtime backup/export/restore behavior changes.
Phase 31D does not approve backup file format changes.
Phase 31D does not approve restore overwrite behavior changes.
Phase 31D does not approve storage migration.
Phase 31D does not approve sync/cloud/account/auth/backend.
Phase 31D does not approve telemetry/analytics.
Phase 31D does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 31D does not approve BYOC/WebDAV/P2P/device-transfer implementation.
