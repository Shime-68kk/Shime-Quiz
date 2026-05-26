# Phase 36D — Mobile Touch Follow-up and Library Tabs Touch/Focus Scope Gate

## Status tokens
PHASE36D_MOBILE_TOUCH_LIBRARY_TABS_SCOPE_STATUS: COMPLETED_MOBILE_TOUCH_LIBRARY_TABS_SCOPE_GATE

PHASE36D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE36D_MOBILE_TOUCH_LIBRARY_TABS_SCOPE_DECISION: PASS_TO_PHASE36E_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_IMPLEMENTATION

PHASE36D_REVIEW_SCOPE: MOBILE_TOUCH_FOLLOWUP_AND_LIBRARY_TABS_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES

PHASE36D_SELECTED_CANDIDATE: LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT

PHASE36E_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Scope
Phase 36D is a docs/research/release/planning/static-validator/CI-only review and scope gate.

No runtime source, CSS, route/navigation, test source, E2E source, package, data model, storage, backup, restore, import, parser, database, scheduler, FSRS, sync, cloud, backend, auth, telemetry, network, or Study Room answer logic behavior is changed by this phase.

## Inputs from Phase 36C
Phase 36C reviewed the merged Phase 36B Bottom Navigation Touch Comfort and Safe-Area Pilot evidence and passed the mobile/touch track to a follow-up scope review.

Phase 36C carried forward 375px no-horizontal-overflow evidence, touch target comfort evidence, safe-area fallback evidence, active route indicator correctness, Library tap navigation to `/library`, focus-visible evidence, reduced-motion evidence, desktop/sidebar non-impact evidence, and E2E smoke/onboarding evidence.

Physical-device safe-area validation remains unproven.

## Why this phase combines follow-up review and scope gate
The Phase 36C outcome did not require BottomNav runtime fixes before selecting another small mobile/touch surface. Combining the follow-up review with the next scope gate keeps Phase 36D docs-only while avoiding a separate planning-only phase for the same decision.

The combination does not approve implementation in Phase 36D.

## Mobile touch follow-up review
The BottomNav pilot can be carried forward with its documented limitations. The next step should remain narrow, reversible, and mobile/touch oriented.

No BottomNav follow-up fix is selected in this phase because the reviewed evidence supports moving to a separate small candidate while continuing to carry the physical-device safe-area limitation.

## Candidate comparison table
Candidate | User value | Expected implementation size | Risk | Mobile/accessibility impact | Decision
--- | --- | --- | --- | --- | ---
Library Mobile Tabs Touch and Focus Pilot | Improves a central Library mobile control after Phase 35B tab introduction. | Small, likely component-local CSS/class adjustment. | Low if tab roles, labels, panels, import status, and data behavior are preserved. | Direct mobile touch comfort and focus-visible value. | Selected for Phase 36E seed.
Dashboard Calm Home Mobile Density Pilot | Could improve first-screen scanning on mobile. | Small to medium depending on dashboard density. | Higher because dashboard layout has broader information hierarchy impact. | Mobile readability value, less direct tab/focus scope. | Deferred.
Study Room Mobile Answer Feedback Readability Pilot | Could improve answer result comprehension. | Medium because Study Room answer surfaces are behavior-sensitive. | Higher due to correctness, scoring, queue, and scheduler adjacency. | Mobile readability value but touches sensitive learning flow. | Deferred.
BottomNav Follow-up Fixes | Could address BottomNav gaps if Phase 36C required fixes. | Small if limited to BottomNav. | Low to medium depending on safe-area evidence needs. | Mobile touch/safe-area value. | Deferred because Phase 36C did not require immediate fixes.
Accessibility Focus Polish Scope Gate | Could improve focus consistency across surfaces. | Medium because scope can spread across many controls. | Medium due to broad surface area. | Accessibility value, but less specific than Library tabs. | Deferred.
375px No-Overflow Audit / Fix Candidate | Could find mobile overflow regressions. | Medium to large because audit may span many pages. | Medium due to broad runtime blast radius. | Strong mobile layout value. | Deferred.
Elastic Button Compression Mobile Touch Follow-up | Could refine existing button polish on mobile. | Small to medium. | Medium because button behavior appears across many workflows. | Touch comfort value, broad component reach. | Deferred.
Dynamic Canvas Themes Design Gate | Could prepare a future visual theme track. | Docs/design gate only if scoped. | Medium because visual theming can expand quickly. | Limited immediate mobile/accessibility value. | Deferred.
Streak Fire Ignition Design Gate | Could prepare future motivation visuals. | Docs/design gate only if scoped. | Medium due to gamification and animation risk. | Limited immediate mobile/accessibility value. | Deferred.
Collapsible Header Scope Gate | Could improve vertical space on mobile. | Medium. | Medium to high due to route/layout and scroll interaction risk. | Mobile density value, but broader navigation/layout impact. | Deferred.

## Selected candidate
PHASE36D_SELECTED_CANDIDATE: LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT

The selected candidate is Library Mobile Tabs Touch and Focus Pilot.

## Why Library Mobile Tabs Touch and Focus Pilot first
Library tabs are central on mobile and were introduced recently enough to benefit from a narrow touch/focus pass.

This candidate can target Library tab switcher density, tap comfort, focus-visible behavior, reduced-motion preservation, and 375px no-overflow evidence without touching route/navigation, import/parser behavior, storage, backup, restore, scheduler, sync, backend, auth, telemetry, package files, or data models.

## Why this is a scope gate, not runtime implementation
Phase 36D selects and seeds exactly one next runtime candidate, but it does not implement any runtime UI, CSS, source, test, or E2E changes.

Phase 36D does not approve new runtime UI implementation.

## Phase 36E allowed files / expected areas
Phase 36E may be a small runtime pilot only.

Expected areas for Phase 36E should be limited to Library mobile tab switcher implementation, adjacent Library styling needed for tab touch comfort and focus-visible behavior, focused unit or E2E evidence if required by the implementation, Phase 36E evidence/release/planning docs, a Phase 36E validator, and smoke workflow registration.

Phase 36E should prefer CSS/class adjustments and minimal component-local changes.

## Phase 36E forbidden areas
Phase 36E must not change import tools, parser logic, file import behavior, backup/restore behavior, schema behavior, demo sample behavior, EduGen/draft workshop logic, stored data, routes, navigation, sync/backend/auth/telemetry, package files, or dependencies.

Phase 36E must not implement Dashboard, Study Room, Dynamic Canvas Themes, Streak Fire, Collapsible Header, or broad mobile redesign changes.

## Accessibility and reduced-motion requirements
Phase 36E must preserve tab roles, labels, `aria-selected`, `aria-controls`, panel mounting behavior, raw input preservation, and importStatus visibility.

Phase 36E must include focus-visible evidence and reduced-motion evidence for the Library mobile tab switcher.

## Mobile and touch evidence requirements
Phase 36E must include 375px mobile evidence, touch target/tap comfort evidence, no-horizontal-overflow evidence, and E2E smoke/onboarding evidence.

Physical-device safe-area validation remains unproven and must not be claimed by Phase 36E unless a later phase documents real physical safe-area device evidence.

## Risk assessment
The selected candidate has low expected risk if it remains limited to Library tabs and preserves tab semantics, import visibility, data behavior, and route behavior.

The main risk is scope expansion into import/parser, Library data flows, or broad mobile redesign; those areas remain explicitly forbidden.

## Rollback plan for Phase 36E
Rollback should remove only the Phase 36E Library tab touch/focus runtime adjustments, related focused tests or evidence, Phase 36E docs, validator registration, and workflow registration.

Rollback must not require data migration or package changes.

## Chosen scope decision
PHASE36D_MOBILE_TOUCH_LIBRARY_TABS_SCOPE_DECISION: PASS_TO_PHASE36E_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_IMPLEMENTATION

## Decision rationale
Library Mobile Tabs Touch and Focus Pilot is the smallest candidate with direct mobile/touch and accessibility value after the BottomNav pilot.

It continues the mobile/touch track while avoiding route/navigation, Study Room answer logic, scheduler, storage, import/parser, sync/backend/auth, telemetry, and package/dependency risk.

## What Phase 36D supports
Phase 36D supports a docs-only follow-up review and one selected Phase 36E candidate.

Phase 36D supports `pr-diff`, `post-merge-main`, and `validator-hotfix` validator modes.

## What Phase 36D does not approve
Phase 36D does not approve BETA_READY.

Phase 36D does not approve public production readiness.

Phase 36D does not approve broad validation or stress-tested readiness.

Phase 36D does not approve guaranteed data-loss prevention.

Phase 36D does not approve storage/backup/restore behavior changes.

Phase 36D does not approve import/parser behavior changes.

Phase 36D does not approve sync/cloud/account/auth/backend.

Phase 36D does not approve telemetry/network calls.

Phase 36D does not approve built-in AI/OCR/API-key/BYOK behavior.

Phase 36D does not approve route behavior changes.

Phase 36D does not approve package/dependency changes.

Phase 36D does not approve Study Room correctness/scoring/scheduler/queue/data changes.

Phase 36D does not approve Dynamic Canvas Themes implementation.

Phase 36D does not approve Streak Fire.

Phase 36D does not approve Collapsible Header.

Phase 36D does not approve broad UI redesign.

Phase 36D does not approve new runtime UI implementation.

Phase 36D does not approve broader mobile runtime changes.

## Next recommended phase
Next recommended phase: Phase 36E — Library Mobile Tabs Touch and Focus Pilot Implementation

Phase 36E is a small runtime pilot and is not approval for broad mobile redesign.
