# Phase 29E — Targeted Missing Evidence Collection Seed

## Status token

```text
PHASE29E_TARGETED_MISSING_EVIDENCE_COLLECTION_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Purpose

Phase 29E is a separate targeted evidence collection gate. Its purpose is to collect the five missing evidence lane items identified in Phase 29D, in order to close the evidence gaps that prevent a beta gate decision for ShimeChamHoc v2.0.0-rc1.

Phase 29E is **not automatically approved** by Phase 29D or any prior phase. A separate evidence collection exercise and explicit decision must be made for each missing lane.

Phase 29E does not approve BETA_READY, public production readiness, guaranteed data-loss prevention, production restore rehearsal, real learner data restore rehearsal, storage migration, production adapter-aware backup/export/restore, or sync/cloud/account/auth/backend by default.

## Inputs from Phase 29D

Phase 29D delivered:

- Evidence packet review doc: `docs/testing/phase29d-evidence-packet-review-beta-gate-redecision.md`
- Release summary: `docs/release/phase29d-evidence-packet-review-beta-gate-redecision-summary.md`
- Phase 29E seed (this document): `docs/planning/phase29e-targeted-missing-evidence-collection-seed.md`
- Validator: `scripts/validate-phase29d-evidence-packet-review-beta-gate-redecision.js`

Phase 29D tokens carried forward:

```text
PHASE29D_EVIDENCE_PACKET_REVIEW_STATUS: COMPLETED_PARTIAL_EVIDENCE_PACKET_REVIEW
PHASE29D_BETA_GATE_REDECISION: NEEDS_MORE_EVIDENCE_BEFORE_LIMITED_BETA_CANDIDATE
PHASE29D_BETA_GATE_DECISION_SCOPE: PARTIAL_EVIDENCE_REVIEW_NO_BETA_READY_NO_PUBLIC_PRODUCTION_READY
PHASE29D_MISSING_EVIDENCE_STATUS: FIVE_LANES_NOT_EXECUTED_REQUIRES_TARGETED_COLLECTION
PHASE29E_TARGETED_MISSING_EVIDENCE_COLLECTION_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 29C evidence carried forward:

```text
PHASE29C_GENERATED_TEST_MANUAL_BROWSER_EVIDENCE_STATUS: COMPLETED_PARTIAL_GENERATED_TEST_MANUAL_BROWSER_EVIDENCE_RUN
PHASE29C_EVIDENCE_SCOPE: GENERATED_TEST_DATA_ONLY_NO_REAL_LEARNER_DATA_NO_BETA_READY
PHASE29C_EVIDENCE_DECISION: HOLD_BETA_GATE_PENDING_ADDITIONAL_EVIDENCE
PHASE29C_LIMITATION_STATUS: PARTIAL_BROWSER_EVIDENCE_NOT_BETA_READY
```

Phase 29D determined that five of six evidence lanes were NOT_EXECUTED in Phase 29C. Only the claim/copy audit lane achieved PASS_WITH_LIMITATIONS (landing page only). The beta gate re-decision is NEEDS_MORE_EVIDENCE_BEFORE_LIMITED_BETA_CANDIDATE. Phase 29E must collect targeted evidence for the five missing lanes.

## Target evidence lanes

Phase 29E must collect evidence for the following five lanes using generated/test data only. No real learner data may be used.

### Lane 1: Restore rehearsal manual browser lane with generated/test data only

Goal: Exercise the Phase 28D/28B generated/test restore rehearsal prototype in a browser session.

Required steps:
1. Start local Vite dev server on 127.0.0.1:4173 or equivalent port.
2. Open the app in a browser (Chromium/Chrome or Firefox).
3. Navigate to the restore rehearsal surface (Phase 28D prototype, dev-only harness if applicable).
4. Observe adapter detection, dry-run plan, and canExecuteRestore status.
5. Confirm canExecuteRestore remains false.
6. Inspect localStorage and/or IndexedDB for unexpected writes.
7. Open DevTools Network tab; confirm no unexpected network requests.
8. Record observed result, anomalies, and limitations.

Claim not allowed: Restore rehearsal passed in production; production restore execution; data-loss prevention guaranteed; real learner data restore.

### Lane 2: Backup health manual browser lane with generated/test data only

Goal: Exercise the /dev/backup-health-harness route (Phase 26D) in a browser session.

Required steps:
1. Start local Vite dev server on 127.0.0.1:4173 or equivalent port.
2. Open the app in a browser.
3. Navigate to /dev/backup-health-harness route.
4. Observe backup health signal state (last backup timestamp, status indicators).
5. Inspect localStorage for backup health state.
6. Open DevTools Network tab; confirm no unexpected network requests.
7. Record observed result, anomalies, and limitations.

Claim not allowed: Backup health browser validation passed in production; production backup guarantee; data-loss prevention.

### Lane 3: Adapter-awareness manual browser lane with generated/test data only

Goal: Exercise the Phase 27E thin read-only adapter-awareness integration in a browser session.

Required steps:
1. Start local Vite dev server on 127.0.0.1:4173 or equivalent port.
2. Open the app in a browser.
3. Navigate to the adapter-awareness surface (dev harness or settings display if applicable).
4. Observe adapter detection result (LocalStorage or IndexedDB).
5. Confirm no write path is triggered.
6. Inspect localStorage and/or IndexedDB for unexpected changes.
7. Open DevTools Network tab; confirm no unexpected network requests.
8. Record observed result, anomalies, and limitations.

Claim not allowed: Production adapter-aware backup/export/restore support; storage migration; data-loss prevention.

### Lane 4: Stress-adjacent import/quota lane with generated/test data only

Goal: Execute a large import scenario using synthetic generated/test data.

Required steps:
1. Prepare a synthetic deck with 100+ cards (generated/test data only; no real learner data).
2. Start local Vite dev server or run the built app.
3. Import the large deck via the app's import interface.
4. Observe import result: success, partial, or error.
5. Check localStorage or IndexedDB size after import.
6. Confirm no quota errors or data corruption visible.
7. Open DevTools Network tab during import; confirm no unexpected network requests.
8. Record observed result, anomalies, and limitations.

Claim not allowed: Stress-tested production readiness; import safety guaranteed; data-loss prevention.

### Lane 5: Rollback/removal lane in dev/test

Goal: Demonstrate that the Phase 25–28 prototype chain can be removed from a dev/test branch without breaking the build or unit tests.

Required steps:
1. On a dev/test branch, disable or remove the prototype feature flag or entry point for one or more Phase 25–28 prototype modules.
2. Run npm run build and confirm success.
3. Run npm run test:unit and confirm all tests pass.
4. Record any anomalies.
5. Confirm rollback does not break the app's core functionality (quiz study, import/export of non-prototype paths).

Claim not allowed: Production rollback guaranteed; rollback demonstrated in production; data-loss prevention on rollback.

## Required gates before evidence execution

Before any Phase 29E evidence session begins:

1. No real learner data — all data used must be generated/test data only. No real learner data may be entered, imported, or exported.
2. No production restore execution — canExecuteRestore must remain false in all sessions; no production restore may be triggered.
3. No backup file format change — evidence sessions must not trigger any backup file format change.
4. No storage migration — evidence sessions must not trigger a LocalStorage-to-IndexedDB migration or any other storage migration.
5. No sync/cloud/account/auth/backend — no sync, cloud, account, auth, or backend behavior may be introduced or demonstrated.
6. No telemetry/analytics — DevTools Network tab must be open to confirm no unexpected analytics or telemetry requests.
7. No fabrication — all evidence must be recorded exactly as observed; no evidence may be fabricated or inflated.
8. Session anomaly log required — each session must produce an anomaly log (even if empty).

## Data safety rules

- All evidence sessions use generated/test data only.
- No real learner data may be entered, imported, exported, or restored at any point.
- All import scenarios use synthetic decks generated for this purpose only.
- No real learner data backup files may be used.
- localStorage and IndexedDB inspection must confirm no unexpected data writes.
- If any anomaly involving real learner data is suspected, stop the session immediately and record the anomaly.

## Evidence packet requirements

Phase 29E must produce an evidence packet containing:

- For each lane: a record of steps performed, observed result, data used, anomalies, limitations, claim allowed, and claim not allowed.
- For each lane: explicit statement of whether the lane achieved PASS, PASS_WITH_LIMITATIONS, WARN, BLOCKED, or NOT_EXECUTED.
- For each lane: explicit statement that generated/test data only was used.
- An overall session anomaly log.
- A network/telemetry observation for each session (DevTools Network tab open).
- A no-real-learner-data confirmation.
- A no-restore-execution confirmation.
- A no-write/no-overwrite confirmation.

The evidence packet must not fabricate results. If a lane cannot be executed, it must be recorded as NOT_EXECUTED with a reason.

## Forbidden default approvals

Phase 29E must not approve by default:

- BETA_READY
- Public production readiness
- Guaranteed data-loss prevention
- Production restore rehearsal (real learner data)
- Real learner data restore rehearsal
- Backup file format changes
- Restore overwrite behavior changes
- Storage migration (LocalStorage → IndexedDB)
- Production adapter-aware backup/export/restore
- Sync/cloud/account/auth/backend
- Telemetry/analytics
- Broad external real-user validation without evidence
- Stress-tested readiness without evidence
- Any claim not supported by evidence collected in Phase 29E sessions

## Evidence needed before stronger claims

To advance from Phase 29E targeted evidence collection to a stronger beta gate claim, the following must be satisfied:

1. All five missing lanes (restore rehearsal, backup health, adapter-awareness, stress-adjacent, rollback/removal) must achieve at minimum PASS_WITH_LIMITATIONS evidence.
2. The existing claim/copy audit lane result from Phase 29C may be carried forward, but a full-app audit (all routes) is recommended before any BETA_READY claim.
3. All evidence must be from generated/test data only with no real learner data.
4. No unexpected writes, network requests, or storage migration may have been observed.
5. No sync/cloud/account/auth/backend behavior may have been observed.
6. No telemetry/analytics requests may have been observed.
7. Rollback/removal must be demonstrated successfully in dev/test.
8. An explicit beta gate decision token must be produced by a separate Phase 29F (or equivalent) evidence review gate.
9. No BETA_READY claim without all of the above.
10. No public production readiness claim without a separate explicit production readiness gate.

## Recommended next step

Phase 29E should begin by collecting targeted evidence for each of the five NOT_EXECUTED lanes identified in Phase 29D. Evidence must be collected using generated/test data only. Each lane must be exercised separately with a record of steps, observed result, anomalies, and limitations.

After Phase 29E evidence collection is complete, a Phase 29F (or equivalent) evidence review and beta gate re-decision gate must be convened. Phase 29F may not be automatically approved by Phase 29E.

Phase 29E is a separate evidence collection gate and is not automatically approved.
Phase 29D does not approve BETA_READY.
Phase 29D does not approve public production readiness.
Phase 29D does not approve guaranteed data-loss prevention.
Phase 29D does not approve restore execution.
Phase 29D does not approve production restore rehearsal.
Phase 29D does not approve real learner data restore rehearsal.
Phase 29D does not approve runtime backup/export/restore changes.
Phase 29D does not approve backup file format changes.
Phase 29D does not approve restore overwrite behavior changes.
Phase 29D does not approve storage migration.
Phase 29D does not approve sync/cloud/account/auth/backend.
Phase 29D does not approve telemetry/analytics.
