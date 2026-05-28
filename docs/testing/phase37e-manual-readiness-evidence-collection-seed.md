# Phase 37E — Manual Readiness Evidence Collection Seed

## Status token
PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION_SEED_STATUS: PREPARED_MANUAL_EVIDENCE_COLLECTION_SEED

## Purpose
This seed prepares Phase 37E to collect manual readiness evidence from the Phase 37D action plan. Phase 37E is evidence collection, not Beta Ready.

## Inputs from Phase 37D
Inputs are the Phase 37D evidence lanes, evidence templates, anonymization and privacy rules, stop conditions, pass/hold/needs-fix criteria, and the boundary that current readiness remains `LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED`.
Evidence should cover manual browser flows, mobile/physical device, assistive tech, reduced motion, focus-visible, backup/restore, import/parser, local-first/privacy boundaries, long-session/stress-adjacent use, and UI modernization regression.

## Evidence collection candidate
PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION

## Allowed files / expected areas
Phase 37E may produce docs/evidence records, docs/release summaries, docs/testing seeds, a static validator, CI registration, and anonymized screenshots or artifacts if explicitly scoped.
Phase 37E may produce docs/evidence records and screenshots if explicitly scoped, but must not implement runtime changes.

## Forbidden areas
Phase 37E must not implement runtime changes. Do not modify runtime source, tests, E2E source, package files, CSS source, theme files, route/navigation implementation, handlers, storage/backup/restore implementation, import/parser implementation, scheduler/FSRS logic, scoring/correctness/scheduler/queue/data logic, streak calculation, daily goal logic, completion logic, localStorage/sessionStorage behavior, sync/cloud/account/auth/backend code, telemetry/network calls, generated artifacts, Dynamic Canvas expansion, full Dynamic Canvas Themes runtime, full theme picker runtime, persisted theme preferences, account-synced preferences, or AI-generated themes.

## Manual browser evidence requirements
Collect manual browser readiness evidence for onboarding, library, generated/test deck use, study flow, answer submission, route changes, refresh/reopen behavior, and visible error states in current stable desktop browser coverage.

## Mobile and physical-device evidence requirements
Collect mobile and physical-device evidence with at least one responsive emulator profile and one real physical device. Record OS, browser, viewport, orientation, touch target comfort, safe-area behavior, keyboard behavior, scroll stability, and layout overlap observations.

## Accessibility and assistive-technology evidence requirements
Collect accessibility and assistive-technology evidence for keyboard-only operation, screen reader traversal, labels/names/roles, headings, answer controls, library controls, dialogs/panels where applicable, and recovery from validation or empty states.

## Reduced-motion and focus-visible requirements
Collect reduced-motion and focus-visible evidence with reduced motion enabled and disabled. Verify content remains reachable, motion is not required to understand state, and focus indicators remain visible for keyboard users.

## Backup/restore and data-loss boundary evidence requirements
Collect backup/restore and data-loss boundary evidence using generated/test data. Exercise export, restore, refresh, reopen, interrupted flow boundaries, duplicate restore attempts, and mismatch handling. Any data loss or suspected data loss must stop readiness collection.

## Import/parser evidence requirements
Collect import/parser evidence with generated normal, malformed, edge-length, duplicate, and multilingual fixtures. Compare expected item counts, rejected rows, displayed fields, parser messages, and persistence after refresh/reopen.

## Local-first and privacy boundary evidence requirements
Collect local-first/privacy/telemetry/sync/account/backend boundary evidence by observing browser storage and network behavior. Unexpected localStorage/sessionStorage writes or telemetry/network/sync/account/backend behavior must be recorded as stop-condition evidence.

## Long-session and stress-adjacent evidence requirements
Collect long-session and stress-adjacent evidence with a moderate generated dataset and repeated study/library use. Record duration, approximate data size, navigation patterns, refreshes, memory/performance symptoms, and UI degradation.

## UI modernization regression evidence requirements
Collect UI modernization regression evidence for answer surfaces, library cards, hybrid navigation, dynamic canvas preview boundaries, collapsible header behavior, touch polish, focus behavior, and visual consistency. UI evidence cannot replace readiness evidence.

## Evidence templates
Use the Phase 37D evidence templates for evidence items and stop-condition failures. Phase 37E must use generated/test data only and avoid personal/private user content.

## Stop conditions
- data loss or suspected data loss
- storage/backup/restore inconsistency
- import/parser corruption or mismatch
- route/navigation blocker
- inaccessible keyboard/focus path
- unreadable contrast
- reduced-motion violation
- unexpected localStorage/sessionStorage writes
- telemetry/network/sync/account/backend behavior appears
- validation/build/unit/E2E failure

## Readiness boundaries
Phase 37E must not approve Beta Ready or public production readiness. Phase 37E may only collect and summarize evidence for later review.

## Non-goals
Non-goals include runtime fixes, broad UI redesign, Dynamic Canvas expansion, full themes runtime, persisted preferences, account-synced preferences, backend work, telemetry work, parser/storage behavior changes, scheduler/FSRS changes, package changes, and replacing readiness evidence with UI evidence.

## Decision options
HOLD_MANUAL_READINESS_EVIDENCE_COLLECTION
NEEDS_MANUAL_READINESS_EVIDENCE_COLLECTION_FIXES
PASS_TO_PHASE37F_LIMITED_RELEASE_EVIDENCE_REVIEW
PASS_TO_LIMITED_RELEASE_READINESS_HOLD
PASS_TO_RUNTIME_FIX_PHASE_IF_BLOCKER_FOUND

## Forbidden default approvals
The default must not approve Beta Ready, public production readiness, release-readiness upgrade, runtime implementation, Dynamic Canvas expansion, full themes, preference persistence, account-synced preferences, backend work, telemetry, or guaranteed data-loss prevention.

## Recommended next step
Next recommended phase: Phase 37E Manual Readiness Evidence Collection.
