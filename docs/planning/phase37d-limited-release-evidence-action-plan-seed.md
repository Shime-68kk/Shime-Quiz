# Phase 37D — Limited Release Evidence Action Plan Seed

## Status token
PHASE37D_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN_SEED_STATUS: PREPARED_EVIDENCE_ACTION_PLAN_SEED

## Purpose
Phase 37D is an evidence action plan, not Beta Ready. It should define the smallest safe set of evidence to collect next after Phase 37C.

## Inputs from Phase 37C
Inputs are the Phase 37C readiness gap inventory, the Phase 37-uiW UI proposal completion handoff, the current readiness status `LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED`, and the decision `PASS_TO_PHASE37D_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN`.

## Action plan candidate
PHASE37D_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN

## Allowed files / expected areas
Expected areas include docs/planning, docs/review, docs/release, docs/testing evidence plans, a static validator, CI registration, command checklist, manual browser checklist, mobile/physical-device checklist, accessibility and assistive-technology checklist, backup/restore and import/parser checklist, and local-first/privacy boundaries.

## Forbidden areas
Phase 37D must not implement runtime changes unless explicitly scoped later. It must not modify runtime source, CSS source, route/navigation implementation, handlers, storage/backup/restore implementation, import/parser behavior, scheduler/FSRS behavior, scoring/queue/data logic, daily goal logic, streak calculation, completion logic, package files, generated artifacts, localStorage/sessionStorage behavior, sync/cloud/account/auth/backend, telemetry/network calls, Dynamic Canvas expansion, or broad UI redesign.

## Evidence collection requirements
Evidence should cover actual/manual user evidence, browser coverage, mobile/physical device, assistive tech, reduced motion, backup/restore, import/parser, and local-first/privacy boundaries.

## Manual browser evidence requirements
Define browsers, workflows, pass/hold criteria, screenshots or notes, and stop conditions before collection begins.

## Mobile and physical-device evidence requirements
Define viewport evidence and at least one physical-device-oriented path before any stronger readiness claim is considered.

## Accessibility and assistive-technology evidence requirements
Define keyboard, focus-visible, screen reader or assistive-technology, contrast/readability, and reduced-motion evidence requirements.

## Backup/restore and import evidence requirements
Define backup-before-risky-action expectations, restore rehearsal boundaries, generated/test data limits, import/parser workflow coverage, and hold signals.

## Readiness boundaries
Phase 37D must not approve Beta Ready or public production readiness. It must preserve `LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED` unless a later dedicated readiness decision explicitly changes it.

## Non-goals
Phase 37D is not a runtime implementation phase, not a UI expansion phase, not Dynamic Canvas expansion, not a Beta Ready approval, not public production readiness, not a data-loss guarantee, and not a package/dependency change phase.

## Decision options
HOLD_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN
NEEDS_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN_FIXES
PASS_TO_PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION
PASS_TO_LIMITED_RELEASE_READINESS_HOLD
PASS_TO_UI_TRACK_ARCHIVE_AND_HANDOFF

## Forbidden default approvals
Do not approve BETA_READY, public production readiness, release-readiness upgrade, data-loss guarantees, Dynamic Canvas expansion, full themes, theme picker runtime, persisted preferences, backend work, telemetry, sync/cloud/account/auth, storage behavior changes, import/parser behavior changes, or scheduler/FSRS changes by default.

## Recommended next step
Next recommended phase: PHASE37D_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN.
