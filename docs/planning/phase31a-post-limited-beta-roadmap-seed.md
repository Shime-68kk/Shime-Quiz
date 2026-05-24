# Phase 31A — Post-Limited-Beta Roadmap Seed

## Status token

```text
PHASE31A_POST_LIMITED_BETA_ROADMAP_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Purpose

Phase 31A is the post-limited-beta roadmap planning and research gate for ShimeChamhoc v2.0.0-rc1. It is a separate planning/research gate, not automatically approved by Phase 30C, Phase 30B, or any prior phase.

Phase 31A must plan the path from LIMITED_BETA_CANDIDATE toward BETA_READY by addressing the evidence gaps documented in Phase 30C. It may also plan new UX, data safety, and local-first research directions that are outside the evidence-collection work.

Phase 31A must not approve BETA_READY or any production readiness claim. Phase 31A is a planning gate only.

## Inputs from Phase 30C

Phase 30C delivered:
- Decision doc: `docs/testing/phase30c-beta-ready-decision-hold.md`
- Release summary: `docs/release/phase30c-beta-ready-decision-hold-summary.md`
- Phase 31A seed (this document): `docs/planning/phase31a-post-limited-beta-roadmap-seed.md`
- Validator: `scripts/validate-phase30c-beta-ready-decision-hold.js`

Phase 30C tokens:

```text
PHASE30C_BETA_READY_DECISION_STATUS: COMPLETED_BETA_READY_DECISION_GATE
PHASE30C_LIMITED_BETA_CANDIDATE_STATUS: CONFIRMED_FROM_PHASE30B
PHASE30C_BETA_READY_DECISION: NEEDS_MORE_EVIDENCE_FOR_BETA_READY
PHASE30C_DECISION_SCOPE: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE30C_REMAINING_BETA_READY_GAPS_STATUS: DOCUMENTED_FOR_FUTURE_EVIDENCE_COLLECTION
PHASE31A_POST_LIMITED_BETA_ROADMAP_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 30C chose NEEDS_MORE_EVIDENCE_FOR_BETA_READY. This advances to Phase 31A planning only. It does not approve BETA_READY.

Open evidence gaps inherited from Phase 30C:
1. Restore rehearsal browser lane — BLOCKED.
2. Adapter-awareness browser lane — BLOCKED.
3. No before/after localStorage diffs — not collected.
4. No 100+ card stress test — not performed.
5. No full rollback/removal execution — navigation-only.
6. No real learner data evidence — generated/test data only.
7. Dynamic copy audit boundary — static-only in Phase 30A.
8. Legacy release-notes claim — bounded as historical; not updated for BETA_READY scope.

## Roadmap constraints

Phase 31A operates under the following constraints:

1. **No default approvals**: Phase 31A must not approve BETA_READY by default. Any BETA_READY advancement requires a separate, explicitly-gated phase after evidence collection.
2. **Separate gate**: Phase 31A cannot be pre-approved by Phase 30C or any prior phase. An explicit Phase 31A planning output must be produced.
3. **Planning only**: Phase 31A is a planning/research gate. It must not introduce runtime source changes, storage migrations, restore execution, or production behavior changes.
4. **Conservative default**: If evidence planning is insufficient, the conservative planning position must be chosen.
5. **No fabrication**: Phase 31A must not fabricate evidence, claim that evidence was collected when it was not, or use Phase 31A planning as a substitute for actual evidence collection.
6. **Evidence collection requires a separate phase**: Plans made in Phase 31A for evidence collection are plans only. Actual evidence collection must occur in a separately-gated evidence phase.

## Recommended roadmap lanes

Phase 31A should plan the following roadmap lanes. Each lane is a separate planning item. Execution of any lane requires a separately-gated phase.

### Data safety UX lane

**Goal**: Plan a Data Safety Center / Local Backup Center UX concept that surfaces the app's local-first data safety model in a user-facing way.

**Motivation**: Current limited beta users receive explicit caveats about localStorage data safety (Phase 30B conditions). A Data Safety Center or Local Backup Center UX would make this information accessible within the app itself, reducing user confusion and improving trust.

**Scope**: UX planning, copy, and design only. No runtime implementation in Phase 31A. No guaranteed data-loss prevention.

**Items to plan**:
- User-facing explanation of localStorage as the storage backend.
- Backup/export feature discoverability and copy.
- Restore flow copy and risk communication.
- "Your data lives here" or equivalent mental model for local-first apps.
- Failure scenario copy (localStorage cleared, browser storage quota exceeded, export interrupted).

**Out of scope**: Sync, cloud, account, BYOC/WebDAV, P2P/device transfer, server-backed storage. These are research-only topics (see local-first UX research lane below).

### Evidence collection lane

**Goal**: Plan and execute the evidence collection required to unblock or de-scope the remaining BETA_READY evidence gaps from Phase 30C.

**Priority order**:
1. **Restore rehearsal browser lane (BLOCKED)**: Plan a targeted restore rehearsal browser evidence run using generated/test data. Define: setup steps, before/after localStorage observation, success criteria, failure criteria. Execute in a separately-gated phase.
2. **Adapter-awareness browser lane (BLOCKED)**: Clarify whether the adapter-awareness harness is test-only or production-enabled. If test-only, draft de-scope rationale for BETA_READY. If production-enabled, plan a live browser evidence run.
3. **Before/after localStorage diff**: Add localStorage diff capture to the next browser evidence run. Use browser developer tools or Playwright localStorage snapshots.
4. **100+ card stress test**: Use existing card generation tooling to create a 100+ card test library. Define performance observation criteria. Execute in a separately-gated phase.
5. **Full rollback/removal execution**: Define rollback/removal test scenario. Execute against generated/test data. Document before/after localStorage state.
6. **Real learner data protocol**: Draft a real-learner-data evidence protocol with explicit consent and privacy protections, or draft formal de-scope rationale for BETA_READY claim scope.

### Claim/copy cleanup lane

**Goal**: Plan cleanup of legacy release-notes claims and any other historical copy that does not reflect the Phase 29C–30B evidence level.

**Items to plan**:
- RELEASE_NOTES.md / RELEASE_NOTES_V2.md: Plan update or contextualization of "AI-verified beta candidate: YES — SHIP" relative to Phase 29C–30B evidence level with documented limitations.
- Dynamic copy audit: Plan a live browser copy audit of dynamically rendered routes (study room, dashboard, analytics panel) to verify no forbidden claims in runtime-composed text.
- Limited beta candidate documentation: Plan user-facing documentation that reflects LIMITED_BETA_CANDIDATE status, caveats, and known limitations for any actual beta users.

**Out of scope**: Any new marketing claims, production readiness claims, or BETA_READY claims. This lane is cleanup and contextualization only.

### Local-first UX research lane

**Goal**: Research local-first UX patterns for data safety, backup, and restore without committing to any server/sync/cloud architecture.

**Research questions**:
- How do other local-first apps (offline-first web apps, browser-based tools) communicate data safety to users?
- What are common UX patterns for backup/export discoverability?
- What are the failure modes of localStorage-based storage and how are they communicated?

**Optional Opus 4.7 research gate**: If the team wants to compare future architecture options — Data Safety Center, Local Backup Center, BYOC (Bring Your Own Cloud), WebDAV, P2P/device transfer, or no-server sync — an Opus 4.7 research gate in Phase 31A or a separate sub-phase can be used. This research is exploratory only and does not commit to any implementation.

**Out of scope**: Any server/sync/cloud implementation. Any BYOC/WebDAV/P2P implementation. Any architecture commitment. Any production behavior changes.

## Data safety UX lane

The Data Safety Center / Local Backup Center UX planning lane is the highest-priority non-evidence lane for Phase 31A.

**Rationale**: The most common failure mode for local-first beta users is unexpected data loss from localStorage clearing. A Data Safety Center UX helps users understand the risk model and take action (backup, export) before data loss occurs. This is a user-trust and data safety issue, not a feature request.

**Recommended scope for Phase 31A planning**:
1. Define the scope and entry point of a Data Safety Center / Local Backup Center UX panel.
2. Draft copy for the panel, including: what localStorage is (user-readable), how to export, how to restore, what happens if localStorage is cleared, and explicit risk acknowledgment.
3. Identify where in the current app navigation the panel would fit (settings, dashboard, or dedicated route).
4. Define what the panel does NOT do (no cloud sync, no automatic backup, no guaranteed prevention).

**This is planning only. No runtime implementation in Phase 31A.**

## Evidence collection lane

See recommended roadmap lanes above. Priority order for evidence collection:

1. Restore rehearsal browser lane (BLOCKED) — highest priority; blocks BETA_READY.
2. Adapter-awareness browser lane (BLOCKED) — second priority; blocks BETA_READY or requires de-scope rationale.
3. Before/after localStorage diff — third priority; strengthens evidence basis.
4. 100+ card stress test — fourth priority; required for stress-tested readiness claim or de-scope.
5. Full rollback/removal execution — fifth priority; required for rollback safety claim or de-scope.
6. Real learner data protocol — sixth priority; required for real-world readiness claim or de-scope.

Each item requires a separately-gated evidence phase. Phase 31A planning does not substitute for evidence collection.

## Claim/copy cleanup lane

See recommended roadmap lanes above. Priority order for claim/copy cleanup:

1. Legacy release-notes claim (RELEASE_NOTES.md, RELEASE_NOTES_V2.md) — highest priority for BETA_READY scope readiness.
2. Dynamic copy audit (live browser spot-check of dynamically rendered routes).
3. Limited beta candidate documentation for actual beta users.

## Local-first UX research lane

See recommended roadmap lanes above. This lane may proceed in parallel with evidence collection. It does not block BETA_READY evidence collection.

**Recommended model usage**: Claude Sonnet 4.6 is sufficient for Phase 31A planning. Opus 4.7 is recommended only if the team wants to conduct a deep research comparison of Data Safety Center versus BYOC/WebDAV/P2P/device transfer versus no-server sync options. This Opus 4.7 gate is optional and should be scoped as research-only, with no implementation commitment.

## Forbidden default approvals

Phase 31A must not approve by default:

- BETA_READY without a separate evidence-collection phase and explicit evidence review.
- Public production release.
- Guaranteed data-loss prevention.
- Production restore rehearsal (real learner data).
- Real learner data restore rehearsal.
- Restore execution guarantees.
- Adapter-awareness production safety.
- Backup file format changes.
- Restore overwrite behavior changes.
- Storage migration (LocalStorage → IndexedDB).
- Sync/cloud/account/auth/backend.
- Telemetry/analytics (external user tracking).
- BYOC/WebDAV/P2P/device transfer architecture commitment.
- Broad external real-user validation without evidence.
- Stress-tested readiness without evidence.
- Built-in AI/OCR/API-key/BYOK behavior.
- Any claim not supported by Phase 31A evidence reviewed.

## Recommended model usage

- **Claude Sonnet 4.6**: Recommended for Phase 31A planning, docs, validator, and CI work. Sufficient for all Phase 31A tasks.
- **Claude Opus 4.7**: Optional for deep research on BYOC/WebDAV/P2P/device transfer comparison, Data Safety Center architecture options, or no-server sync model comparison. If used, scope the Opus 4.7 gate as research-only with no implementation commitment. Opus 4.7 is not required for Phase 31A.

## Recommended next step

Phase 31A should begin by reviewing the Phase 30C decision and the open evidence gaps. For each blocked lane, decide whether to plan evidence collection or plan de-scope rationale. Then produce a Phase 31A planning output with explicit roadmap decisions for each lane.

Phase 31A is a separate planning/research gate and is not automatically approved.
Phase 30C confirms LIMITED_BETA_CANDIDATE from Phase 30B remains the highest approved readiness status.
Phase 30C does not approve BETA_READY.
Phase 30C does not approve public production readiness.
Phase 30C does not approve guaranteed data-loss prevention.
Phase 30C does not approve restore execution.
Phase 30C does not approve production restore rehearsal.
Phase 30C does not approve real learner data restore rehearsal.
Phase 30C does not approve runtime backup/export/restore changes.
Phase 30C does not approve backup file format changes.
Phase 30C does not approve restore overwrite behavior changes.
Phase 30C does not approve storage migration.
Phase 30C does not approve sync/cloud/account/auth/backend.
Phase 30C does not approve telemetry/analytics.
Phase 30C does not approve built-in AI/OCR/API-key/BYOK behavior.
