# Phase 31A — Post-Limited-Beta Roadmap / Data Safety UX Planning

## Status tokens

```text
PHASE31A_POST_LIMITED_BETA_ROADMAP_STATUS: COMPLETED_POST_LIMITED_BETA_ROADMAP_PLANNING
PHASE31A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE31A_POST_LIMITED_BETA_ROADMAP_DECISION: PASS_TO_PHASE31B_DATA_SAFETY_UX_DESIGN_GATE
PHASE31A_ROADMAP_SCOPE: PLANNING_RESEARCH_ONLY_NO_RUNTIME_SYNC_CLOUD_OR_BACKEND
PHASE31B_DATA_SAFETY_UX_DESIGN_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Scope

Phase 31A is a planning/research/docs gate. It produces a post-limited-beta roadmap, a Data Safety UX planning package, a local-first UX research brief, a conservative release summary, and a Phase 31B seed.

Phase 31A does not introduce runtime source changes, storage migrations, restore execution, sync/cloud/account/auth/backend, or production-visible UI.

## Inputs from Phase 30C

Phase 30C delivered:
- Decision doc: `docs/testing/phase30c-beta-ready-decision-hold.md`
- Release summary: `docs/release/phase30c-beta-ready-decision-hold-summary.md`
- Phase 31A seed: `docs/planning/phase31a-post-limited-beta-roadmap-seed.md`
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

Inherited open evidence gaps from Phase 30C:
1. Restore rehearsal browser lane — BLOCKED.
2. Adapter-awareness browser lane — BLOCKED.
3. Before/after localStorage diff evidence — not collected.
4. 100+ card generated/test stress evidence — not performed.
5. Full rollback/removal execution evidence — navigation-only.
6. Real learner data evidence — generated/test data only.
7. Dynamic route copy audit — static-only boundary in Phase 30A.
8. Legacy release-notes claim — bounded as historical; not rewritten for BETA_READY scope.
9. Public production readiness — absent.
10. Guaranteed data-loss prevention — absent.
11. Sync/cloud/account/backend behavior — absent.

## Current readiness state

Highest approved readiness after Phase 30C:

```text
LIMITED_BETA_CANDIDATE
```

Not approved and not changed by Phase 31A:

```text
BETA_READY
public production readiness
broad beta release
guaranteed data-loss prevention
restore execution
production restore rehearsal
real learner data restore rehearsal
runtime backup/export/restore changes
backup file format changes
restore overwrite behavior changes
storage migration
sync/cloud/account/auth/backend
telemetry/analytics approval
built-in AI/OCR/API-key/BYOK behavior
BYOC/WebDAV/P2P/device-transfer implementation
```

## Planning method

Phase 31A reviewed the Phase 30C open evidence gaps and Phase 31A seed. For each lane:
1. Confirmed whether the lane is planning-only or requires separate evidence execution.
2. Assigned a recommended roadmap order.
3. Defined explicit guardrails and forbidden defaults for each lane.
4. Prepared a Phase 31B seed for the Data Safety UX design gate.

No fabricated evidence. No substitute planning for actual evidence. Evidence collection requires a separate, explicitly-gated phase.

## Roadmap decision table

| Lane | Purpose | User value | Risk | Evidence needed | Runtime impact | Decision | Guardrail |
|------|---------|-----------|------|-----------------|---------------|----------|-----------|
| Data Safety Center / Local Backup Center UX planning | Surface local-first data safety model in the UI | High — reduces user confusion and data loss risk | Low — planning only | None for planning; design review in Phase 31B | None in Phase 31A | PLAN — Phase 31B design gate | No runtime implementation in Phase 31A |
| Backup reminder / export UX planning | Improve backup discoverability and copy | High — reduces surprise data loss | Low — planning only | None for planning | None in Phase 31A | PLAN — include in Phase 31B scope | No runtime reminders in Phase 31A |
| Import preview UX improvement planning | Better user feedback during import flow | Medium — improves UX confidence | Low — planning only | None for planning | None in Phase 31A | PLAN — include in Phase 31B scope | No import flow changes in Phase 31A |
| Restore rehearsal browser evidence collection | Unblock BETA_READY restore rehearsal gap | High — required for BETA_READY | Medium — browser execution | Browser execution in a separately-gated phase | None in Phase 31A | PLAN — separate evidence phase | No execution in Phase 31A |
| Adapter-awareness browser evidence collection | Unblock or de-scope adapter-awareness gap | High — required for BETA_READY or de-scope | Medium — browser execution | Browser execution in a separately-gated phase | None in Phase 31A | PLAN — separate evidence phase | No execution in Phase 31A |
| Before/after localStorage diff evidence | Strengthen evidence basis | Medium — supports BETA_READY claim | Low — developer tooling | Capture in next browser evidence run | None in Phase 31A | PLAN — add to next evidence phase | No evidence execution in Phase 31A |
| Larger generated/test stress evidence | 100+ card stress coverage | Medium — required for stress-tested claim | Low — generated data | Execute in a separately-gated evidence phase | None in Phase 31A | PLAN — separate evidence phase | No stress test execution in Phase 31A |
| Full rollback/removal evidence planning | Rollback/removal execution evidence | Medium — required for rollback claim | Low — test data | Execute in a separately-gated evidence phase | None in Phase 31A | PLAN — separate evidence phase | No execution in Phase 31A |
| Legacy release-notes claim cleanup planning | Contextualize historical SHIP claim relative to Phase 30B evidence | High — prevents misleading claims | Low — copy edit only | None for planning | None in Phase 31A | PLAN — separate copy phase | Do not add BETA_READY claims |
| Analytics/telemetry wording cleanup planning | Remove or scope any analytics/telemetry copy | Medium — avoids user privacy confusion | Low — planning only | None for planning | None in Phase 31A | PLAN — include in Phase 31B scope | No telemetry/analytics approval |
| Local-first UX research | Research local-first data safety UX patterns | High — informs Data Safety Center design | Low — research only | None | None | RESEARCH — included in Phase 31A brief | No server/sync/cloud commitment |
| No-server device-transfer research | Research no-server device-transfer options | Medium — future convenience | Low — research only | None | None | RESEARCH — include in Opus 4.7 gate if desired | No device-transfer implementation |
| BYOC/WebDAV encrypted backup research | Research BYOC/WebDAV options | Medium — future user control | High — architecture commitment risk | None | None | RESEARCH ONLY — no implementation | No BYOC/WebDAV implementation; Opus 4.7 gate optional |
| P2P/WebRTC transfer research | Research P2P transfer options | Medium — future convenience | High — conflict resolution complexity | None | None | RESEARCH ONLY — no implementation | No P2P implementation; Opus 4.7 gate optional |

## Data Safety Center / Local Backup Center lane

**Goal**: Plan a Data Safety Center / Local Backup Center UX that surfaces the app's local-first storage model and backup/export flow in a user-facing panel.

**Motivation**: Limited beta users currently rely on explicit out-of-band caveats (Phase 30B conditions) about localStorage data safety. An in-app Data Safety Center reduces user confusion, improves trust, and helps users protect their data before loss occurs.

**Planned scope for Phase 31B design gate**:
1. Define scope and entry point: settings panel, dashboard section, or dedicated route.
2. Draft copy: what localStorage is (user-readable), how to export, how to restore, what happens if localStorage is cleared, explicit risk acknowledgment.
3. Identify failure scenario copy: quota exceeded, browser storage cleared, export interrupted.
4. Define what the panel does NOT do: no cloud sync, no automatic backup, no guaranteed prevention.
5. Define candidate UX surfaces (see Phase 31B seed).

**This is planning only. No runtime Data Safety Center implementation in Phase 31A. Any runtime implementation is deferred to a later design/prototype phase.**

## Evidence collection lane

Evidence collection requires a separately-gated evidence phase. Phase 31A planning does not substitute for evidence collection.

Priority order:
1. Restore rehearsal browser lane (BLOCKED) — highest priority; blocks BETA_READY.
2. Adapter-awareness browser lane (BLOCKED) — second; blocks BETA_READY or requires de-scope.
3. Before/after localStorage diff — third; strengthens evidence basis.
4. 100+ card generated/test stress — fourth; required for stress-tested claim or de-scope.
5. Full rollback/removal execution — fifth; required for rollback claim or de-scope.
6. Real learner data protocol — sixth; required for real-world readiness or de-scope.

## Claim/copy cleanup lane

Priority order:
1. Legacy release-notes claim (RELEASE_NOTES.md, RELEASE_NOTES_V2.md) — highest priority; bounded as historical but not rewritten for Phase 30B evidence level.
2. Dynamic copy audit — live browser spot-check of dynamically rendered routes.
3. Limited beta candidate documentation for actual beta users.

This lane is cleanup and contextualization only. Do not add BETA_READY claims.

## Local-first UX research lane

Included in Phase 31A via `docs/research/phase31a-local-first-ux-research-brief.md`. This brief covers:
- Current product tension between local-first storage and user expectations.
- Options 1–6 (better local backup UX, Data Safety Center, backup reminders, one-time device transfer, BYOC/WebDAV, P2P/WebRTC).
- Comparative risk table.
- Recommendation: Data Safety Center / Local Backup Center first; evidence collection lanes in parallel; BYOC/WebDAV/P2P research deferred to Opus 4.7 gate if desired.

## No-server convenience lane

**No-server device-transfer** and similar convenience options (QR-code export, local WiFi transfer) are research-only topics. Phase 31A does not approve or plan runtime implementation of any no-server device-transfer mechanism.

If the team wants to explore this option, an Opus 4.7 research gate in a separate sub-phase can be used. No implementation commitment.

## Deferred sync/BYOC/P2P research lane

BYOC/WebDAV, P2P/WebRTC, and server-based sync options are research-only and not approved for implementation.

- **BYOC/WebDAV**: Allows users to store encrypted backups in their own cloud (Dropbox, Google Drive, WebDAV server). High user value for data portability. High complexity: credential management, encryption, conflict resolution. Deferred.
- **P2P/WebRTC**: Direct device-to-device transfer without a server. Medium user value. High complexity: NAT traversal, conflict resolution, connection reliability. Deferred.
- **Server sync/account/auth/backend**: Not approved and not planned for any near-term phase. Remains outside the product scope for this cycle.

An optional Opus 4.7 research gate can compare these options with no implementation commitment.

## Recommended roadmap order

1. **Phase 31B** — Data Safety UX Design Gate: design-only, no runtime implementation.
2. **Phase 31C or parallel** — Evidence collection phase: restore rehearsal browser lane, adapter-awareness browser lane, before/after localStorage diff, stress test.
3. **Later** — Claim/copy cleanup phase: release-notes contextualization, dynamic copy audit.
4. **Optional** — Opus 4.7 research gate for BYOC/WebDAV/P2P/device-transfer comparison.
5. **Future** — BETA_READY gate, after evidence gaps are resolved and claim/copy is cleaned up.

## Chosen roadmap decision

```text
PHASE31A_POST_LIMITED_BETA_ROADMAP_DECISION: PASS_TO_PHASE31B_DATA_SAFETY_UX_DESIGN_GATE
```

## Decision rationale

Phase 31A planning confirms:
- LIMITED_BETA_CANDIDATE remains the highest approved readiness.
- BETA_READY gaps are documented and unresolved.
- The Data Safety Center / Local Backup Center lane is the highest-value non-evidence lane and can begin as a design-only gate in Phase 31B.
- Evidence collection lanes are planned but not executed; each requires a separate gated phase.
- BYOC/WebDAV/P2P research is deferred and research-only.
- No runtime changes, no production behavior changes, no migrations.

PASS_TO_PHASE31B is the appropriate decision because:
- Planning output is complete.
- Phase 31B design gate is scoped conservatively (design-only, no runtime implementation).
- No forbidden default approvals were made.
- All evidence gaps remain open and require separate phases.

## What Phase 31A supports

- Post-limited-beta roadmap planning.
- Data Safety Center / Local Backup Center UX planning (design-only, no runtime).
- Local-first UX research brief.
- Evidence collection planning (separate execution phases required).
- Claim/copy cleanup planning (separate execution phases required).
- Deferred BYOC/WebDAV/P2P research lane (research-only, no implementation).
- Phase 31B seed.

## What Phase 31A does not approve

Phase 31A does not approve BETA_READY.
Phase 31A does not approve public production readiness.
Phase 31A does not approve guaranteed data-loss prevention.
Phase 31A does not approve restore execution.
Phase 31A does not approve production restore rehearsal.
Phase 31A does not approve real learner data restore rehearsal.
Phase 31A does not approve runtime backup/export/restore changes.
Phase 31A does not approve backup file format changes.
Phase 31A does not approve restore overwrite behavior changes.
Phase 31A does not approve storage migration.
Phase 31A does not approve sync/cloud/account/auth/backend.
Phase 31A does not approve telemetry/analytics.
Phase 31A does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 31A does not approve BYOC/WebDAV/P2P/device-transfer implementation.

## Phase 31B handoff

Phase 31B is a Data Safety UX Design Gate. It receives:
- This roadmap doc.
- Local-first UX research brief.
- Phase 31B seed: `docs/planning/phase31b-data-safety-ux-design-gate-seed.md`.

Phase 31B is a separate design gate and is not automatically approved by Phase 31A.

Phase 31B must not implement runtime Data Safety Center behavior. Any runtime prototype is deferred to a later phase after the design gate.

## Claim boundary

Phase 31A is a planning/research/docs gate. No evidence was collected in Phase 31A. No browser execution was performed in Phase 31A. No runtime behavior was changed in Phase 31A. Planning docs produced in Phase 31A are plans only and do not substitute for actual evidence collection or implementation.

Phase 31A confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status. BETA_READY is not approved. Public production readiness is not approved.

## Next recommended phase

Next recommended phase: Phase 31B — Data Safety UX Design Gate.
Phase 31B is a separate design gate and is not automatically approved.
Phase 31A confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 31A does not approve BETA_READY.
Phase 31A does not approve public production readiness.
Phase 31A does not approve guaranteed data-loss prevention.
Phase 31A does not approve restore execution.
Phase 31A does not approve production restore rehearsal.
Phase 31A does not approve real learner data restore rehearsal.
Phase 31A does not approve runtime backup/export/restore changes.
Phase 31A does not approve backup file format changes.
Phase 31A does not approve restore overwrite behavior changes.
Phase 31A does not approve storage migration.
Phase 31A does not approve sync/cloud/account/auth/backend.
Phase 31A does not approve telemetry/analytics.
Phase 31A does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 31A does not approve BYOC/WebDAV/P2P/device-transfer implementation.
