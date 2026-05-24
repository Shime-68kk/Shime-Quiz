# Phase 31B — Data Safety UX Design Gate

## Status tokens

```text
PHASE31B_DATA_SAFETY_UX_DESIGN_STATUS: COMPLETED_DATA_SAFETY_UX_DESIGN_GATE
PHASE31B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE31B_DATA_SAFETY_UX_DESIGN_DECISION: PASS_TO_PHASE31C_DATA_SAFETY_UX_PROTOTYPE
PHASE31B_DESIGN_SCOPE: DESIGN_ONLY_NO_RUNTIME_BACKUP_RESTORE_SYNC_CLOUD_OR_BACKEND
PHASE31C_DATA_SAFETY_UX_PROTOTYPE_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Scope

Phase 31B is a Data Safety UX Design Gate. It produces:
- A reviewed, constrained UX design for a Data Safety Center / Local Backup Center panel.
- A UX spec with defined surfaces, state model, and copy boundaries.
- A conservative release summary.
- A Phase 31C seed for a separately gated prototype phase.

Phase 31B does not implement runtime Data Safety Center behavior. Any runtime prototype is deferred to Phase 31C or later, after the design gate.

Phase 31B is a planning/design/docs/static-validator/CI-only gate. No runtime source changes. No unit test changes. No e2e changes. No production imports. No restore execution. No backup/export/restore behavior changes. No sync/cloud/account/auth/backend. No BYOC/WebDAV/P2P implementation. No production-visible UI changes. No BETA_READY approval.

## Inputs from Phase 31A

Phase 31A delivered:
- Roadmap doc: `docs/planning/phase31a-post-limited-beta-roadmap-data-safety-ux-planning.md`
- Local-first UX research brief: `docs/research/phase31a-local-first-ux-research-brief.md`
- Release summary: `docs/release/phase31a-post-limited-beta-roadmap-summary.md`
- Phase 31B seed: `docs/planning/phase31b-data-safety-ux-design-gate-seed.md`

Phase 31A tokens relevant to Phase 31B:

```text
PHASE31A_POST_LIMITED_BETA_ROADMAP_STATUS: COMPLETED_POST_LIMITED_BETA_ROADMAP_PLANNING
PHASE31A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE31A_POST_LIMITED_BETA_ROADMAP_DECISION: PASS_TO_PHASE31B_DATA_SAFETY_UX_DESIGN_GATE
PHASE31A_ROADMAP_SCOPE: PLANNING_RESEARCH_ONLY_NO_RUNTIME_SYNC_CLOUD_OR_BACKEND
PHASE31B_DATA_SAFETY_UX_DESIGN_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 31A key decisions for Phase 31B:
- Data Safety Center / Local Backup Center UX planning is the highest-priority non-evidence lane.
- Backup reminder and import preview UX planning included in Phase 31B scope.
- No runtime implementation in Phase 31B.
- No cloud sync, BYOC/WebDAV, P2P, or server infrastructure in Phase 31B.
- All BETA_READY gaps documented and unresolved; require separate evidence phases.

## Current readiness state

Highest approved readiness after Phase 31A:

```text
LIMITED_BETA_CANDIDATE
```

Not approved and not changed by Phase 31B:

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

## Design gate method

Phase 31B reviewed:
1. Phase 31A roadmap doc and local-first UX research brief.
2. Phase 31B seed candidate UX surfaces (A–D: settings panel, dashboard section, dedicated route, modal).
3. Existing open evidence gaps from Phase 30C (inherited through Phase 31A).
4. Required guardrails from Phase 31B seed.

For each candidate design area:
1. Assessed user value, complexity, runtime impact, and evidence requirement.
2. Assigned a conservative design scope.
3. Defined explicit guardrails.
4. Identified what requires a separately-gated prototype phase.

No fabricated evidence. No substitute design for actual runtime implementation. Any runtime change requires a separate, explicitly-gated prototype phase.

## Design decision table

| Design area | Purpose | User value | Risk | Evidence needed | Runtime impact | Decision | Guardrail |
|---|---|---|---|---|---|---|---|
| Data Safety Center overview card | Surface local-first data model to user | High — reduces confusion and data-loss risk | Low — design only | Design review in Phase 31B; runtime evidence in Phase 31C | None in Phase 31B | DESIGN — include in Phase 31C prototype | No runtime implementation in Phase 31B |
| Local Backup Center / export entry point | Entry point to manual export flow | High — improves backup discoverability | Low — design only | Design review in Phase 31B | None in Phase 31B | DESIGN — include in Phase 31C prototype | No export behavior change in Phase 31B |
| Import preview entry point | Entry point for import with preview/review | Medium — improves import confidence | Low — design only | Design review in Phase 31B | None in Phase 31B | DESIGN — include in Phase 31C prototype scope | No import flow changes in Phase 31B |
| Restore warning and boundaries | Copy warning user of restore risks | High — prevents accidental data overwrite | Low — copy only | Design review; runtime evidence in Phase 31C | None in Phase 31B | DESIGN — include restore caution block | No restore execution in Phase 31B |
| Backup reminder concept | Surface last export timestamp; remind user to export | High — reduces surprise data loss | Low — design only | Design review in Phase 31B | None in Phase 31B | DESIGN — include as optional reminder concept | No runtime reminder triggers in Phase 31B |
| Last-backup-status concept | Read and display last export date from localStorage | Medium — improves data-safety transparency | Low — read-only concept | Design review; runtime read-only evidence in Phase 31C | None in Phase 31B | DESIGN — include as read-only status concept | No localStorage writes from new code in Phase 31B |
| Storage-location copy | Explain localStorage model in user-readable terms | High — sets accurate user expectations | Low — copy only | Design review in Phase 31B | None in Phase 31B | DESIGN — include storage explanation block | No storage driver changes in Phase 31B |
| Local-only analytics wording | Clarify no external analytics or telemetry | Medium — avoids user privacy confusion | Low — copy only | Design review in Phase 31B | None in Phase 31B | DESIGN — include in help/FAQ block | No telemetry/analytics approval in Phase 31B |
| Legacy release-notes cleanup reminder | Note that RELEASE_NOTES claim needs contextualization | Medium — prevents misleading beta claims | Low — documentation only | Separate copy phase; not Phase 31B execution | None in Phase 31B | PLAN — separate copy phase; do not edit RELEASE_NOTES in Phase 31B | Do not add BETA_READY claims |
| Evidence gaps panel | Surface open evidence gaps to user with honest disclaimers | High — prevents over-claiming readiness | Low — copy only | Design review in Phase 31B | None in Phase 31B | DESIGN — include evidence gaps / beta limitations panel | No evidence collection execution in Phase 31B |
| Help/FAQ copy | Answer user questions about data safety, local storage, and backups | High — reduces support burden | Low — copy only | Design review in Phase 31B | None in Phase 31B | DESIGN — include help/FAQ block | No external links or telemetry |
| Empty state | Design for user with no export history | Medium — improves first-run UX | Low — design only | Design review in Phase 31B | None in Phase 31B | DESIGN — include empty state variant | No runtime state initialization in Phase 31B |
| Error state | Design for failed or interrupted export/import | Medium — improves error recovery UX | Low — design only | Design review in Phase 31B | None in Phase 31B | DESIGN — include error state variant | No runtime error handling in Phase 31B |
| Disabled/default-off state | Design for features behind a default-off flag | Low–Medium — prepares for conservative rollout | Low — design only | Design review in Phase 31B | None in Phase 31B | DESIGN — include disabled/default-off variant | No flag/feature-gate runtime in Phase 31B |
| Accessibility/copy clarity | Ensure copy is readable, clear, and accessible | Medium — improves usability for all users | Low — copy only | Design review in Phase 31B | None in Phase 31B | DESIGN — apply to all sections | No ARIA or DOM changes in Phase 31B |
| Future sync/BYOC/P2P research warning | Warn that cloud sync/BYOC/P2P is not implemented or approved | High — prevents over-claiming | Low — copy only | Design review in Phase 31B | None in Phase 31B | DESIGN — include non-goals section in panel | No BYOC/WebDAV/P2P implementation or approval in Phase 31B |

## Data Safety Center concept

The Data Safety Center is a panel that surfaces the app's local-first storage model and backup/export flow to the user.

**Motivation**: Limited beta users rely on out-of-band caveats about localStorage data safety. An in-app panel reduces confusion, improves trust, and helps users protect their data before loss occurs.

**Chosen entry point approach for Phase 31B design**: Settings panel section (Surface A from Phase 31B seed) as the minimal viable design, with a modal (Surface D) as an alternative for higher-complexity flows. A dedicated route (Surface C) is aspirational and deferred to a later prototype phase.

**Core content concept**:
1. Overview card: one-paragraph explanation of local-first storage model and what it means for the user's data.
2. Local Backup Center / export entry point: button or link to trigger manual export flow (action deferred to Phase 31C or later).
3. Import preview entry point: button or link to trigger import-with-preview flow (action deferred to Phase 31C or later).
4. Restore caution block: explicit warning about restore risks (overwrite, no undo).
5. Backup reminder concept: display of last export timestamp (read-only, deferred runtime to Phase 31C or later).
6. Evidence gaps / beta limitations panel: honest disclosure of known limitations and open evidence gaps.
7. Help/FAQ block: answers to common user questions about local storage, exports, and data safety.
8. Non-goals section: explicit list of what the panel does NOT do (no cloud sync, no automatic backup, no guaranteed prevention).

**This is a design concept. No runtime Data Safety Center implementation in Phase 31B.**

## Local Backup Center concept

The Local Backup Center is the specific sub-panel for manual export (backup) and import (restore) actions.

**Core content concept**:
1. Export action: a button that triggers the existing manual export flow. The button is an entry point only; the flow itself is not changed by Phase 31B.
2. Import preview action: a button that triggers the existing import-with-preview flow. The flow itself is not changed by Phase 31B.
3. Last backup status: a read-only display of the last export timestamp from localStorage (if available). This is a display-only concept; no new localStorage writes from Phase 31B.
4. Storage quota note: a brief note about browser storage limits and what to do if quota is exceeded.
5. Restore caution: explicit copy warning the user that restore replaces all current data and cannot be undone.

**This is a design concept. No runtime Local Backup Center implementation in Phase 31B.**

## UX surfaces

Phase 31B selects the following surfaces for the Phase 31C prototype scope:

**Primary surface — Settings panel section (Surface A)**:
- Add a "Data Safety" or "Your Data" collapsible section to the existing settings page.
- No new route required.
- Lower navigation visibility but lower implementation complexity.
- Recommended for Phase 31C minimal viable prototype.

**Optional aspirational surface — Modal/overlay (Surface D)**:
- Triggered from a settings or dashboard entry point.
- Contains full Data Safety Center content including Local Backup Center.
- No new route.
- Moderate complexity.
- May be included in Phase 31C if complexity remains low.

**Deferred surface — Dedicated route (Surface C)** (`/data-safety` or `/backup`):
- Separate page for the Data Safety Center with full copy and flow.
- Requires route/navigation change.
- Highest complexity; deferred to a later phase after Phase 31C.

**Out of scope — Dashboard section (Surface B)**:
- Requires dashboard layout review.
- Deferred until primary surface is proven in Phase 31C.

## UX state model

The Data Safety Center design must account for the following states:

| State | Trigger | Display |
|---|---|---|
| Empty | No export history in localStorage | Prompt user to export; explain local storage model; no timestamp shown |
| Has backup | Export timestamp available in localStorage | Show timestamp; encourage regular backup; show last export date |
| Error | Export or import failed or interrupted | Show error message; offer retry; do not claim data was saved |
| Disabled/default-off | Feature behind a default-off flag | Show placeholder or hidden UI; do not show partial functionality |
| Quota warning | localStorage quota approaching or exceeded | Warn user; suggest export and cleanup |
| Restore caution | User initiates restore action | Show explicit warning about overwrite; require confirmation; do not execute in Phase 31B |

All state transitions are design-only in Phase 31B. Runtime state management is deferred to Phase 31C or later.

## User-facing copy boundaries

Phase 31B defines the following copy rules and boundaries:

**Allowed copy claims**:
- "Your flashcard data is stored locally in your browser."
- "We do not sync your data to any server."
- "Export your data regularly to keep a backup."
- "If browser storage is cleared, your data may be lost."
- "Import a previous backup to restore your data."
- "This app does not have automatic backups."
- "This is a beta version. See known limitations below."

**Forbidden copy claims**:
- "Your data is safe." (implies guarantee)
- "We back up your data automatically." (false)
- "Your data is synced to the cloud." (false)
- "Restore is guaranteed to succeed." (false)
- "This app prevents data loss." (overstates capability)
- "Your data is secure." (implies server-side security)
- Any claim that implies BETA_READY or public production readiness.
- Any claim of BYOC/WebDAV/P2P availability.

**Required disclaimers**:
- Local-only storage model explanation (localStorage, browser-scoped).
- Explicit risk acknowledgment for restore (overwrites all current data, cannot be undone).
- Explicit note that no automatic backups occur.
- Explicit note that cloud sync/BYOC/P2P is not available.
- Explicit beta limitations panel with known evidence gaps.

## Evidence plan for prototype

Phase 31B defines the following evidence plan for Phase 31C (separately gated; not executed here):

**Design review criteria**:
- All required sections present and reviewed.
- Copy passes forbidden-claim boundary check.
- State model covers all required states.
- Accessibility notes applied.

**Copy review criteria**:
- No forbidden claim strings in rendered copy.
- All required disclaimers present.
- Language is clear and readable for Vietnamese-first users.

**UX acceptance criteria**:
- User can navigate to Data Safety Center from settings.
- User can see last export timestamp (read-only, if available).
- User can initiate export (entry point only; existing flow).
- User can see restore caution before initiating restore.
- User can see evidence gaps / beta limitations panel.
- User can access help/FAQ block.

**Test data plan**:
- Use generated/test-only data for any prototype evidence run.
- No real learner data in prototype testing.
- Rollback plan: if prototype introduces regressions, revert to baseline settings page without Data Safety Center.

**Rollback plan**:
- Phase 31C prototype must be behind a default-off flag.
- If regression is detected, flag is disabled and settings page reverts to Phase 31A baseline.
- No data is lost during rollback.

**This evidence plan is a design-only output. No evidence is collected in Phase 31B. Evidence collection requires a separately-gated prototype/evidence phase.**

## Non-goals

Phase 31B explicitly does not design, approve, or implement:

- Cloud sync or server-based backup.
- BYOC (Bring Your Own Cloud) / WebDAV encrypted backup.
- P2P / WebRTC device-to-device transfer.
- Automatic backup scheduling.
- Guaranteed data-loss prevention.
- Restore execution or restore rehearsal.
- Real learner data handling.
- Telemetry or analytics.
- Built-in AI / OCR / API-key / BYOK behavior.
- Backend account, authentication, or authorization.
- Broad beta release or public production readiness.
- BETA_READY advancement.

## Open risks

| Risk | Severity | Mitigation |
|---|---|---|
| User misinterprets "Data Safety Center" as a guarantee of data safety | High | Explicit disclaimers in all sections; forbidden claim list enforced by validator |
| Prototype (Phase 31C) introduces UI regressions | Medium | Default-off flag; rollback plan defined in evidence plan |
| Evidence gaps panel not updated as evidence is collected | Medium | Separate copy phase required; Phase 31C must recheck evidence panel |
| Legacy RELEASE_NOTES claim misleads users about BETA_READY status | Medium | Separate copy cleanup phase; do not add BETA_READY claims in any phase |
| Design scope expands beyond settings panel to full route | Low | Phase 31C gate must re-confirm surface scope |
| localStorage read for last-backup-status introduces new state complexity | Low | Read-only display only; no new localStorage writes; Phase 31C must verify |

## Chosen design decision

```text
PHASE31B_DATA_SAFETY_UX_DESIGN_DECISION: PASS_TO_PHASE31C_DATA_SAFETY_UX_PROTOTYPE
```

## Decision rationale

Phase 31B design confirms:
- LIMITED_BETA_CANDIDATE remains the highest approved readiness.
- BETA_READY gaps are documented and unresolved.
- Data Safety Center / Local Backup Center UX design is complete for a conservative settings panel section approach.
- UX spec, state model, copy boundaries, and evidence plan are defined.
- Phase 31C is scoped as a minimal viable prototype behind a default-off flag.
- No runtime implementation is approved in Phase 31B.
- All forbidden default approvals are explicitly denied.

PASS_TO_PHASE31C_DATA_SAFETY_UX_PROTOTYPE is the appropriate decision because:
- Design output is complete and reviewed.
- Phase 31C prototype scope is defined conservatively (settings panel section, default-off).
- Evidence plan is ready for Phase 31C execution.
- No forbidden claim strings appear in design docs.
- All design constraints from Phase 31B seed are met.

## What Phase 31B supports

- Data Safety Center / Local Backup Center UX design (design-only, no runtime).
- UX spec with surfaces, state model, and copy boundaries.
- Evidence plan for Phase 31C prototype.
- Conservative release summary.
- Phase 31C seed for separately-gated prototype phase.

## What Phase 31B does not approve

Phase 31B does not approve BETA_READY.
Phase 31B does not approve public production readiness.
Phase 31B does not approve guaranteed data-loss prevention.
Phase 31B does not approve restore execution.
Phase 31B does not approve production restore rehearsal.
Phase 31B does not approve real learner data restore rehearsal.
Phase 31B does not approve runtime backup/export/restore changes.
Phase 31B does not approve backup file format changes.
Phase 31B does not approve restore overwrite behavior changes.
Phase 31B does not approve storage migration.
Phase 31B does not approve sync/cloud/account/auth/backend.
Phase 31B does not approve telemetry/analytics.
Phase 31B does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 31B does not approve BYOC/WebDAV/P2P/device-transfer implementation.

## Phase 31C handoff

Phase 31C is a Data Safety UX Prototype phase. It receives:
- This design gate doc.
- UX spec: `docs/design/phase31b-data-safety-center-ux-spec.md`.
- Release summary: `docs/release/phase31b-data-safety-ux-design-gate-summary.md`.
- Phase 31C seed: `docs/planning/phase31c-data-safety-ux-prototype-seed.md`.

Phase 31C is a separate prototype gate and is not automatically approved by Phase 31B.

Phase 31C must not approve BETA_READY. Phase 31C must not implement sync/cloud/account/auth/backend. Phase 31C must not implement BYOC/WebDAV/P2P/device-transfer. Phase 31C must operate behind a default-off flag and must have a rollback plan.

## Claim boundary

Phase 31B is a planning/design/docs gate. No runtime source changes were made in Phase 31B. No evidence was collected in Phase 31B. No browser execution was performed in Phase 31B. Design docs produced in Phase 31B are plans only and do not substitute for actual evidence collection or implementation.

Phase 31B confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status. BETA_READY is not approved. Public production readiness is not approved.

## Next recommended phase

Next recommended phase: Phase 31C — Data Safety UX Prototype.
Phase 31C is a separate prototype gate and is not automatically approved.
Phase 31B confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 31B does not approve BETA_READY.
Phase 31B does not approve public production readiness.
Phase 31B does not approve guaranteed data-loss prevention.
Phase 31B does not approve restore execution.
Phase 31B does not approve production restore rehearsal.
Phase 31B does not approve real learner data restore rehearsal.
Phase 31B does not approve runtime backup/export/restore changes.
Phase 31B does not approve backup file format changes.
Phase 31B does not approve restore overwrite behavior changes.
Phase 31B does not approve storage migration.
Phase 31B does not approve sync/cloud/account/auth/backend.
Phase 31B does not approve telemetry/analytics.
Phase 31B does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 31B does not approve BYOC/WebDAV/P2P/device-transfer implementation.
