# Phase 31F — Data Safety UX Internal Visibility Seed

## Status token

```text
PHASE31F_DATA_SAFETY_UX_INTERNAL_VISIBILITY_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 31F is a separate internal visibility gate and is not automatically approved by Phase 31E. An explicit Phase 31F planning output must be produced. Phase 31E does not approve any visibility change.

## Purpose

Phase 31F is a Data Safety UX Internal Visibility Gate phase. Its goal is to evaluate whether and how the Phase 31C default-off prototype should be made visible to a controlled set of internal users (developers, testers, internal reviewers) — under explicit constraints, gates, and evidence requirements.

Phase 31F must not approve BETA_READY. Phase 31F must not approve production restore rehearsal. Phase 31F must not implement runtime backup/export/restore behavior changes. Phase 31F must not implement storage migration. Phase 31F must not approve limited settings visibility to ordinary users without a separate explicit gate.

## Inputs from Phase 31E

From Phase 31E:
- Controlled visibility gate doc: `docs/testing/phase31e-data-safety-ux-controlled-visibility-gate.md`
- Release summary: `docs/release/phase31e-data-safety-ux-controlled-visibility-summary.md`
- This seed: `docs/planning/phase31f-data-safety-ux-internal-visibility-seed.md`

Phase 31E tokens:

```text
PHASE31E_DATA_SAFETY_UX_CONTROLLED_VISIBILITY_STATUS: COMPLETED_CONTROLLED_VISIBILITY_GATE
PHASE31E_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE31E_DATA_SAFETY_UX_VISIBILITY_DECISION: PASS_TO_DEFAULT_OFF_INTERNAL_VISIBILITY
PHASE31E_VISIBILITY_SCOPE: VISIBILITY_GATE_ONLY_NO_RUNTIME_VISIBILITY_CHANGE
PHASE31E_MANUAL_BROWSER_EVIDENCE_STATUS: NOT_PROVIDED_NOT_CLAIMED
```

Key limitations carried forward from Phase 31E:
- Manual browser evidence is NOT_PROVIDED_NOT_CLAIMED. This must be addressed in Phase 31F.
- No real user testing has been conducted.
- No restore rehearsal with real data.
- BETA_READY has not been approved.
- Limited settings visibility to ordinary users is not approved.

## Internal visibility constraints

Phase 31F must operate under the following constraints:

1. Any internal visibility must be explicitly gated — the prototype must not become visible by default without a separate approved gate.
2. No BETA_READY approval without a separate explicit gate with full evidence.
3. No production restore rehearsal.
4. No real learner data in any internal visibility prototype.
5. No runtime backup/export/restore behavior changes.
6. No storage migration.
7. No sync/cloud/backend/account/auth.
8. No telemetry.
9. Internal visibility scope only — if in doubt, hold.
10. Manual browser evidence must be collected during Phase 31F before implementation is approved.
11. Ordinary-user settings panel access is not allowed without a separate explicit gate.
12. Any internal flag must be non-default and must not surface to production users.

## Allowed internal visibility options

Phase 31F may evaluate one of the following internal visibility options:

1. **Continue default-off** — keep the prototype completely hidden; collect all missing evidence (browser, user testing) before any visibility change.
2. **Internal dev/test flag only** — allow visibility behind an explicit non-default flag, never surfaced to production users; manual browser evidence must be collected and reviewed during Phase 31F.
3. **Internal settings panel** — show the prototype in a settings panel visible only to explicitly flagged internal users; requires manual browser evidence, copy boundary review, and explicit gate decision.

Any option beyond "continue default-off" requires its own separate gate with evidence. Phase 31F is that gate.

## Required gates before implementation

Before Phase 31F can approve any internal visibility change:

1. Manual browser evidence must be collected and reviewed — `PHASE31E_MANUAL_BROWSER_EVIDENCE_STATUS: NOT_PROVIDED_NOT_CLAIMED` must be resolved.
2. All nine sections must be verified as rendering correctly in a real browser.
3. All action buttons must be verified as visibly disabled in a real browser.
4. Copy boundaries must be verified in a real browser (no forbidden claims visible).
5. Settings page must be verified unchanged when prototype is disabled.
6. No regressions in existing Settings panels (FSRS, EduGen) must be verified.
7. No console errors or layout breakage must be verified.
8. An explicit Phase 31F planning output must be produced with a separate decision.
9. Internal user group definition must be documented (who sees the flag, how).

## Required evidence plan

Phase 31F must collect or review:

**Manual browser evidence (missing from Phase 31D/31E):**
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

**Internal visibility risk assessment:**
- What is the risk of making the prototype visible to internal users?
- What is the minimum safe internal visibility scope?
- What copy changes, if any, are needed before any internal visibility?
- What guards prevent the internal flag from surfacing to production users?

## Decision options

Phase 31F must choose one of the following decisions:

```text
HOLD_INTERNAL_VISIBILITY
NEEDS_MANUAL_BROWSER_EVIDENCE
PASS_TO_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION
```

- `HOLD_INTERNAL_VISIBILITY`: Evidence is insufficient, regressions found, copy boundaries not met, or design issues discovered. Hold until resolved.
- `NEEDS_MANUAL_BROWSER_EVIDENCE`: Manual browser evidence is still missing or incomplete. More evidence required before any visibility decision.
- `PASS_TO_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION`: Manual browser evidence collected and reviewed; approve internal/tester-only visibility behind an explicit non-default flag; still default-off for all production users.

Phase 31F is a separate internal visibility gate and is not automatically approved by Phase 31E.

## Forbidden default approvals

Phase 31F must not approve by default:

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
- Phase 31F approval based solely on Phase 31E static evidence (manual browser evidence is required).
- Any visibility change without explicit Phase 31F decision.
- Limited settings visibility to ordinary users without a separate explicit gate.

## Recommended next step

Phase 31F should begin by:
1. Reviewing Phase 31E visibility gate doc and confirming the limited scope.
2. Collecting manual browser evidence (the key gap from Phase 31D/31E).
3. Running Phase 31E validator to confirm the static baseline.
4. Making an explicit Phase 31F internal visibility decision based on Phase 31F evidence reviewed.

Phase 31F is a separate internal visibility gate and is not automatically approved.
Phase 31E confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 31E does not approve BETA_READY.
Phase 31E does not approve public production readiness.
Phase 31E does not approve guaranteed data-loss prevention.
Phase 31E does not approve restore execution.
Phase 31E does not approve production restore rehearsal.
Phase 31E does not approve real learner data restore rehearsal.
Phase 31E does not approve runtime backup/export/restore behavior changes.
Phase 31E does not approve backup file format changes.
Phase 31E does not approve restore overwrite behavior changes.
Phase 31E does not approve storage migration.
Phase 31E does not approve sync/cloud/account/auth/backend.
Phase 31E does not approve telemetry/analytics.
Phase 31E does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 31E does not approve BYOC/WebDAV/P2P/device-transfer implementation.
Phase 31E does not approve limited settings visibility to ordinary users.
