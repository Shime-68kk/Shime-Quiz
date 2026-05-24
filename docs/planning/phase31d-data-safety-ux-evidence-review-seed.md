# Phase 31D — Data Safety UX Evidence Review Seed

## Status token

```text
PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 31D is a separate evidence review gate and is not automatically approved by Phase 31C. An explicit Phase 31D planning output must be produced.

## Purpose

Phase 31D is a Data Safety UX Evidence Review phase. Its goal is to review evidence collected for the Phase 31C Data Safety Center prototype — including manual browser testing, copy boundary review, and static evidence — and decide whether the prototype is ready for a separately-gated production-wiring or broader release phase.

Phase 31D must not approve BETA_READY. Phase 31D must not approve production restore rehearsal. Phase 31D must not implement runtime backup/export/restore behavior changes. Phase 31D must not implement storage migration.

## Inputs from Phase 31C

From Phase 31C:
- Evidence doc: `docs/testing/phase31c-data-safety-ux-prototype-evidence.md`
- Release summary: `docs/release/phase31c-data-safety-ux-prototype-summary.md`
- This seed: `docs/planning/phase31d-data-safety-ux-evidence-review-seed.md`
- Source: `src/features/dataSafety/dataSafetyCenterPrototype.js`
- Component: `src/features/dataSafety/DataSafetyCenterPrototype.jsx`
- Tests: `tests/unit/dataSafetyCenterPrototype.test.js`
- Validator: `scripts/validate-phase31c-data-safety-ux-prototype.js`

Phase 31C tokens:
```text
PHASE31C_DATA_SAFETY_UX_PROTOTYPE_STATUS: COMPLETED_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE
PHASE31C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE31C_DATA_SAFETY_UX_PROTOTYPE_DECISION: PASS_TO_PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW
PHASE31C_PROTOTYPE_SCOPE: DEFAULT_OFF_UI_ONLY_NO_STORAGE_WRITES_NO_BACKUP_RESTORE_BEHAVIOR_CHANGES
```

## Review constraints

Phase 31D must operate under the following constraints:

1. Default-off prototype must remain default-off during Phase 31D evidence collection.
2. No BETA_READY approval without a separate explicit gate.
3. No production restore rehearsal.
4. No real learner data in evidence collection.
5. No runtime backup/export/restore behavior changes.
6. No storage migration.
7. No sync/cloud/backend/account/auth.
8. No telemetry.
9. Conservative scope — if in doubt, hold.

## Required evidence

Phase 31D must collect or review the following evidence before making a decision:

**Static evidence** (already collected in Phase 31C):
- Unit tests pass (default-off, copy boundaries, static source analysis).
- Build passes.
- Validator passes.
- All 9 required sections present in component.
- No forbidden storage/network APIs in source.
- No forbidden imports in source.

**Manual browser evidence** (to be collected in Phase 31D):
- Prototype renders correctly when enabled in dev mode.
- All 9 sections visible and readable.
- All action buttons are visibly disabled.
- Copy matches required boundaries (no cloud sync, no automatic backup, no safety guarantee).
- Settings page is unchanged when prototype flag is disabled (default state).
- No regressions in existing Settings panels (FSRS, EduGen).
- No console errors or layout breakage.

**Copy review evidence** (to be collected in Phase 31D):
- Vietnamese-first copy is readable and accurate.
- No forbidden claim strings in rendered copy.
- All required disclaimers present.
- Evidence gaps / beta limitations panel visible.
- No BETA_READY or production readiness claim in rendered UI.

**Rollback evidence** (to be verified in Phase 31D):
- Flag can be disabled without data loss.
- Settings page reverts to Phase 31C baseline when flag is disabled.

## Manual browser evidence plan

1. Set `PHASE31C_PROTOTYPE_CONFIG = { enabled: true, mode: 'dev' }` in `src/routes/Settings.jsx` (test only, revert before commit).
2. Run dev server: `npm run dev`.
3. Navigate to Settings page.
4. Verify all 9 sections render.
5. Verify all action buttons are disabled.
6. Verify copy matches required boundaries.
7. Revert `PHASE31C_PROTOTYPE_CONFIG` to `{}`.
8. Reload Settings page.
9. Verify prototype section is no longer visible.
10. Verify other Settings panels are unchanged.
11. Record evidence in Phase 31D evidence doc.

## Static evidence plan

1. Run `node scripts/validate-phase31c-data-safety-ux-prototype.js` — must PASS.
2. Run `npm run build` — must PASS.
3. Run `npm run test:unit` — must PASS including Phase 31C tests.
4. Review static source analysis results in unit test output.

## Decision options

Phase 31D must choose one of the following decisions:

```text
HOLD_DATA_SAFETY_UX_PROTOTYPE
NEEDS_MORE_EVIDENCE
PASS_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE
```

- `HOLD_DATA_SAFETY_UX_PROTOTYPE`: Evidence is insufficient, regressions found, copy boundaries not met, or design issues discovered. Hold until resolved.
- `NEEDS_MORE_EVIDENCE`: Evidence collected but gaps remain. More evidence required before a pass decision can be made.
- `PASS_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE`: Evidence is complete, all sections verified, copy boundaries met, no regressions, prototype is ready for a separately-gated production-wiring or broader evidence phase.

Phase 31D is a separate evidence review gate and is not automatically approved by Phase 31C. The decision must be made explicitly in Phase 31D based on Phase 31D evidence reviewed.

## Forbidden default approvals

Phase 31D must not approve by default:

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
- Phase 31D approval based solely on Phase 31C static evidence (manual browser evidence is also required for PASS_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE).

## Recommended next step

Phase 31D should begin by reviewing the Phase 31C evidence doc and running the Phase 31C validator to confirm the static baseline. Then execute the manual browser evidence plan. Make an explicit Phase 31D decision based on Phase 31D evidence reviewed.

Phase 31D is a separate evidence review gate and is not automatically approved.
Phase 31C confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 31C does not approve BETA_READY.
Phase 31C does not approve public production readiness.
Phase 31C does not approve guaranteed data-loss prevention.
Phase 31C does not approve restore execution.
Phase 31C does not approve production restore rehearsal.
Phase 31C does not approve real learner data restore rehearsal.
Phase 31C does not approve runtime backup/export/restore behavior changes.
Phase 31C does not approve backup file format changes.
Phase 31C does not approve restore overwrite behavior changes.
Phase 31C does not approve storage migration.
Phase 31C does not approve sync/cloud/account/auth/backend.
Phase 31C does not approve telemetry/analytics.
Phase 31C does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 31C does not approve BYOC/WebDAV/P2P/device-transfer implementation.
