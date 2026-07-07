# Phase 37F — Limited Release Evidence Review Seed

## Status token
PHASE37F_LIMITED_RELEASE_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_LIMITED_RELEASE_EVIDENCE_REVIEW_SEED

## Purpose
Phase 37F reviews Phase 37E readiness evidence and limitations. Phase 37F is evidence review, not Beta Ready by default.

## Inputs from Phase 37E
Inputs are the Phase 37E evidence doc, release summary, validator, CI registration, validation command results, manual browser evidence, 375px mobile viewport evidence, desktop evidence, limited accessibility/focus evidence, reduced-motion evidence, backup/restore boundary evidence, import/parser evidence, local-first/privacy/network boundary evidence, stress-adjacent evidence, UI modernization regression evidence, and all limitations.

## Evidence review candidate
PHASE37F_LIMITED_RELEASE_EVIDENCE_REVIEW

## Allowed files / expected areas
Expected areas are docs/review, docs/release, docs/planning, static validators, and CI registration for the review phase. Phase 37F may update evidence-review documentation and validator coverage only.

## Forbidden areas
Phase 37F must not modify runtime source, tests, E2E source, package files, CSS source, theme files, route/navigation implementation, handlers, storage/backup/restore implementation, import/parser implementation, scheduler/FSRS logic, scoring/correctness/scheduler/queue/data logic, streak calculation, daily goal logic, completion logic, localStorage/sessionStorage behavior, sync/cloud/account/auth/backend code, telemetry/network calls, generated artifacts, Dynamic Canvas expansion, full Dynamic Canvas Themes runtime, full theme picker runtime, persisted theme preferences, account-synced preferences, or AI-generated themes.

## Evidence review requirements
Review whether Phase 37E evidence supports continuing as a limited beta candidate, whether any limitation should block readiness escalation, and whether any stop condition requires a runtime fix phase or readiness hold.

Phase 37F must weigh collected evidence and limitations. Phase 37F must preserve `LIMITED_BETA_CANDIDATE` unless the evidence review explicitly escalates to a separate readiness decision phase.

## Manual browser evidence review requirements
Review Chromium manual browser evidence and decide whether missing Firefox/Safari/WebKit evidence blocks any next step.

## Mobile and physical-device evidence review requirements
Review 375px mobile viewport evidence and the physical-device evidence gap. Decide whether real-device testing is mandatory before readiness escalation.

## Accessibility and assistive-technology evidence review requirements
Review limited keyboard/semantic evidence and the missing real screen reader evidence. Decide whether NVDA, VoiceOver, or TalkBack evidence is required.

## Reduced-motion and focus-visible evidence review requirements
Review reduced-motion reachability and visible focus samples. Decide whether additional route, dialog, and restore/import keyboard paths need evidence.

## Backup/restore and data-loss boundary evidence review requirements
Review backup download and restore input acceptance. Decide whether same-state restore confirmation, overwrite, duplicate, mismatch, and corrupted backup scenarios are required before any readiness upgrade.

## Import/parser evidence review requirements
Review valid/invalid JSON fixture outcomes. Decide whether malformed, duplicate, edge-length, multilingual, CSV, and persistence-after-refresh cases require more evidence.

## Local-first and privacy boundary evidence review requirements
Review storage/network observations, no external request capture, no sessionStorage keys, and no account/sync/backend controls observed. Decide whether production-build DevTools evidence is required.

## Long-session and stress-adjacent evidence review requirements
Review the 25-iteration stress-adjacent route loop and decide whether larger generated datasets or multi-hour sessions are necessary.

## UI modernization regression evidence review requirements
Review answer surface, card flip, library surface, mobile viewport, and navigation observations. Keep UI evidence separate from release readiness evidence.

## Stop condition review requirements
Review every stop condition row:
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
Phase 37F must not approve Beta Ready or public production readiness unless evidence explicitly supports a later separate readiness decision. Phase 37F must not treat UI modernization completion as release readiness.

## Non-goals
Non-goals include runtime fixes, broad UI redesign, Dynamic Canvas expansion, full themes runtime, persisted preferences, account-synced preferences, backend work, telemetry work, parser/storage behavior changes, scheduler/FSRS changes, package changes, and replacing readiness evidence with UI evidence.

## Decision options
HOLD_LIMITED_RELEASE_EVIDENCE_REVIEW
NEEDS_ADDITIONAL_MANUAL_READINESS_EVIDENCE
PASS_TO_LIMITED_RELEASE_READINESS_HOLD
PASS_TO_PHASE37G_LIMITED_RELEASE_READINESS_DECISION
PASS_TO_RUNTIME_FIX_PHASE_IF_BLOCKER_FOUND

## Forbidden default approvals
Phase 37F must not approve Beta Ready or public production readiness by default. It must not approve release-readiness upgrade, runtime implementation, Dynamic Canvas expansion, full themes, preference persistence, account-synced preferences, backend work, telemetry, or guaranteed data-loss prevention unless a later separate readiness decision explicitly supports that claim.

## Recommended next step
Next recommended phase: PHASE37F_LIMITED_RELEASE_EVIDENCE_REVIEW.
