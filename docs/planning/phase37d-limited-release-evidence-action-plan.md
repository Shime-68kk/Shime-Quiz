# Phase 37D — Limited Release Evidence Action Plan

## Status tokens
PHASE37D_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN_STATUS: COMPLETED_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN
PHASE37D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37D_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN_DECISION: PASS_TO_PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION
PHASE37D_PLAN_SCOPE: LIMITED_RELEASE_EVIDENCE_ACTION_PLAN_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE37D_SELECTED_CANDIDATE: PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION
PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION_SEED_STATUS: PREPARED_MANUAL_EVIDENCE_COLLECTION_SEED

## Scope
Phase 37D is docs/planning/release/testing/static-validator/CI-only. It turns Phase 37C readiness gaps into an executable evidence collection plan and changes no runtime behavior.

## Inputs from Phase 37C
Phase 37C confirmed `LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED`, accepted UI proposal completion as context, and carried forward limited actual/manual evidence, limited physical-device evidence, limited assistive-technology evidence, limited reduced-motion evidence, backup/restore and import/parser evidence gaps, long-session gaps, and the boundary that UI completion does not equal release readiness.

## Action plan method
The plan uses small evidence lanes, generated/test data, anonymized records, explicit stop conditions, and pass/hold/needs-fix criteria. Each lane records what was tested, where it was tested, what evidence was captured, what failed, and whether the result supports only limited release evidence collection.

## Current readiness boundary
Current readiness remains `LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED`. Phase 37D does not approve Beta Ready, public production readiness, or a release-readiness upgrade.

## Evidence principles
- Use generated/test data only.
- Prefer direct observations over inferred confidence.
- Keep browser, device, accessibility, data-safety, privacy, and UI evidence separate.
- Record failures as hold evidence, not as hidden cleanup.
- Do not replace readiness evidence with UI evidence.
- Do not overclaim from automated checks or static validators.

## Evidence lanes overview
| Lane | Required row | Evidence target | Minimum result |
| --- | --- | --- | --- |
| 1 | manual browser readiness evidence | Manual desktop browser flows | Completed evidence record per browser |
| 2 | mobile and physical-device evidence | Mobile viewport and at least one physical device | Completed evidence record with device details |
| 3 | accessibility and assistive-technology evidence | Keyboard, screen reader, and semantic path checks | Completed assistive-tech notes |
| 4 | reduced-motion and focus-visible evidence | Motion preference and focus indication checks | Completed preference/focus notes |
| 5 | backup/restore and data-loss boundary evidence | Export, restore, and data-loss boundary observations | Completed data-safety notes |
| 6 | import/parser evidence | Generated import fixtures and parser outcomes | Completed import comparison notes |
| 7 | local-first/privacy/telemetry/sync/account/backend boundary evidence | Storage, network, sync, account, backend, and telemetry boundary checks | Completed boundary notes |
| 8 | long-session and stress-adjacent evidence | Longer study/library use with moderate data volume | Completed duration and stability notes |
| 9 | UI modernization regression evidence | Recently completed UI modernization behavior | Completed visual/interaction regression notes |

## Lane 1 — Manual browser readiness evidence
Collect manual browser readiness evidence in current stable Chromium, Firefox, and WebKit/Safari-equivalent coverage where available. Cover onboarding, library review, deck creation or generated fixture use, study flow, answer submission, route changes, refresh/reopen behavior, and visible error states.

## Lane 2 — Mobile and physical-device evidence
Collect mobile and physical-device evidence with at least one responsive emulator profile and one real physical device. Record OS, browser, viewport, orientation, touch target comfort, safe-area behavior, keyboard appearance, scroll stability, and whether the observed flow remains usable without layout overlap.

## Lane 3 — Accessibility and assistive-technology evidence
Collect accessibility and assistive-technology evidence for keyboard-only operation, screen reader navigation, labels/names/roles, headings, modal or panel traversal, answer controls, library controls, and recovery from validation or empty states.

## Lane 4 — Reduced-motion and focus-visible evidence
Collect reduced-motion and focus-visible evidence with system reduced-motion enabled and disabled. Verify that required content remains reachable, motion is not required to understand state, focus indicators are visible for keyboard users, and touch/mouse polish does not remove keyboard clarity.

## Lane 5 — Backup, restore, and data-loss boundary evidence
Collect backup/restore and data-loss boundary evidence using generated/test data. Exercise export, restore, refresh, reopen, interrupted flow boundaries, duplicate restore attempts, and mismatch handling without modifying implementation. Any data loss or suspected data loss is a stop condition.

## Lane 6 — Import/parser evidence
Collect import/parser evidence with generated fixtures that include normal, malformed, edge-length, duplicate, and multilingual content. Compare expected item counts, rejected rows, displayed fields, and parser messages. Any corruption or mismatch is a stop condition.

## Lane 7 — Local-first, privacy, telemetry, sync, account, and backend boundary evidence
Collect local-first/privacy/telemetry/sync/account/backend boundary evidence by observing storage and network behavior in browser developer tools. Record whether unexpected localStorage/sessionStorage writes, telemetry, network, sync, account, auth, or backend behavior appears. Any such behavior is a stop condition unless it is already documented and explicitly expected.

## Lane 8 — Long-session and stress-adjacent evidence
Collect long-session and stress-adjacent evidence with a moderate generated dataset and a session long enough to cover repeated study, navigation, pauses, refreshes, and return to library. Record duration, approximate item count, memory/performance symptoms, UI degradation, and any route or data boundary failures.

## Lane 9 — UI modernization regression evidence
Collect UI modernization regression evidence around the completed UI proposal track, including answer surfaces, library cards, hybrid navigation, dynamic canvas preview boundaries, collapsible header behavior, touch polish, focus behavior, and visual consistency. This evidence may support UI confidence but cannot approve readiness by itself.

## Evidence templates
Use this template for each evidence item:

```text
Evidence ID:
Lane:
Tester:
Date:
Environment:
Generated/test data used:
Flow covered:
Expected result:
Observed result:
Screenshots or artifacts:
Privacy/anonymization check:
Stop condition triggered:
Decision: PASS / HOLD / NEEDS_FIX
Notes:
```

Use this failure template when a stop condition appears:

```text
Failure ID:
Related evidence ID:
Stop condition:
Steps to reproduce:
Observed risk:
Data-loss/privacy/accessibility impact:
Immediate hold decision:
Recommended next phase:
```

## Anonymization and privacy rules
Evidence must use generated/test data only, avoid personal/private user content, avoid production accounts, redact browser profiles, redact local paths where not needed, and avoid sharing private screenshots. Network/storage screenshots must hide unrelated browser data.

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

## Pass / hold / needs-fix criteria
PASS_TO_PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION is appropriate when the evidence plan, seed, validator, and CI guardrails are complete and no runtime changes are introduced. HOLD is appropriate when the plan cannot be executed safely or readiness boundaries are unclear. NEEDS_FIX is appropriate when required lanes, stop conditions, privacy rules, validator coverage, or CI registration are incomplete.

## Evidence files expected from Phase 37E
Phase 37E is expected to produce manual evidence records, a release evidence summary, anonymized screenshots if explicitly scoped, and a static validator update for the Phase 37E evidence collection. It should not change runtime source.

## Validation commands for Phase 37E
Phase 37E should run:

```bash
npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false
node scripts/validate-phase37e-manual-readiness-evidence-collection.js
npm run build
npm run test:unit
npm run test:e2e:smoke
npm run test:e2e:onboarding
git diff --check
```

## Runtime and system boundaries
Phase 37D does not change runtime source, tests, E2E source, package files, CSS source, theme files, storage/import/parser/scheduler/FSRS/sync/auth/backend/telemetry code, route/navigation implementation, handlers, form submission, disabled behavior, scoring/queue/scheduler/data logic, daily goal logic, streak calculation, completion logic, localStorage/sessionStorage, or generated artifacts.

## Beta Ready claim boundary
Phase 37D does not approve BETA_READY, public production readiness, release-readiness upgrade, or guaranteed data-loss prevention.

## Limited release risk position
The project remains a limited beta candidate with useful automated and static evidence but incomplete manual browser, physical-device, accessibility, data-safety, import/parser, privacy boundary, long-session, and UI regression evidence.

## Selected candidate
PHASE37D_SELECTED_CANDIDATE: PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION

## Why Phase 37E Manual Readiness Evidence Collection next
Phase 37E is the smallest useful next step because Phase 37C found evidence gaps rather than a specific runtime defect. Manual readiness evidence can validate release boundaries before any runtime fix phase is selected.

## Why this is an action plan, not runtime implementation
This phase defines what evidence to collect, how to collect it, and when to stop. It does not change behavior, add features, alter UI systems, modify persistence, or change release readiness status.

## Phase 37E allowed files / expected areas
Expected areas are docs/evidence records, docs/release summaries, docs/testing seeds, a Phase 37E static validator, CI registration, and explicitly scoped anonymized evidence artifacts or screenshots.

## Phase 37E forbidden areas
Phase 37E must not modify runtime source, tests, E2E source, package files, CSS source, theme files, route/navigation implementation, handlers, storage/backup/restore implementation, import/parser implementation, scheduler/FSRS logic, scoring/correctness/scheduler/queue/data logic, streak calculation, daily goal logic, completion logic, localStorage/sessionStorage behavior, sync/cloud/account/auth/backend code, telemetry/network calls, generated artifacts, Dynamic Canvas expansion, full Dynamic Canvas Themes runtime, full theme picker runtime, persisted theme preferences, account-synced preferences, or AI-generated themes.

## Rollback / hold plan
If Phase 37E evidence triggers any stop condition, hold limited release readiness, preserve evidence, avoid runtime edits in the evidence phase, and select either a focused runtime fix phase or a readiness hold phase with the failure record attached.

## Chosen action plan decision
PHASE37D_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN_DECISION: PASS_TO_PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION

## Decision rationale
The plan is complete, scoped to evidence collection, and preserves the Phase 37C readiness boundary. The safest next action is to collect manual evidence before approving or changing release readiness.

## What Phase 37D supports
Phase 37D supports an executable evidence collection plan, evidence templates, stop conditions, pass/hold/needs-fix criteria, Phase 37E seed preparation, and validator/CI enforcement.

## What Phase 37D does not approve
Phase 37D does not approve BETA_READY.
Phase 37D does not approve public production readiness.
Phase 37D does not approve release-readiness upgrade.
Phase 37D does not approve runtime implementation in Phase 37D.
Phase 37D does not approve broad UI redesign.
Phase 37D does not approve Dynamic Canvas expansion.
Phase 37D does not approve full Dynamic Canvas Themes runtime.
Phase 37D does not approve full theme picker runtime.
Phase 37D does not approve persisted theme preferences.
Phase 37D does not approve account-synced preferences.
Phase 37D does not approve storage/backup/restore behavior changes.
Phase 37D does not approve import/parser behavior changes.
Phase 37D does not approve scheduler/FSRS behavior changes.
Phase 37D does not approve scoring/correctness/scheduler/queue/data changes.
Phase 37D does not approve streak calculation changes.
Phase 37D does not approve daily goal logic changes.
Phase 37D does not approve completion logic changes.
Phase 37D does not approve route behavior changes.
Phase 37D does not approve event handler changes.
Phase 37D does not approve package/dependency changes.
Phase 37D does not approve localStorage writes.
Phase 37D does not approve sessionStorage writes.
Phase 37D does not approve sync/cloud/account/auth/backend.
Phase 37D does not approve telemetry/network calls.
Phase 37D does not approve AI-generated themes.
Phase 37D does not approve replacement of readiness evidence with UI evidence.
Phase 37D does not approve guaranteed data-loss prevention.

## Next recommended phase
Next recommended phase: PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION.
