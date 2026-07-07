# Phase 37E — Manual Readiness Evidence Collection

## Status tokens
PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION_STATUS: COMPLETED_MANUAL_READINESS_EVIDENCE_COLLECTION
PHASE37E_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION_DECISION: PASS_TO_PHASE37F_LIMITED_RELEASE_EVIDENCE_REVIEW
PHASE37E_COLLECTION_SCOPE: MANUAL_READINESS_EVIDENCE_COLLECTION_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE37E_SELECTED_CANDIDATE: PHASE37F_LIMITED_RELEASE_EVIDENCE_REVIEW
PHASE37F_LIMITED_RELEASE_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_LIMITED_RELEASE_EVIDENCE_REVIEW_SEED

## Scope
Phase 37E is docs/testing/release/planning/static-validator/CI-only. It collects readiness evidence after the Phase 37D evidence action plan and changes no runtime behavior.

No `src/**`, `tests/**`, `e2e/**`, package, CSS, theme, storage, import, parser, scheduler, FSRS, sync, auth, backend, telemetry, route, handler, form submission, disabled behavior, scoring, queue, daily goal, streak, completion, localStorage, sessionStorage, or generated artifact implementation was changed.

## Inputs from Phase 37D
Phase 37D provided the manual readiness evidence lanes, templates, anonymization rules, stop conditions, pass/hold/needs-fix criteria, and current boundary `LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED`.

Phase 37D also carried forward that UI completion does not equal release readiness and that Phase 37E must use generated/test data only.

## Environment and limitations
- Date: 2026-05-28.
- Repository base: clean `origin/main` after Phase 37D merge commit `fc087451`.
- Local app URL used for manual browser probe: `http://127.0.0.1:4174/`.
- Browser evidence: Playwright Chromium through local Vite dev server.
- Desktop viewport: 1440 x 900.
- Mobile viewport: 375 x 812.
- Generated/test data: built-in sample data and `tests/fixtures/valid-import.json`, `tests/fixtures/invalid-import.json`.
- Physical-device evidence: not executed; no physical mobile device was available in this lane.
- Assistive-technology evidence: not executed with a real screen reader; only keyboard/focus and semantic role observations were collected.
- Backup/restore boundary: backup download and same-generated-state restore file selection were exercised; destructive or overwrite-style restore confirmation was not executed.
- Long-session evidence: stress-adjacent navigation loop only, not a multi-hour endurance session.

## Evidence collection method
Evidence was collected with the existing app and existing generated/test fixtures. Browser storage was cleared before the manual probe. The probe covered desktop routes, 375px mobile routes, a generated study-room answer path, import parser success/failure fixtures, backup download and restore file input acceptance, keyboard tab order samples, reduced-motion media emulation, local storage/session storage keys, external request observation, repeated route navigation, and console/page error capture.

No personal/private user content was used.

## Evidence summary table
| Evidence row | Result | Evidence / limitation | Phase 37F follow-up |
| --- | --- | --- | --- |
| manual browser readiness evidence | Executed with limitation | Chromium desktop routes `/dashboard`, `/library`, and `/study-room` rendered; study answer and card flip path worked; no console/page errors captured. | Review whether Firefox and Safari/WebKit evidence is required before any readiness upgrade. |
| mobile viewport 375px evidence | Executed | 375 x 812 viewport rendered dashboard, library, and study room with no document horizontal overflow. | Review on additional mobile browsers and orientations. |
| desktop viewport evidence | Executed | 1440 x 900 viewport rendered study room with `scrollWidth` equal to `clientWidth`; answer feedback and card flip were visible. | Review desktop browser diversity. |
| physical-device evidence | Not executed | No physical device was available in this lane. Risk: touch, safe-area, browser chrome, keyboard, and device performance remain unverified on real hardware. | Phase 37F should keep physical-device evidence as a limitation or require real-device testing before readiness escalation. |
| accessibility and assistive-technology evidence | Limited | Keyboard/focus and role-based locators were observed; no real screen reader was used. Risk: assistive-technology announcement order remains unverified. | Phase 37F should require NVDA/VoiceOver/TalkBack evidence if release confidence depends on assistive-tech support. |
| reduced-motion evidence | Executed with limitation | `prefers-reduced-motion: reduce` and `no-preference` were emulated; dashboard and study room remained reachable. | Review any animation-heavy paths manually if readiness is escalated. |
| focus-visible evidence | Executed | Keyboard Tab samples reached primary controls with visible solid 3px outlines and focus shadows where applicable. | Review full keyboard completion path, including dialogs and restore confirmation. |
| backup/restore evidence | Limited | Full backup download produced `shime-v2-backup-2026-05-28.json`; restore input accepted the generated backup file. No destructive restore confirmation was run. | Phase 37F should decide whether same-state restore confirmation and mismatch restore scenarios are required. |
| import/parser evidence | Executed | Valid fixture saved locally; invalid fixture was rejected with visible Vietnamese feedback. | Review malformed, duplicate, edge-length, multilingual, and CSV fixtures before readiness escalation. |
| local-first/privacy boundary evidence | Executed with limitation | Observed localStorage key `shimeV2LibraryDataV1`, no sessionStorage keys, no service worker controller, and no external requests during the probe. | Phase 37F should decide whether DevTools/network screenshots or multi-browser privacy evidence are required. |
| telemetry/network boundary evidence | Executed with limitation | No external requests were captured by Playwright request observation during the probe. | Review production build and browser DevTools network panel if a release decision needs stronger evidence. |
| sync/account/backend boundary evidence | Executed with limitation | No account, sync, backend, auth, or cloud UI/control appeared in the probed flows; no external requests captured. | Phase 37F should review deployment configuration boundaries, especially EduGen/File Processor claims. |
| long-session/stress-adjacent evidence | Limited | 25 repeated route navigations completed in about 6.2 seconds with no overflow, no page errors, and storage preserved. | Phase 37F should require a longer realistic session with larger generated datasets if readiness escalation is considered. |
| UI modernization regression evidence | Executed with limitation | Answer surface feedback, library surface, mobile nav presence, and study card flip were observed without console/page errors. | Review broader UI modernization paths across browsers and real mobile. |
| validation/build/unit/E2E evidence | Executed | Phase 37E validator, build, unit tests, E2E smoke, E2E onboarding, and `git diff --check` passed locally. | Phase 37F should treat any future failed command as a stop condition. |

## Lane 1 — Manual browser readiness evidence
Evidence ID: PHASE37E-L1-CHROMIUM-DESKTOP

Tester: Codex local browser probe.

Environment: Playwright Chromium, Vite dev server at `http://127.0.0.1:4174/`, desktop viewport 1440 x 900.

Generated/test data used: built-in sample study data.

Flow covered: dashboard, library, study room, answer selection, answer check, next card, card flip.

Observed result: Routes rendered, study heading was visible, answer feedback showed `Đúng`, card flip exposed expected content, no console/page errors were captured, and desktop document width did not overflow.

Stop condition triggered: No.

Decision: PASS with browser-coverage limitation.

## Lane 2 — Mobile and physical-device evidence
Evidence ID: PHASE37E-L2-MOBILE-375

Environment: Playwright Chromium, 375 x 812 viewport.

Generated/test data used: built-in sample data.

Flow covered: dashboard, library, study room route rendering.

Observed result: All three routes rendered at 375px width. `scrollWidth`, `clientWidth`, and body scroll width were all 375 on each route. No document horizontal overflow was observed.

Physical-device evidence: Not executed. No physical device was available. Risk impact is that touch comfort, safe area, mobile browser chrome, virtual keyboard behavior, and real-device performance remain limited evidence.

Stop condition triggered: No for the emulated viewport; not executed for physical-device testing.

Decision: PASS for 375px viewport, HOLD as a limitation for physical-device evidence.

## Lane 3 — Accessibility and assistive-technology evidence
Evidence ID: PHASE37E-L3-KEYBOARD-SEMANTIC-LIMITED

Environment: Playwright Chromium.

Flow covered: keyboard Tab traversal on library controls and role-based visibility checks across primary routes.

Observed result: Focus moved away from body onto primary controls. Role-based locators found expected headings, buttons, tabs, navigation, file inputs, and study controls in the probed flows.

Assistive-technology evidence: Not executed with NVDA, VoiceOver, TalkBack, or another screen reader. Risk impact is that announcement order, screen-reader labels, live feedback, and recovery states remain limited.

Stop condition triggered: No inaccessible keyboard/focus path was observed in the limited keyboard probe.

Decision: PASS for limited keyboard/semantic evidence, HOLD as a limitation for real assistive technology.

## Lane 4 — Reduced-motion and focus-visible evidence
Evidence ID: PHASE37E-L4-MOTION-FOCUS

Environment: Playwright Chromium with `prefers-reduced-motion: reduce` and `no-preference` media emulation.

Flow covered: dashboard and study room route access under reduced motion; library Tab traversal.

Observed result: Reduced-motion mode reported true and dashboard/study room remained reachable. No reduced-motion violation was observed in the limited probe. Focus-visible samples showed solid 3px outlines, with focus shadows on several controls.

Stop condition triggered: No.

Decision: PASS with broader-path limitation.

## Lane 5 — Backup, restore, and data-loss boundary evidence
Evidence ID: PHASE37E-L5-BACKUP-RESTORE-LIMITED

Environment: Playwright Chromium with generated local library state.

Generated/test data used: `tests/fixtures/valid-import.json`.

Flow covered: import valid fixture, create full backup, confirm JSON filename, attach same generated backup file to restore input.

Observed result: Backup download was created as `shime-v2-backup-2026-05-28.json`; restore input accepted the generated backup file. The probe did not execute an overwrite/destructive restore confirmation.

Stop condition triggered: No data loss or suspected data loss was observed in the limited safe path.

Decision: PASS for backup download and restore input acceptance, HOLD as a limitation for full restore and mismatch scenarios.

## Lane 6 — Import/parser evidence
Evidence ID: PHASE37E-L6-IMPORT-PARSER

Environment: Playwright Chromium.

Generated/test data used: `tests/fixtures/valid-import.json` and `tests/fixtures/invalid-import.json`.

Flow covered: Library import workshop, valid JSON preview and save, invalid JSON fixture rejection.

Observed result: Valid fixture showed ready state and saved locally. Invalid fixture showed `Không thể import file này` and visible repair feedback. No parser corruption or mismatch was observed for these fixtures.

Stop condition triggered: No.

Decision: PASS with fixture-breadth limitation.

## Lane 7 — Local-first, privacy, telemetry, sync, account, and backend boundary evidence
Evidence ID: PHASE37E-L7-BOUNDARY

Environment: Playwright Chromium request observation and browser storage inspection.

Flow covered: primary routes, import, backup download, restore file input, repeated navigation.

Observed result: After generated import, localStorage contained `shimeV2LibraryDataV1`; sessionStorage was empty; no service worker controller was present; no external requests were captured; no sync, account, auth, backend, cloud, or telemetry control appeared in probed flows.

Stop condition triggered: No unexpected sessionStorage writes, telemetry/network/sync/account/backend behavior, or external requests were observed.

Decision: PASS with DevTools/multi-browser limitation.

## Lane 8 — Long-session and stress-adjacent evidence
Evidence ID: PHASE37E-L8-STRESS-ADJACENT

Environment: Playwright Chromium, desktop viewport 1440 x 900.

Generated/test data used: built-in sample data and one imported generated fixture.

Flow covered: 25 repeated navigations across dashboard, library, and study room after import/backup checks.

Observed result: Loop completed in about 6.2 seconds. Final document width remained 1440 with no horizontal overflow, localStorage preserved `shimeV2LibraryDataV1`, sessionStorage remained empty, and no console/page errors were captured.

Stop condition triggered: No.

Decision: PASS for stress-adjacent smoke, HOLD as a limitation for long-duration endurance.

## Lane 9 — UI modernization regression evidence
Evidence ID: PHASE37E-L9-UI-REGRESSION

Environment: Playwright Chromium, desktop and 375px mobile viewport.

Flow covered: answer surface feedback, card flip, library tab controls, mobile route rendering, and primary navigation presence.

Observed result: Answer feedback was visible, card flip content appeared, library controls were reachable, mobile routes did not overflow at 375px, and no console/page errors were captured.

Stop condition triggered: No.

Decision: PASS with browser/device breadth limitation.

## Validation/build/unit/E2E evidence
Required validation commands for Phase 37E:

```bash
npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false
node scripts/validate-phase37e-manual-readiness-evidence-collection.js
npm run build
npm run test:unit
npm run test:e2e:smoke
npm run test:e2e:onboarding
git diff --check
```

Observed local results:
- `npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false`: passed, added 100 packages.
- `node scripts/validate-phase37e-manual-readiness-evidence-collection.js`: passed in `pr-diff` mode.
- `npm run build`: passed; Vite emitted the existing chunk-size warning for a bundle larger than 500 kB.
- `npm run test:unit`: passed, 68 files and 2722 tests.
- `npm run test:e2e:smoke`: passed, 7 tests.
- `npm run test:e2e:onboarding`: passed, 3 tests.
- `git diff --check`: passed.

## Stop conditions review
| Stop condition row | Observed in Phase 37E | Notes |
| --- | --- | --- |
| data loss or suspected data loss | No | No data loss was observed in safe generated-data paths. |
| storage/backup/restore inconsistency | No | Backup download and restore input acceptance worked; full restore confirmation was not executed. |
| import/parser corruption or mismatch | No | Valid/invalid JSON fixtures behaved as expected. |
| route/navigation blocker | No | Primary routes rendered in desktop and 375px mobile viewport. |
| inaccessible keyboard/focus path | No | Limited keyboard probe reached primary controls with visible focus. |
| unreadable contrast | No | No unreadable contrast was observed in the limited visual probe; no automated contrast audit was run. |
| reduced-motion violation | No | Reduced-motion emulation kept routes reachable. |
| unexpected localStorage/sessionStorage writes | No | Generated import wrote expected local library state; sessionStorage remained empty. |
| telemetry/network/sync/account/backend behavior appears | No | No external requests captured and no account/sync/backend controls observed in probed flows. |
| validation/build/unit/E2E failure | No | Phase 37E validator, build, unit tests, E2E smoke, E2E onboarding, and `git diff --check` passed locally. |

## Evidence limitations
Evidence is limited to local Chromium automation plus required automated checks. Firefox, Safari/WebKit, real physical mobile hardware, real screen reader assistive technology, full restore confirmation, mismatch backup restore scenarios, broad malformed/edge import fixtures, multi-hour endurance, and production-host DevTools network evidence were not executed.

## Risk impact of limitations
The limitations prevent a Beta Ready claim. They leave residual risk around real-device touch/safe-area behavior, assistive-technology announcement quality, browser-specific rendering, destructive restore boundaries, import edge cases, endurance stability, and production deployment network/privacy evidence.

## Readiness boundary
Phase 37E supports limited manual readiness evidence collection only. Current readiness remains `LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED`.

## Beta Ready claim boundary
Phase 37E does not approve BETA_READY, public production readiness, release-readiness upgrade, or guaranteed data-loss prevention.

## Decision
PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION_DECISION: PASS_TO_PHASE37F_LIMITED_RELEASE_EVIDENCE_REVIEW

The decision passes evidence to review because no stop condition was observed in executed lanes, while limitations still require explicit review before any readiness escalation.

## What Phase 37E supports
Phase 37E supports manual browser evidence in Chromium, 375px mobile viewport evidence, desktop viewport evidence, limited keyboard/focus-visible evidence, reduced-motion reachability evidence, limited backup/restore boundary evidence, import/parser fixture evidence, local-first/privacy/telemetry/sync/account/backend boundary evidence, stress-adjacent evidence, UI modernization regression evidence, static validator registration, and CI-only guardrails.

## What Phase 37E does not approve
Phase 37E does not approve BETA_READY.
Phase 37E does not approve public production readiness.
Phase 37E does not approve release-readiness upgrade.
Phase 37E does not approve runtime implementation in Phase 37E.
Phase 37E does not approve broad UI redesign.
Phase 37E does not approve Dynamic Canvas expansion.
Phase 37E does not approve full Dynamic Canvas Themes runtime.
Phase 37E does not approve full theme picker runtime.
Phase 37E does not approve persisted theme preferences.
Phase 37E does not approve account-synced preferences.
Phase 37E does not approve storage/backup/restore behavior changes.
Phase 37E does not approve import/parser behavior changes.
Phase 37E does not approve scheduler/FSRS behavior changes.
Phase 37E does not approve scoring/correctness/scheduler/queue/data changes.
Phase 37E does not approve streak calculation changes.
Phase 37E does not approve daily goal logic changes.
Phase 37E does not approve completion logic changes.
Phase 37E does not approve route behavior changes.
Phase 37E does not approve event handler changes.
Phase 37E does not approve package/dependency changes.
Phase 37E does not approve localStorage writes.
Phase 37E does not approve sessionStorage writes.
Phase 37E does not approve sync/cloud/account/auth/backend.
Phase 37E does not approve telemetry/network calls.
Phase 37E does not approve AI-generated themes.
Phase 37E does not approve replacement of readiness evidence with UI evidence.
Phase 37E does not approve guaranteed data-loss prevention.

## Next recommended phase
Next recommended phase: PHASE37F_LIMITED_RELEASE_EVIDENCE_REVIEW.
