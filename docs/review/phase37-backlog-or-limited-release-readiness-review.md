# Phase 37 — Backlog or Limited Release Readiness Review

## Status tokens

PHASE37_BACKLOG_OR_RELEASE_READINESS_REVIEW_STATUS: COMPLETED_BACKLOG_OR_RELEASE_READINESS_REVIEW

PHASE37_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE37_BACKLOG_OR_RELEASE_READINESS_REVIEW_DECISION: PASS_TO_PHASE37A_BROADER_ACTUAL_EVIDENCE_RUN

PHASE37_REVIEW_SCOPE: BACKLOG_OR_RELEASE_READINESS_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES

PHASE37_SELECTED_NEXT_STEP: PHASE37A_BROADER_ACTUAL_EVIDENCE_RUN

PHASE37A_BROADER_ACTUAL_EVIDENCE_RUN_SEED_STATUS: PREPARED_REVIEW_SEED

## Scope

Phase 37 is docs/review/release/planning/static-validator/CI-only. It makes no runtime behavior changes, source changes, unit test source changes, E2E source changes, CSS/source changes, package changes, route/navigation implementation changes, storage/backup/restore changes, import/parser/database/prompt changes, scheduler/FSRS changes, sync/cloud/account/auth/backend changes, telemetry/network calls, Study Room answer logic changes, or generated artifact changes.

## Inputs from Phase 36J

Phase 36J completed the mobile/accessibility track review and passed the project to Phase 37 with the readiness boundary intact.

PHASE36J_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_REVIEW_DECISION: PASS_TO_PHASE37_BACKLOG_OR_RELEASE_READINESS_REVIEW

PHASE37_BACKLOG_OR_RELEASE_READINESS_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED

The carried-forward evidence includes Phase 36 mobile polish backlog review, mobile touch scope, Bottom Navigation touch comfort and safe-area evidence, Library mobile tabs touch and focus evidence, Core Interactive Focus Visible Consistency evidence, 375px browser evidence, representative focus-visible evidence, reduced-motion evidence, E2E smoke evidence, onboarding evidence, and static validator evidence.

## Review method

This review compares the safe next planning options after Phase 35 and Phase 36. It treats prior evidence as bounded and useful, but not broad enough for a readiness upgrade. It checks whether the next step should gather broader actual evidence, review limited release readiness, prioritize backlog, open one separate future UI scope gate, or hold.

## Current readiness boundary

Phase 37 confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.

Phase 37 does not approve BETA_READY.
Phase 37 does not approve Beta Ready.
Phase 37 does not approve public production readiness.
Phase 37 does not approve broad validation or stress-tested readiness.
Phase 37 does not approve stress-tested readiness.
Phase 37 does not approve guaranteed data-loss prevention.
Phase 37 does not approve accessibility certification.
Phase 37 does not approve assistive technology review completion.
Phase 37 does not approve physical-device audit completion.

## Phase 35 and Phase 36 carry-forward summary

Phase 35 completed the core UI plan through small scoped phases, including structural UI direction, Library bookshelf work, Dashboard calm-home work, navigation indicator work, button compression work, Study Room answer feedback polish, and final plan completion review. Those phases improved and reviewed UI behavior within narrow boundaries.

Phase 36 completed the mobile/accessibility track through backlog review, mobile touch scope, Bottom Navigation pilot and evidence review, Library mobile tabs pilot and evidence review, Core focus-visible pilot and evidence review, and Phase 36J track completion review. The result supports a limited candidate boundary, not Beta Ready.

## Backlog and readiness option comparison table

| Option | User value | Evidence need | Risk | Readiness impact | Decision |
| --- | --- | --- | --- | --- | --- |
| Broader Actual Evidence Run | Builds confidence from real/manual flows before any readiness upgrade. | Needs generated/test-data runs across core flows, import/workshop, Study Room, Library, Dashboard, mobile 375px, safe backup/restore rehearsal if already supported, focus-visible, reduced-motion, E2E smoke, and onboarding. | Medium if treated as evidence only; higher if it expands into runtime changes. | Strengthens evidence while keeping LIMITED_BETA_CANDIDATE unchanged. | Selected next step. |
| Limited Release Readiness Review | Could organize release guardrails and support boundaries. | Needs broader actual evidence first to avoid paper readiness. | Medium because current evidence remains bounded. | Not selected before broader evidence. | Defer until after Phase 37A evidence. |
| Backlog Prioritization Review | Helps rank future work without readiness claims. | Needs current backlog categories and user value assessment. | Low, but may avoid the evidence gap. | No readiness upgrade. | Acceptable fallback, not selected. |
| One Separate Future UI Scope Gate | Keeps a future UI idea isolated. | Needs a single scoped UI candidate and separate evidence plan. | Medium if it distracts from readiness evidence. | No readiness upgrade. | Defer. |
| Dynamic Canvas Themes Design Gate | Could explore future visual personalization. | Needs separate design gate, accessibility plan, reduced-motion plan, and rollback plan. | Medium to high because it could affect broad UI surfaces. | No readiness upgrade. | Not selected. |
| Streak Fire Ignition Design Gate | Could explore future motivation visuals. | Needs separate design gate and motion/accessibility guardrails. | Medium to high because it can affect animation and reward expectations. | No readiness upgrade. | Not selected. |
| Collapsible Header Scope Gate | Could improve density and navigation ergonomics. | Needs separate scope, route/layout evidence, and regression plan. | Medium because it may affect route/navigation layout. | No readiness upgrade. | Not selected. |
| Storage/Backup/Restore Design Gate | Could improve resilience planning. | Needs design, rollback, data-loss risk model, rehearsal evidence, and explicit approval before behavior changes. | High because data safety is involved. | No readiness upgrade without separate evidence. | Not selected for implementation. |
| Sync/Cloud/Account/Auth/Backend Track | Could support future multi-device/account workflows. | Needs separate architecture, privacy, security, migration, rollback, and support plans. | High and out of current approval scope. | No readiness upgrade. | Not approved. |
| Hold For More Evidence | Avoids premature readiness movement. | Needs a clear evidence collection plan. | Low, but stalls direction if no next evidence phase is prepared. | Keeps LIMITED_BETA_CANDIDATE unchanged. | Not selected because Phase 37A provides the evidence path. |

## Selected next step

PHASE37_SELECTED_NEXT_STEP: PHASE37A_BROADER_ACTUAL_EVIDENCE_RUN

Next recommended phase: Phase 37A — Broader Actual Evidence Run.

## Why Broader Actual Evidence Run first

The project has useful bounded evidence from Phase 35 and Phase 36, but not enough actual user or real/manual flow evidence to justify a readiness upgrade. A broader actual evidence run is the safest next planning direction because it checks practical flows before any limited release readiness review or Beta Ready discussion.

## Why this is review/planning, not runtime implementation

Phase 37 only reviews the backlog and readiness direction, creates a Phase 37A seed, and registers a static validator. Phase 37A is evidence planning/execution preparation first and is not automatic runtime implementation.

## Phase 37A expected scope

Phase 37A should prepare and run broader actual evidence using generated/test data unless explicitly approved otherwise. Evidence should include core flows, import/workshop, Study Room, Library, Dashboard, mobile 375px, backup/restore rehearsal if already safe and supported, focus-visible and reduced-motion checks, E2E smoke, and onboarding.

## Phase 37A forbidden areas

Phase 37A must not approve Beta Ready by default. It must not approve runtime changes, public production readiness, storage/backup/restore behavior changes, import/parser behavior changes, sync/cloud/account/auth/backend changes, telemetry/network calls, built-in AI/OCR/API-key/BYOK behavior, route behavior changes, event handler changes, tab-state changes, package/dependency changes, Study Room correctness/scoring/scheduler/queue/data changes, Dynamic Canvas Themes implementation, Streak Fire, Collapsible Header, broad UI redesign, or automatic next runtime implementation by default.

## Evidence gaps before any readiness upgrade

Remaining gaps include limited actual user evidence, no broad external validation, no stress-tested readiness, no physical-device audit completion, no assistive-technology review completion, no accessibility certification, and no guaranteed data-loss prevention evidence.

## Risk assessment

The main risk is mistaking scoped UI and mobile/accessibility evidence for broad readiness. Storage, backup, restore, import, parser, scheduler, sync, auth, backend, telemetry, and Study Room data behavior also remain sensitive areas that require separate gates before changes.

## Rollback / hold plan

If Phase 37A cannot define or gather broader actual evidence, the project should hold at LIMITED_BETA_CANDIDATE and either return to evidence planning or run a backlog prioritization review. Any storage/backup/restore or migration work must use a separate design gate, rollback plan, and evidence plan before behavior changes.

## Chosen review decision

PHASE37_BACKLOG_OR_RELEASE_READINESS_REVIEW_DECISION: PASS_TO_PHASE37A_BROADER_ACTUAL_EVIDENCE_RUN

## Decision rationale

Broader actual evidence is the most useful next step because it directly addresses the gap between scoped UI/accessibility review evidence and any future limited release-readiness claim. It keeps readiness unchanged while preparing the evidence needed for later decisions.

## What Phase 37 supports

Phase 37 supports a guarded pass to Phase 37A — Broader Actual Evidence Run, preservation of the LIMITED_BETA_CANDIDATE boundary, backlog option comparison, and CI enforcement for the Phase 37 review package.

## What Phase 37 does not approve

Phase 37 does not approve BETA_READY.
Phase 37 does not approve public production readiness.
Phase 37 does not approve broad validation or stress-tested readiness.
Phase 37 does not approve stress-tested readiness.
Phase 37 does not approve guaranteed data-loss prevention.
Phase 37 does not approve accessibility certification.
Phase 37 does not approve assistive technology review completion.
Phase 37 does not approve physical-device audit completion.
Phase 37 does not approve storage/backup/restore behavior changes.
Phase 37 does not approve import/parser behavior changes.
Phase 37 does not approve sync/cloud/account/auth/backend.
Phase 37 does not approve telemetry/network calls.
Phase 37 does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 37 does not approve route behavior changes.
Phase 37 does not approve event handler changes.
Phase 37 does not approve tab-state changes.
Phase 37 does not approve package/dependency changes.
Phase 37 does not approve Study Room correctness/scoring/scheduler/queue/data changes.
Phase 37 does not approve Dynamic Canvas Themes implementation.
Phase 37 does not approve Streak Fire.
Phase 37 does not approve Collapsible Header.
Phase 37 does not approve broad UI redesign.
Phase 37 does not approve automatic next runtime implementation.

## Next recommended phase

Phase 37A — Broader Actual Evidence Run.
