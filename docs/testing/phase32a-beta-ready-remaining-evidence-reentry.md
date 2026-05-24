# Phase 32A — Beta Ready Remaining Evidence Re-Entry

## Status tokens

```text
PHASE32A_BETA_READY_REMAINING_EVIDENCE_REENTRY_STATUS: COMPLETED_REENTRY_PLANNING
PHASE32A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE32A_BETA_READY_REENTRY_DECISION: PASS_TO_PHASE32B_REMAINING_EVIDENCE_COLLECTION
PHASE32A_REENTRY_SCOPE: PLANNING_EVIDENCE_REENTRY_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE32A_PHASE31_CHAIN_INPUT_STATUS: INTERNAL_VISIBILITY_CHAIN_CLOSED_WITH_LIMITED_INTERNAL_SCOPE
PHASE32B_REMAINING_EVIDENCE_COLLECTION_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Scope

Phase 32A is a docs/testing/evidence/release/planning/static-validator/CI-only phase. It re-enters the beta-ready evidence track after Phase 31, acknowledges the Phase 31 chain closure at limited internal visibility scope, identifies remaining evidence gaps, defines evidence lanes for Phase 32B collection, and prepares the Phase 32B remaining evidence collection seed. No src, tests, e2e, package files, prior phase files, backup/export/restore modules, storage drivers, sync/cloud/backend, telemetry, routes/navigation/settings/library/dashboard UI wiring, or dependencies are modified. No runtime behavior changes are made.

## Inputs from Phase 31J

Phase 31J returned:

```text
PHASE31J_DATA_SAFETY_UX_VISIBILITY_REDECISION_STATUS: COMPLETED_VISIBILITY_REDECISION
PHASE31J_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE31J_DATA_SAFETY_UX_VISIBILITY_REDECISION: PASS_TO_LIMITED_INTERNAL_VISIBILITY
PHASE31J_VISIBILITY_SCOPE: REDECISION_ONLY_NO_RUNTIME_VISIBILITY_CHANGE
PHASE31J_BROWSER_EVIDENCE_SOURCE_STATUS: DIRECT_BROWSER_RUN_REVIEWED
PHASE31J_PHASE31_CHAIN_STATUS: INTERNAL_VISIBILITY_CHAIN_CLOSED_WITH_LIMITED_INTERNAL_SCOPE
PHASE32A_BETA_READY_REMAINING_EVIDENCE_REENTRY_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 31J confirmed:
- Phase 31 internal visibility chain closed with limited internal scope
- LIMITED_BETA_CANDIDATE is the highest approved readiness status
- BETA_READY is not approved
- Ordinary-user Data Safety UX visibility is not approved
- No runtime behavior changes were made in Phase 31

Phase 31J did not approve BETA_READY. It only closed the Phase 31 Data Safety UX internal-visibility chain.

## Re-entry method

Phase 32A re-enters the beta-ready evidence track by:

1. Acknowledging the Phase 31J closure result as input only — no runtime changes required.
2. Reviewing the Phase 30C hold rationale: the beta-ready decision was held because the evidence packet was incomplete.
3. Enumerating all evidence lanes from Phase 29–31 to determine which are complete vs. pending.
4. Triaging remaining lanes by risk and evidence quality.
5. Selecting the most conservative passing decision consistent with the evidence triage.
6. Preparing a Phase 32B evidence collection seed with specific lane plans.

Phase 32A does not collect new evidence. It plans the collection for Phase 32B.

## Remaining evidence matrix

| Evidence lane | Prior status | Evidence needed | Data policy | Execution owner | Phase 32B collection plan | Decision impact | Claim allowed | Claim not allowed |
|---|---|---|---|---|---|---|---|---|
| restore rehearsal browser lane | NOT_COLLECTED | Direct Playwright browser run confirming Phase 28 restore rehearsal planner UI/UX, inert actions, no real data modification | Generated/test data only; no real learner data | Phase 32B executor with browser access | Playwright direct run via Phase 28 restore rehearsal planner route; headless Chromium; snapshot key behavior lanes | Provides browser-level evidence that restore rehearsal is inert and non-destructive | Restore rehearsal UI exists, is inert, does not modify real data | Restore rehearsal executes against production state; real learner data modified |
| adapter-awareness browser lane | NOT_COLLECTED | Direct Playwright browser run confirming Phase 27 adapter-awareness model display, inert/read-only behavior, no storage driver changes triggered | Generated/test data only; no real learner data | Phase 32B executor with browser access | Playwright direct run via adapter-awareness display surface; confirm read-only behavior, no driver switch triggered | Provides browser-level evidence that adapter-awareness display is safe and read-only | Adapter-awareness display is inert and read-only in browser | Adapter-awareness triggers storage driver switch; real storage migrated |
| before/after localStorage diff | NOT_COLLECTED | Before/after snapshot of localStorage across a study session, import, backup flow, and restore rehearsal — confirms storage boundaries and no unexpected writes | Generated/test data only; no real learner data | Phase 32B executor with browser/devtools access | Capture localStorage snapshot before and after each flow; diff entries; flag any unexpected writes | Confirms storage boundary is respected across all tested flows | localStorage diff is clean or expected for each flow | Unexpected storage writes identified; storage boundary breached |
| larger generated/test stress evidence | NOT_COLLECTED | Evidence run with a larger generated/test data set (multiple decks, hundreds of cards) confirming performance, quota behavior, and absence of data corruption under load | Generated/test data only; no real learner data | Phase 32B executor with browser/devtools access | Run with 10+ decks, 200+ generated cards; capture quota/performance; verify no corruption | Confirms app is stable under larger-than-minimal generated load | App is stable with larger generated/test data sets | App is validated for real learner production scale; broad stress-tested readiness is not claimed |
| rollback/removal evidence | PARTIAL | Evidence of complete feature removal/rollback for at least one major feature flag (e.g., FSRS flag removal, adapter-awareness flag removal); confirms rollback path is clean | Generated/test data only; no real learner data | Phase 32B executor with build/flag access | Rebuild with flag removed; confirm feature is absent; capture before/after; verify no residual state | Confirms rollback path is clean for at least one flag | Rollback path is clean for the tested flag | All flags have been rollback-tested; production rollback is fully validated |
| claim/copy cleanup and legacy release notes review | NOT_COMPLETED | Review all user-visible claims in the app for accuracy, Vietnamese-first copy, no overstatement of capabilities; review legacy release notes for conflicting or outdated claims | N/A — review only; no real learner data | Phase 32B reviewer | Manual review of user-visible strings, RELEASE_NOTES.md, RELEASE_NOTES_V2.md; flag any overstatements or outdated claims | Confirms claim boundaries are clean before any beta-ready consideration | Claims reviewed; known issues flagged | Claims are approved for production; no outstanding issues exist |
| Data Safety UX internal visibility evidence integration | COMPLETED_PHASE31J | Integrate Phase 31J visibility re-decision result into the beta-ready evidence packet; confirm Data Safety UX prototype is confirmed default-off with internal-only access | N/A — integration of existing evidence only | Phase 32A (this phase) | Phase 31J evidence is acknowledged as the basis for this lane; no additional collection required | Confirms Data Safety UX lane is closed at internal scope; does not expand to ordinary-user visibility | Phase 31J evidence is integrated as input to beta-ready evidence packet | Data Safety UX lane approves ordinary-user visibility; Data Safety UX lane approves BETA_READY |
| Beta Ready final re-decision input review | PENDING | Review all collected evidence against the Beta Ready decision criteria from Phase 30C; determine whether the evidence packet is sufficient for a BETA_READY decision | N/A — review only | Phase 32C or later phase after evidence collection complete | Collect all evidence from Phase 32B; present to re-decision reviewer; make BETA_READY or HOLD decision | Determines whether BETA_READY can be approved after evidence collection | Review is complete; decision is documented | BETA_READY is pre-approved before evidence collection; evidence packet is assumed sufficient |

## Phase 31 chain integration

Phase 31 began with data safety UX planning (Phase 31A) and closed with Phase 31J:

| Phase | Gate | Outcome |
|---|---|---|
| Phase 31A | Post-limited-beta roadmap / data safety UX planning | Planning complete |
| Phase 31B | Data safety UX design gate | Design gate passed |
| Phase 31C | Default-off data safety UX prototype | Prototype implemented, default-off |
| Phase 31D | Data safety UX evidence review | Static/unit evidence reviewed |
| Phase 31E | Data safety UX controlled visibility gate | Controlled visibility gate passed |
| Phase 31F | Data safety UX internal visibility gate | Internal visibility gate passed |
| Phase 31G | Data safety UX internal visibility implementation | Helper + Settings integration implemented |
| Phase 31H | Data safety UX internal visibility evidence review | Static/unit evidence reviewed |
| Phase 31I | Data safety UX internal browser evidence | Direct browser evidence all 11 lanes pass |
| Phase 31J | Data safety UX visibility re-decision | PASS_TO_LIMITED_INTERNAL_VISIBILITY — chain closed |

```text
PHASE31J_PHASE31_CHAIN_STATUS: INTERNAL_VISIBILITY_CHAIN_CLOSED_WITH_LIMITED_INTERNAL_SCOPE
```

The Phase 31 internal visibility chain is closed. The Data Safety UX prototype is confirmed at internal-only scope. This result is integrated into the Phase 32A evidence triage as the "Data Safety UX internal visibility evidence integration" lane — now COMPLETED.

## Restore rehearsal evidence lane

**Status:** NOT_COLLECTED

**What is needed:** Direct Playwright browser evidence for the Phase 28 restore rehearsal planner behavior. This evidence must confirm that the restore rehearsal UI exists, that all actions are inert (no real data modification), that no production storage is overwritten, and that the rehearsal planner does not trigger actual restore execution.

**Data policy:** Generated/test data only. No real learner data. No production backup files.

**Collection plan for Phase 32B:**
- Run Phase 28 restore rehearsal planner route via direct Playwright browser run
- Capture restore rehearsal UI rendering
- Confirm all action buttons are disabled or clearly labeled as non-destructive
- Capture localStorage before/after — confirm no unexpected writes
- Capture network requests — confirm no external calls
- Document all observations in the Phase 32B evidence packet

**Risk:** Without this evidence, the restore rehearsal path has no browser-level confirmation of inert behavior. This is required before any BETA_READY consideration.

## Adapter-awareness evidence lane

**Status:** NOT_COLLECTED

**What is needed:** Direct Playwright browser evidence for the Phase 27 adapter-awareness model. This evidence must confirm that the adapter-awareness display is read-only, that no storage driver changes are triggered by rendering, and that the display does not modify any storage state.

**Data policy:** Generated/test data only. No real learner data.

**Collection plan for Phase 32B:**
- Run adapter-awareness display surface via direct Playwright browser run
- Capture adapter-awareness rendering
- Confirm no storage driver switch is triggered
- Capture localStorage before/after — confirm no unexpected writes
- Capture network requests — confirm no external calls
- Document all observations in the Phase 32B evidence packet

**Risk:** Without this evidence, the adapter-awareness model has no browser-level confirmation of safe read-only behavior.

## LocalStorage before-after evidence lane

**Status:** NOT_COLLECTED

**What is needed:** Before/after snapshot of localStorage across four flows: (1) a study session, (2) an import, (3) a backup flow, (4) a restore rehearsal. Each snapshot pair must confirm storage boundaries and identify any unexpected writes.

**Data policy:** Generated/test data only. No real learner data.

**Collection plan for Phase 32B:**
- For each flow: capture localStorage keys/values before flow start
- Execute the flow with generated/test data
- Capture localStorage keys/values after flow completes
- Diff the before and after snapshots
- Flag any writes that were not expected for the flow
- Document the diff results in the Phase 32B evidence packet

**Risk:** Without this evidence, storage boundary behavior across key flows has not been directly confirmed.

## Larger generated/test stress evidence lane

**Status:** NOT_COLLECTED

**What is needed:** Evidence run with a larger generated/test data set (10+ decks, 200+ generated cards) confirming performance, quota behavior, and absence of data corruption under load.

**Data policy:** Generated/test data only. No real learner data.

**Collection plan for Phase 32B:**
- Generate a test data set: 10+ decks, 200+ cards
- Load the data set into the app via the import flow
- Run a study session across multiple decks
- Capture performance observations (timing, UI responsiveness)
- Check storage quota indicator if available
- Verify data integrity after session (no corruption)
- Document all observations in the Phase 32B evidence packet

**Risk:** Without this evidence, the app's behavior under larger-than-minimal data loads has not been confirmed. Stress-tested readiness is not claimed and is not approved.

## Rollback/removal evidence lane

**Status:** PARTIAL

**What is needed:** Evidence of complete feature removal/rollback for at least one major feature flag. Confirmed rollback paths reduce the risk of a beta release where a feature must be removed quickly.

**Data policy:** Generated/test data only. No real learner data.

**Collection plan for Phase 32B:**
- Select one major feature flag (e.g., FSRS experimental flag or adapter-awareness flag)
- Rebuild the app with the flag removed
- Confirm the feature is absent in the rebuilt app
- Capture before/after screenshots or DOM snapshots
- Confirm no residual state or errors in the rollback build
- Document the rollback evidence in the Phase 32B evidence packet

**Risk:** The rollback evidence is partial. A full clean rollback confirmation for at least one flag is required before BETA_READY consideration.

## Claim/copy and legacy release notes lane

**Status:** NOT_COMPLETED

**What is needed:** Review of all user-visible claims in the app for accuracy, Vietnamese-first copy, and no overstatement of capabilities. Review of legacy release notes (RELEASE_NOTES.md, RELEASE_NOTES_V2.md) for conflicting or outdated claims.

**Data policy:** N/A — review only.

**Collection plan for Phase 32B:**
- Enumerate all user-visible strings in the app that make capability claims
- Review each claim for accuracy and no overstatement
- Confirm Vietnamese-first language is used for learner-facing copy
- Review RELEASE_NOTES.md and RELEASE_NOTES_V2.md for claims that conflict with current implementation
- Flag outdated or overstated claims
- Document the claim/copy review results in the Phase 32B evidence packet

**Risk:** Outstanding claim/copy issues could mislead users or create incorrect expectations about app capabilities.

## Data Safety UX integration lane

**Status:** COMPLETED_PHASE31J

**What is confirmed:** Phase 31J closed the Data Safety UX internal visibility chain. The Data Safety UX prototype is confirmed default-off with internal-only access via `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY=1`. Phase 31I provided direct browser evidence confirming all 11 required lanes passed. This lane is integrated as a completed input to the beta-ready evidence packet.

**What this does not confirm:**
- Ordinary-user Data Safety UX visibility — not approved
- BETA_READY — not approved
- Any change to runtime behavior

## Beta Ready final re-decision input lane

**Status:** PENDING

**What is needed:** After all Phase 32B evidence lanes are collected, a re-decision review must assess whether the complete evidence packet is sufficient for a BETA_READY decision. This review cannot occur until all other lanes are collected.

**Collection plan:** Phase 32C (or later) will assemble the complete evidence packet and present it to the beta-ready re-decision gate.

**Risk:** This lane cannot be completed until all other evidence lanes are collected. BETA_READY is not pre-approved.

## Re-entry decision

```text
PHASE32A_BETA_READY_REENTRY_DECISION: PASS_TO_PHASE32B_REMAINING_EVIDENCE_COLLECTION
```

## Decision rationale

`PASS_TO_PHASE32B_REMAINING_EVIDENCE_COLLECTION` is chosen because:

1. Phase 31J closed the Data Safety UX internal visibility chain, resolving the one completed evidence lane.
2. Seven of eight required evidence lanes remain NOT_COLLECTED or PARTIAL.
3. No blocking issue was identified in the evidence triage that would require a HOLD.
4. The remaining lanes are well-defined and can be collected in Phase 32B.
5. `PASS_TO_PHASE32B_REMAINING_EVIDENCE_COLLECTION` is the most conservative passing decision consistent with the evidence triage and Phase 30C hold rationale.

`HOLD_BETA_READY_REENTRY` was not chosen because no specific new blocking issue was identified — the hold from Phase 30C remains in effect and is carried forward naturally as evidence collection proceeds.
`NEEDS_REENTRY_REWORK` was not chosen because the evidence lanes are well-defined and the triage is complete; no rework of the re-entry planning is required.

## What Phase 32A supports

- Acknowledges Phase 31J closure result as input to the evidence packet
- Identifies remaining evidence lanes and their status
- Defines collection plans for each remaining lane
- Selects the most conservative passing decision consistent with the evidence triage
- Prepares Phase 32B remaining evidence collection seed
- Confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status

## What Phase 32A does not approve

Phase 32A does not approve BETA_READY.
Phase 32A does not approve public production readiness.
Phase 32A does not approve guaranteed data-loss prevention.
Phase 32A does not approve restore execution.
Phase 32A does not approve production restore rehearsal.
Phase 32A does not approve real learner data restore rehearsal.
Phase 32A does not approve runtime backup/export/restore behavior changes.
Phase 32A does not approve backup file format changes.
Phase 32A does not approve restore overwrite behavior changes.
Phase 32A does not approve storage migration.
Phase 32A does not approve sync/cloud/account/auth/backend.
Phase 32A does not approve telemetry/analytics.
Phase 32A does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 32A does not approve BYOC/WebDAV/P2P/device-transfer implementation.
Phase 32A does not approve limited settings visibility to ordinary users.

## Claim boundary

Phase 32A confirms: the evidence triage is complete and Phase 32B evidence collection is the appropriate next step.

Phase 32A does not confirm: BETA_READY, production readiness, ordinary-user visibility, or any change to runtime behavior. These require separate evidence collection and decision phases.

## Next recommended phase

Next recommended phase: Phase 32B — Remaining Evidence Collection

Phase 32B is a separate evidence collection gate and is not automatically approved.
Phase 32A confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 32A does not approve BETA_READY.
Phase 32A does not approve public production readiness.
Phase 32A does not approve guaranteed data-loss prevention.
Phase 32A does not approve restore execution.
Phase 32A does not approve production restore rehearsal.
Phase 32A does not approve real learner data restore rehearsal.
Phase 32A does not approve runtime backup/export/restore behavior changes.
Phase 32A does not approve backup file format changes.
Phase 32A does not approve restore overwrite behavior changes.
Phase 32A does not approve storage migration.
Phase 32A does not approve sync/cloud/account/auth/backend.
Phase 32A does not approve telemetry/analytics.
Phase 32A does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 32A does not approve BYOC/WebDAV/P2P/device-transfer implementation.
Phase 32A does not approve limited settings visibility to ordinary users.
