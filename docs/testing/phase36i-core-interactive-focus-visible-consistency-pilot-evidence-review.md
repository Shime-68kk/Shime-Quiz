# Phase 36I — Core Interactive Focus Visible Consistency Pilot Evidence Review

## Status tokens

PHASE36I_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_EVIDENCE_REVIEW_STATUS: COMPLETED_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_EVIDENCE_REVIEW

PHASE36I_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE36I_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE36J_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_REVIEW

PHASE36I_REVIEW_SCOPE: CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES

PHASE36I_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_SCOPE_STATUS: CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_REVIEWED_AND_CARRIED_FORWARD

PHASE36J_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED

## Scope

Phase 36I reviews the merged Phase 36H Core Interactive Focus Visible Consistency Pilot evidence. It is limited to documentation, testing evidence review, release summary, planning seed, static validator, and CI registration. Phase 36I makes no runtime behavior changes.

## Inputs from Phase 36H

Phase 36H implemented a CSS-only focus-visible consistency pilot in `src/styles/global.css`. It added standardized focus-visible variables and representative rules for existing core interactive controls while preserving event handlers, routing, tab state, import behavior, storage/data behavior, scheduler/FSRS behavior, sync/backend/auth/telemetry behavior, package files, dependencies, and page content.

## Review method

The review compared the merged Phase 36H evidence document, release summary, validator behavior, workflow registration, and allowed-file boundary against the Phase 36I requirements. The review treats Phase 36H browser measurements and static tests as evidence carried forward, not as new physical-device or assistive-technology audit evidence.

## Core focus-visible evidence review table

| Review surface | Phase 36H evidence | Review finding | Remaining limitation | Decision impact | Allowed claim | Not allowed claim |
| --- | --- | --- | --- | --- | --- | --- |
| CSS-only implementation scope | Phase 36H changed `src/styles/global.css` for focus-visible variables and rules. | CSS-only runtime scope is reviewed as preserved. | This review does not inspect every possible visual state. | Supports pass to Phase 36J. | The pilot was CSS-only. | Broad UI redesign is approved. |
| no component JSX/runtime logic changes | Phase 36H did not change component files. | No JSX or runtime logic change is carried forward. | Static review cannot prove every browser path. | Supports pass to Phase 36J. | Component runtime logic was not changed by the pilot. | Event or route behavior changes are approved. |
| keyboard tab reachability | Phase 36H reported Tab reachability for representative desktop and mobile-sized controls. | Keyboard tab reachability evidence is reviewed as sufficient for the pilot. | It is representative browser evidence, not exhaustive app-wide audit evidence. | Supports guarded pass to Phase 36J. | Keyboard tab reachability was reviewed for representative controls. | Complete keyboard accessibility is certified. |
| primary button focus-visible | Phase 36H reported visible focus ring on `Mở Tổng quan`. | Primary button focus-visible evidence is reviewed. | Only representative primary buttons were sampled. | Supports pass to Phase 36J. | Primary button focus-visible evidence exists. | Every button state is exhaustively validated. |
| nav/link item focus-visible | Phase 36H reported visible focus on `Tổng quan`. | Nav/link focus-visible evidence is reviewed. | This is not a full route-navigation behavior audit. | Supports pass to Phase 36J. | Nav/link item focus-visible evidence exists. | Route behavior changes are approved. |
| Dashboard tab focus-visible | Phase 36H reported visible focus on the `Hôm nay` Dashboard tab. | Dashboard tab evidence is reviewed. | Does not review every Dashboard visual state. | Supports pass to Phase 36J. | Dashboard tab focus-visible evidence exists. | App-wide tab redesign is approved. |
| Library tab focus-visible | Phase 36H reported visible focus on `Kệ sách của tôi`. | Library tab evidence is reviewed and carried forward with Phase 36F context. | This does not add new Library behavior evidence. | Supports pass to Phase 36J. | Library tab focus-visible evidence exists. | Library import behavior changes are approved. |
| textarea focus-visible | Phase 36H reported visible focus on a form textarea. | Textarea focus-visible evidence is reviewed. | It is not a full form-control inventory. | Supports pass to Phase 36J. | Textarea focus-visible evidence exists. | All form accessibility is certified. |
| 375px no horizontal overflow | Phase 36H reported `innerWidth`, document scroll width, and body scroll width at `375`. | 375px browser no-horizontal-overflow evidence is reviewed. | It is viewport evidence, not physical-device audit. | Supports pass to Phase 36J. | 375px browser no-horizontal-overflow evidence exists. | All mobile devices are validated. |
| reduced-motion behavior | Phase 36H added no keyframes and preserved reduced-motion coverage. | Reduced-motion safety is reviewed as acceptable for this pilot. | No broad animation audit was performed. | Supports pass to Phase 36J. | Reduced-motion behavior was reviewed for focus-visible surfaces. | Dynamic Canvas Themes implementation is approved. |
| desktop acceptability | Phase 36H reported desktop focus rings remained visible without layout shift. | Desktop acceptability is reviewed. | This is not broad visual regression coverage. | Supports pass to Phase 36J. | Desktop acceptability evidence exists for representative controls. | Broad desktop UI redesign is approved. |
| handler preservation | Phase 36H reported no event handlers were edited. | Handler preservation is reviewed. | Runtime event telemetry was not added. | Supports pass to Phase 36J. | Event handlers were not changed. | Event handler changes are approved. |
| routing preservation | Phase 36H reported no routing or navigation implementation edits. | Routing preservation is reviewed. | This does not re-audit every navigation path. | Supports pass to Phase 36J. | Routing behavior was not changed. | Route behavior changes are approved. |
| tab-state preservation | Phase 36H reported no tab-state edits. | Tab-state preservation is reviewed. | It does not expand state-management coverage. | Supports pass to Phase 36J. | Tab-state behavior was not changed. | Tab-state changes are approved. |
| import behavior preservation | Phase 36H reported no import behavior edits. | Import behavior preservation is reviewed. | Import correctness was not re-tested beyond existing evidence. | Supports pass to Phase 36J. | Import behavior was not changed. | Import/parser behavior changes are approved. |
| storage/data preservation | Phase 36H reported no storage or data behavior edits. | Storage/data preservation is reviewed. | No backup/restore or data-loss audit was performed. | Supports pass to Phase 36J. | Storage/data behavior was not changed. | Guaranteed data-loss prevention is approved. |
| scheduler/FSRS preservation | Phase 36H reported no scheduler or FSRS edits. | Scheduler/FSRS preservation is reviewed. | Scheduling correctness was not re-audited. | Supports pass to Phase 36J. | Scheduler/FSRS behavior was not changed. | Study Room queue or scheduler changes are approved. |
| sync/backend/auth/telemetry preservation | Phase 36H reported no sync, backend, auth, or telemetry edits. | Preservation claim is acceptable. | No network or cloud readiness audit was performed. | Supports pass to Phase 36J. | Sync/backend/auth/telemetry behavior was not changed. | Sync/cloud/account/auth/backend is approved. |
| package/dependency unchanged | Phase 36H reported no package or dependency edits. | Package/dependency preservation is reviewed. | Dependency health was not re-audited. | Supports pass to Phase 36J. | Package/dependency files were unchanged. | Package/dependency changes are approved. |
| E2E smoke | Phase 36H reported smoke E2E passed. | Smoke evidence is carried forward. | Smoke is not exhaustive regression coverage. | Supports pass to Phase 36J. | Smoke E2E evidence exists. | Broad validation is approved. |
| E2E onboarding | Phase 36H reported onboarding E2E passed. | Onboarding evidence is carried forward. | Onboarding does not cover every focus-visible surface. | Supports pass to Phase 36J. | Onboarding E2E evidence exists. | Stress-tested readiness is approved. |
| static unit-test evidence boundary | Phase 36H added static unit coverage for CSS tokens and representative selectors. | Static unit-test evidence boundary is carried forward. | Static unit tests do not replace browser, physical-device, or assistive-technology audits. | Supports guarded pass to Phase 36J. | Static unit-test evidence exists within pilot scope. | Static tests prove complete accessibility or runtime behavior. |
| no accessibility certification | Phase 36H explicitly did not claim certification. | Certification boundary is preserved. | Accessibility certification remains out of scope. | Keeps readiness at limited beta candidate. | Accessibility certification is not approved. | Accessibility certification is complete. |
| no assistive technology review completion | Phase 36H explicitly did not claim assistive technology review completion. | Assistive-technology limitation is carried forward. | No screen reader or other AT completion review was performed. | Keeps readiness at limited beta candidate. | Assistive technology review completion is not approved. | Assistive technology review completion is complete. |
| validator post-merge safety | Phase 36I adds validator modes for `pr-diff`, `post-merge-main`, and `validator-hotfix`. | Validator design is post-merge-main-safe from initial implementation. | Requires `origin/main` to be available from checkout. | Supports CI registration. | Phase 36I validator supports all required modes. | Historical validator chain is active. |
| Phase 36J mobile/accessibility track completion review seed | Phase 36I creates a Phase 36J completion review seed. | Seed is appropriate because Phase 36J is a review phase. | It does not select or implement runtime work. | Supports pass to Phase 36J. | Phase 36J seed is prepared. | Automatic next runtime implementation is approved. |

## CSS-only scope review

Phase 36I reviewed that Phase 36H was a CSS-only implementation in `src/styles/global.css` and that Phase 36I does not add runtime source changes.

## Focus-visible ownership review

Phase 36I reviewed Phase 36H ownership discovery for existing `.button`, `.navItem`, `.bottomNav__item`, `.dashboardCalmTab`, `.libraryTab`, form-control, memory-rating, settings-toggle, and result-summary focus-visible or focus-within rules.

## Keyboard tab reachability review

Phase 36I carries forward Phase 36H representative browser evidence that keyboard Tab reached representative controls on desktop and mobile-sized viewports. This is not a complete keyboard navigation audit.

## Representative focus-visible control review

Phase 36I reviewed Phase 36H representative focus-visible evidence for a primary button, nav/link item, Dashboard tab, Library tab, and textarea. The allowed claim is limited to the reviewed representative controls.

## 375px mobile no-overflow review

Phase 36I carries forward Phase 36H 375px browser evidence showing no horizontal document overflow. Physical-device audit is not claimed.

## Reduced-motion review

Phase 36I reviewed that Phase 36H added no keyframes or focus animation and preserved reduced-motion handling for representative focus surfaces.

## Desktop acceptability review

Phase 36I reviewed Phase 36H desktop evidence that focus-visible rings remained visible on representative controls without layout shift. This does not approve broad desktop visual regression coverage.

## Handler/routing/state/data preservation review

Phase 36I reviewed that Phase 36H did not change event handlers, routing behavior, route configuration, navigation implementation, tab-state behavior, page content, or data model behavior.

## Import/storage/scheduler/sync preservation review

Phase 36I reviewed that Phase 36H did not change import/parser behavior, storage/backup/restore behavior, scheduler/FSRS behavior, sync/cloud/account/auth/backend behavior, telemetry/network calls, built-in AI/OCR/API-key/BYOK behavior, or package/dependency files.

## E2E smoke and onboarding review

Phase 36I carries forward Phase 36H E2E smoke and onboarding evidence as narrow regression evidence. These runs do not approve broad validation or stress-tested readiness.

## Accessibility claim boundary review

Phase 36I does not approve accessibility certification and does not approve assistive technology review completion. Physical-device and assistive-technology limitations are explicitly carried forward to Phase 36J.

## Forbidden system change review

Phase 36I changes no runtime source, unit test source, E2E source, package files, storage/backup/restore code, import/parser/database/prompt code, scheduler/FSRS code, sync/cloud/account/auth/backend code, telemetry/network code, route/navigation implementation, Study Room answer logic, or data model files.

## Validator post-merge safety review

The Phase 36I validator supports `pr-diff`, `post-merge-main`, and `validator-hotfix` from initial implementation. `pr-diff` requires the exact allowed Phase 36I files and rejects forbidden files. `post-merge-main` permits an empty diff after merge when the required Phase 36I files and content checks pass. `validator-hotfix` allows only `scripts/validate-phase36i-core-interactive-focus-visible-consistency-pilot-evidence-review.js` to change while keeping content, token, workflow, and claim checks active.

## Claim guardrail review

Next recommended phase: Phase 36J — Mobile/Accessibility Track Completion Review

Phase 36J is a completion review and is not automatic runtime implementation.

Phase 36I confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.

Phase 36I does not approve BETA_READY.
Phase 36I does not approve public production readiness.
Phase 36I does not approve broad validation or stress-tested readiness.
Phase 36I does not approve guaranteed data-loss prevention.
Phase 36I does not approve accessibility certification.
Phase 36I does not approve assistive technology review completion.
Phase 36I does not approve storage/backup/restore behavior changes.
Phase 36I does not approve import/parser behavior changes.
Phase 36I does not approve sync/cloud/account/auth/backend.
Phase 36I does not approve telemetry/network calls.
Phase 36I does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 36I does not approve route behavior changes.
Phase 36I does not approve event handler changes.
Phase 36I does not approve tab-state changes.
Phase 36I does not approve package/dependency changes.
Phase 36I does not approve Study Room correctness/scoring/scheduler/queue/data changes.
Phase 36I does not approve Dynamic Canvas Themes implementation.
Phase 36I does not approve Streak Fire.
Phase 36I does not approve Collapsible Header.
Phase 36I does not approve broad UI redesign.
Phase 36I does not approve broader mobile/accessibility runtime changes.
Phase 36I does not approve automatic next runtime implementation.

## Risks and follow-up

Remaining risks are limited evidence breadth, no physical-device audit, no assistive-technology completion review, no broad regression coverage, and no stress testing. Phase 36J should decide whether the current mobile/accessibility track can close for now, needs more evidence, needs a Phase 36H fix, or should seed one separate future scope gate.

## Chosen review decision

PHASE36I_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE36J_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_REVIEW

## Decision rationale

The merged Phase 36H evidence supports the narrow CSS-only Core Interactive Focus Visible Consistency Pilot. Phase 36I preserves readiness guardrails, does not expand runtime scope, keeps physical-device and assistive-technology limitations explicit, and prepares Phase 36J as a completion review.

## What Phase 36I supports

Phase 36I supports carrying the reviewed Core Interactive Focus Visible Consistency Pilot evidence forward to Phase 36J and registering a post-merge-main-safe Phase 36I validator in CI.

## What Phase 36I does not approve

Phase 36I does not approve BETA_READY, public production readiness, broad validation, stress-tested readiness, guaranteed data-loss prevention, accessibility certification, assistive technology review completion, system behavior changes, broader mobile/accessibility runtime changes, or automatic next runtime implementation.

## Next recommended phase

Phase 36J — Mobile/Accessibility Track Completion Review.
