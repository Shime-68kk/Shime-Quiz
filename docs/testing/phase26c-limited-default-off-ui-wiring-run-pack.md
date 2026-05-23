# Phase 26C — Limited Default-Off UI Wiring Run Pack

## Status token

```
PHASE26C_UI_WIRING_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
```

## Scope

Phase 26C UI wiring run pack is **prepared only**. No evidence runs have been executed in Phase 26C. Execution occurs in Phase 26D, with tester evidence required.

Phase type: docs/design/testing/release/static-validator/CI-only. No runtime source changes. No unit test changes. No e2e. No browser or manual execution claimed.

## Run-pack status

`PREPARED_NOT_EXECUTED`

This run pack defines the evidence matrix that Phase 26D must execute and fill before making any user-facing or browser behavior claim. Observed results are `NOT_RUN_PHASE26C_PREPARED_ONLY` for all execution rows. Static preparation facts are noted where applicable.

## Purpose

Phase 26C's design gate selects the hidden default-off developer/test harness surface as the Phase 26D target. Before Phase 26D can claim any user-facing or browser behavior, it must execute this run pack and record observed results.

This run pack ensures:
- The hidden harness surface is default-off and not production-visible.
- Phase 25M view-model import boundary is maintained.
- No production route wiring.
- No write APIs.
- No backup/export/restore behavior changes.
- Vietnamese-first copy.
- Accessibility quick check.
- Tester manual/browser evidence.
- Rollback confirmed.

## Phase 26D evidence matrix

| Evidence area | Command/check | Data requirement | Expected result | Observed result | Status | Limitations | Claim allowed | Claim not allowed |
|---|---|---|---|---|---|---|---|---|
| default-off gate behavior | Static + unit: verify `isBackupHealthUiPrototypeEnabled({ enabled: true, mode: 'production' })` returns false; verify harness component renders null when gate returns false; `npm run test:unit` passes | Generated/test data only; no learner data | Gate returns false for production/live mode; harness renders null by default; unit tests pass | `NOT_RUN_PHASE26C_PREPARED_ONLY` | PREPARED | Phase 26C does not implement the harness | Default-off gate confirmed | Any claim that harness is visible by default |
| hidden test harness is not production-visible | Static: grep production routes, pages, components for harness import; no production route or nav references harness | No learner data | No production route, page, or nav references the harness component | `NOT_RUN_PHASE26C_PREPARED_ONLY` | PREPARED | Phase 26C does not implement the harness | Static: harness not referenced in production surfaces | Any user-facing production UI claim |
| Phase 25M view-model import boundary | Static: verify harness component imports `isBackupHealthUiPrototypeEnabled` from Phase 25M view-model only and does not import integration/signal modules directly; import is inside harness only | No learner data | Phase 25M view-model import is limited to harness component; no other production files import Phase 25M from new harness | `NOT_RUN_PHASE26C_PREPARED_ONLY` | PREPARED | Phase 26C does not implement the harness | Static: import boundary respected | Any claim of Phase 25M integration outside harness |
| no route/navigation/settings/library/dashboard broad rollout | Static: grep route registry, navigation config, settings panel, library, dashboard for harness references | No learner data | No route/nav/settings/library/dashboard references the harness | `NOT_RUN_PHASE26C_PREPARED_ONLY` | PREPARED | Phase 26C does not implement the harness | Static: no broad rollout wiring | Any claim of production route/nav availability |
| no write APIs | Static: verify harness component does not call localStorage.setItem, IndexedDB write, or any mutation API | No learner data | No write APIs in harness component | `NOT_RUN_PHASE26C_PREPARED_ONLY` | PREPARED | Phase 26C does not implement the harness | Static: read-only boundary confirmed | Any write API or data mutation claim |
| no backup/export/restore behavior changes | Static: git diff confirms production backup, export, restore modules unchanged | No learner data | Production backup/export/restore behavior unchanged | `NOT_RUN_PHASE26C_PREPARED_ONLY` | PREPARED | Phase 26C does not implement the harness | Static: backup/export/restore behavior unchanged | Any claim of adapter-aware or changed backup/export/restore behavior |
| no storage driver changes | Static: git diff confirms storage driver files unchanged | No learner data | Storage driver files unchanged | `NOT_RUN_PHASE26C_PREPARED_ONLY` | PREPARED | Phase 26C does not implement the harness | Static: storage driver unchanged | Any claim of IndexedDB or storage migration |
| no telemetry/analytics | Static: grep harness component for analytics calls (gtag, mixpanel, amplitude, segment, telemetry, datadog, Sentry) | No learner data | No telemetry/analytics calls in harness component | `NOT_RUN_PHASE26C_PREPARED_ONLY` | PREPARED | Phase 26C does not implement the harness | Static: no telemetry/analytics added | Any claim of analytics instrumentation |
| Vietnamese-first copy boundary | Static + manual: verify harness component uses Vietnamese-first copy for any user-visible text | No learner data | Vietnamese-first copy confirmed in harness component | `NOT_RUN_PHASE26C_PREPARED_ONLY` | PREPARED | Phase 26C does not implement the harness | Static: Vietnamese-first copy maintained | Any claim of English-first UX or copy changes |
| accessibility and keyboard quick check | Manual/tester: open harness surface with developer opt-in, verify keyboard navigation, sufficient contrast, no accessibility regressions | Generated/test data only; no learner data | Keyboard navigation works; contrast sufficient; no regressions | `NOT_RUN_PHASE26C_PREPARED_ONLY` | PREPARED (tester required in Phase 26D) | No harness exists in Phase 26C; tester required | If tester confirms: accessibility baseline met | Browser/tester result does not prove BETA_READY or production UI readiness |
| manual/browser smoke with generated/test data only if user-facing behavior is claimed | Manual/tester: open harness with developer opt-in; confirm not visible in production nav; confirm read-only; confirm Vietnamese copy | Generated/test data only; no real learner data | Harness not visible in production nav; display is read-only; Vietnamese copy confirmed | `NOT_RUN_PHASE26C_PREPARED_ONLY` | PREPARED (tester required in Phase 26D) | No production UI exists in Phase 26C; no user-facing behavior claimed | If tester confirms with generated data: limited harness behavior confirmed | Browser/tester result does not prove BETA_READY, broad backup reliability, or production UI readiness |
| rollback/removal check | Manual: remove harness component file; confirm no production build errors; confirm no route/nav breakage | Generated/test data only | Build passes after harness removal; no production breakage | `NOT_RUN_PHASE26C_PREPARED_ONLY` | PREPARED | Phase 26C does not implement the harness | Removability confirmed | Any claim that harness is required for production operation |

## Data safety rules

- All evidence runs in Phase 26D must use generated or test data only.
- No real learner data may be used in any evidence run.
- No backup/export/restore behavior is changed by Phase 26C design or Phase 26D implementation.
- No data migration is performed.
- If any evidence run fails, it must be recorded in the failure/anomaly log before any readiness claim.

## Manual/browser evidence boundary

Manual and browser evidence is **not executed in Phase 26C** because no production-visible UI or browser/user-facing behavior is exposed.

Manual/browser evidence is **required in Phase 26D** before any user-facing behavior claim is made.

Tester evidence in Phase 26D must use generated or test data only. No real learner data.

## Tester requirement

Phase 26D requires a Tester (a human reviewer who opens the app in a browser and manually verifies the harness) before any user-facing or browser behavior claim is made.

Tester must record:
- Steps taken to open the hidden harness surface.
- Confirmed that the harness is not visible in standard production navigation.
- Confirmed that the display is read-only.
- Confirmed Vietnamese-first copy.
- Confirmed keyboard navigation.
- Confirmed no backup/export/restore regressions.
- Data source confirmation: generated/test data only, no real learner data.

Tester result does not prove BETA_READY, broad backup reliability, or production UI readiness. It only confirms the harness behavior in a controlled environment.

## Pass/fail criteria for Phase 26D

Phase 26D may proceed to any user-facing or browser behavior claim only if:

1. `npm ci` passes with exit code 0.
2. `npm run build` passes with exit code 0.
3. `npm run test:unit` passes with all tests passing.
4. Phase 26D validator passes with exit code 0.
5. Default-off gate behavior confirmed: gate returns false for production/live mode.
6. Harness is not production-visible in any route, page, nav, or settings surface.
7. Phase 25M view-model import boundary respected.
8. No production route/nav/settings/library/dashboard references harness.
9. No write APIs in harness component.
10. Production backup/export/restore behavior unchanged.
11. Storage drivers unchanged.
12. No telemetry/analytics in harness component.
13. Vietnamese-first copy confirmed.
14. Accessibility quick check passes.
15. Tester/manual browser evidence recorded with generated/test data only.
16. Rollback/removal confirmed.
17. No anomalies unresolved.

If any criterion fails, Phase 26D must not proceed to a readiness claim.

## Failure/anomaly recording

If any Phase 26D evidence run fails or produces an anomaly, the failure must be recorded in the Phase 26D evidence execution doc before any readiness claim.

Format for each anomaly:
- Evidence area affected.
- Command/check that failed.
- Observed vs. expected result.
- Resolution (if resolved before re-decision).
- Unresolved anomalies block Phase 26D readiness claim.

## Claim boundary

Phase 26D evidence may support only:
- Limited hidden/default-off developer/test harness behavior confirmed (if tester evidence passes).
- Default-off gate confirmed.
- No production-visible rollout.
- Clean install, build, and unit test baseline.

Phase 26D evidence may **not** support:
- BETA_READY.
- Broad backup reliability.
- Guaranteed data-loss prevention.
- Production UI readiness.
- Broad dashboard/settings/library rollout.
- Production adapter-aware backup/export/restore.
- IndexedDB production storage readiness.
- Storage migration safety.
- Sync/cloud/account/auth/backend correctness.
- Automatic backup claims.
- Platform backup preservation claims.
- Cloud/account recovery.

## Rollback/removal note

To roll back Phase 26C:

1. Remove `docs/planning/phase26c-limited-default-off-ui-wiring-design.md`.
2. Remove `docs/testing/phase26c-limited-default-off-ui-wiring-run-pack.md`.
3. Remove `docs/release/phase26c-limited-default-off-ui-wiring-design-summary.md`.
4. Remove `scripts/validate-phase26c-limited-default-off-ui-wiring-design.js`.
5. Remove Phase 26C CI registration from `.github/workflows/e2e-smoke.yml`; restore Phase 26B as active gate.
6. No learner data migration or cleanup is required because Phase 26C does not migrate data or change backup/export/restore behavior.

## Next recommended phase

```
Next recommended phase: Phase 26D — Limited Default-Off UI Wiring Prototype and Tester Evidence
Phase 26D is a separate scoped implementation/evidence gate and is not automatically approved.
Phase 26C does not approve production-visible Backup Health UI.
Phase 26C does not approve broad dashboard/settings/library rollout.
Phase 26C does not approve production adapter-aware backup/export/restore.
Phase 26C does not approve BETA_READY.
```
