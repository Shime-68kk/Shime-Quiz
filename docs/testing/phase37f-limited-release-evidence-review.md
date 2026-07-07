# Phase 37F — Limited Release Evidence Review

## Status tokens
PHASE37F_LIMITED_RELEASE_EVIDENCE_REVIEW_STATUS: COMPLETED_LIMITED_RELEASE_EVIDENCE_REVIEW
PHASE37F_LIMITED_RELEASE_DECISION: LIMITED_BETA_NOT_APPROVED_EVIDENCE_GAPS_REMAIN
PHASE37F_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37F_REVIEW_SCOPE: DOCS_TESTING_RELEASE_CI_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE37F_SELECTED_NEXT_PHASE: APP-H1_SAFE_LEARNING_CAPSULE_CONTRACT
PHASE37F_RUNTIME_SCOPE_CONTAMINATION_STATUS: UNSTAGED_RUNTIME_WORK_SEPARATED_FROM_PHASE37F_PACKET

## Scope
Phase 37F reviews the Phase 37E evidence packet and decides whether the evidence is sufficient for limited beta approval. This phase is an evidence review only.

Phase 37F does not modify runtime source, StudyRoom behavior, UI/theme files, storage, import/parser logic, scheduler/FSRS logic, scoring, queues, Device Bridge implementation, robot integration, firmware, tests, E2E source, package files, generated artifacts, account/auth/cloud/backend code, telemetry, or AI calls.

## Inputs reviewed
- `docs/testing/phase37e-manual-readiness-evidence-collection.md`
- `docs/release/phase37e-manual-readiness-evidence-collection-summary.md`
- `scripts/validate-phase37e-manual-readiness-evidence-collection.js`
- `.github/workflows/e2e-smoke.yml`
- `docs/planning/phase37f-limited-release-evidence-review-seed.md`

## Root conclusion
The Phase 37E packet is useful enough to continue limited release review work, but it is not sufficient to approve limited beta or Beta Ready. The correct Phase 37F decision is `LIMITED_BETA_NOT_APPROVED_EVIDENCE_GAPS_REMAIN`.

Phase 37E evidence covers local Chromium probing, a 375px emulated mobile viewport, desktop rendering, limited keyboard/focus checks, reduced-motion reachability, limited backup/restore, valid/invalid import fixtures, local-first/privacy observations, a short stress-adjacent route loop, UI modernization regression observations, and validation/build/unit/E2E command results.

The evidence still leaves material gaps in physical-device testing, browser diversity, real assistive-technology behavior, destructive/mismatch backup restore scenarios, import/parser edge cases, production-build privacy/network verification, and long-session endurance.

## Decision
PHASE37F_LIMITED_RELEASE_DECISION: LIMITED_BETA_NOT_APPROVED_EVIDENCE_GAPS_REMAIN

Evidence sufficient for limited beta approval: No.

Beta Ready approved: No.

Public production readiness approved: No.

Readiness remains: `LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED`.

## Evidence reviewed by area
| Area | Phase 37E evidence | Phase 37F review | Approval impact |
| --- | --- | --- | --- |
| Manual browser readiness | Chromium desktop routes rendered; study answer/check/next/card flip worked; no console/page errors. | Useful smoke evidence, but Chromium-only manual probing is not enough for release confidence. | Gap remains. |
| Mobile viewport | 375 x 812 emulated Chromium routes rendered without document horizontal overflow. | Good baseline for responsive layout, but no real device, orientation, browser chrome, touch comfort, or virtual keyboard evidence. | Gap remains. |
| Desktop viewport | 1440 x 900 study route had no document horizontal overflow and visible answer feedback/card flip. | Useful baseline, but no cross-browser desktop evidence. | Gap remains. |
| Physical device | Not executed. | This is a release-confidence gap because actual mobile safe area, touch, performance, and browser behavior are unverified. | Gap remains. |
| Accessibility and assistive technology | Limited keyboard/focus and role checks only; no screen reader. | Keyboard/focus evidence is useful but does not prove screen reader announcement order, labels, recovery states, or live feedback. | Gap remains. |
| Reduced motion and focus-visible | Reduced-motion emulation kept dashboard/study room reachable; focus samples showed visible outlines. | Useful baseline, but limited route coverage and no dialog/restore/import keyboard completion evidence. | Gap remains. |
| Backup/restore and data-loss boundary | Backup download and restore input acceptance were exercised; no destructive overwrite or mismatch scenario. | Not enough for data-loss confidence. Same-state confirmation, corrupted backup, duplicate, mismatch, and overwrite paths remain unproven. | Gap remains. |
| Import/parser | Valid fixture saved; invalid fixture rejected with visible Vietnamese feedback. | Positive baseline only. Malformed, duplicate, edge-length, multilingual, CSV, and persistence-after-refresh cases remain unreviewed. | Gap remains. |
| Local-first/privacy/network | localStorage key observed, no sessionStorage keys, no service worker controller, no external requests in the probe. | Supports local-first direction, but production-build DevTools/network evidence and wider route coverage are still missing. | Gap remains. |
| Sync/account/backend boundary | No account/sync/backend/auth/cloud UI or external requests observed in probed flows. | Supports the privacy boundary for probed routes only. Does not prove all deploy/runtime configurations. | Gap remains. |
| Long-session/stress-adjacent | 25 route navigations completed with no overflow/page errors and storage preserved. | Useful sanity check, not a long-session or larger-dataset endurance run. | Gap remains. |
| UI modernization regression | Answer feedback, card flip, library surface, mobile nav, and study paths were observed. | UI evidence must remain separate from release readiness evidence and cannot substitute for missing release evidence. | Gap remains. |
| Validation/build/unit/E2E | Phase 37E validator, build, unit tests, E2E smoke, E2E onboarding, and `git diff --check` reportedly passed locally. | Useful command evidence, with existing Vite chunk warning noted. It does not close manual evidence gaps. | Gap remains. |

## Evidence gaps blocking approval
- Physical-device evidence was not executed.
- Manual browser evidence was Chromium only; Firefox, Safari/WebKit, and mobile browser coverage remain missing.
- Real assistive-technology evidence was not executed with NVDA, VoiceOver, TalkBack, or equivalent.
- Backup/restore evidence did not exercise destructive confirmation, overwrite, mismatch, duplicate, corrupted backup, or recovery scenarios.
- Import/parser evidence did not cover malformed, duplicate, edge-length, multilingual, CSV, or persistence-after-refresh cases.
- Privacy/network evidence was probe-based and did not include production-build DevTools or multi-browser network evidence.
- Long-session evidence was stress-adjacent and short, not multi-hour or large dataset based.
- UI modernization regression evidence does not prove release readiness.

## Stop condition review
Phase 37E reported no observed data loss, storage/backup/restore inconsistency, import/parser corruption or mismatch, route/navigation blocker, inaccessible keyboard/focus path, unreadable contrast, reduced-motion violation, unexpected sessionStorage writes, telemetry/network/sync/account/backend behavior, console/page errors, or validation/build/unit/E2E failures in executed lanes.

Phase 37F does not identify a proven runtime blocker from the Phase 37E packet. The correct outcome is not `LIMITED_BETA_BLOCKED_RUNTIME_SCOPE_CONTAMINATION` because the Phase 37F packet does not rely on the separate dirty runtime work. The correct outcome is also not `LIMITED_BETA_APPROVED` because the evidence gaps above remain.

## Runtime scope contamination review
The current local worktree contains separate unstaged or untracked runtime/device/UI work, including UI/theme modernization, Study UX changes, StudyRoom runtime behavior changes, Device Bridge, companion, robot, ESP32, generated build output, dependency folders, and test result artifacts.

Phase 37F explicitly excludes that work from this evidence review. Those files are not evidence for limited beta approval, are not part of this Phase 37F decision, and must not be used to claim readiness.

Phase 37F requires that any future runtime/device work be reviewed in a separate implementation or contract phase with its own scope, tests, privacy rules, and rollback criteria.

## Device Bridge and robot deferral
Device Bridge, robot, ESP32, companion, firmware, MQTT/WebSocket/Bluetooth/serial, and transport implementation work is deferred. Phase 37F does not introduce a bridge contract, does not send quiz events to a device, and does not add robot integration.

No raw quiz prompts, answers, explanations, imported files, user-authored content, source metadata, study history details, backup payloads, or personally identifying data should be introduced into any future robot or bridge contract. A future contract should use redacted event categories and coarse buckets only.

## No raw quiz or user data
Phase 37F introduces no raw quiz/user data and no robot/bridge contract containing raw quiz/user data.

Future bridge planning must continue to forbid transmission of prompts, answer text, explanations, user notes, imported source contents, backup JSON, precise history records, and private metadata.

## Release boundary
Phase 37F does not approve `BETA_READY`.

Phase 37F does not approve public production readiness.

Phase 37F does not approve runtime implementation, UI modernization, full Dynamic Canvas Themes runtime, persisted theme preferences, account-synced preferences, backend work, telemetry work, Device Bridge work, robot integration, firmware work, parser/storage changes, scheduler/FSRS changes, scoring/queue changes, or guaranteed data-loss prevention.

## Recommended next phase
Next recommended phase: APP-H1_SAFE_LEARNING_CAPSULE_CONTRACT.

Rationale: before any optional Device Bridge or robot work, define a local-first safe learning capsule contract that states exactly which redacted, coarse learning signals may leave the core app boundary and which raw quiz/user data must never leave it.
