# Phase 35I — Hybrid Navigation Indicator Evidence Review

## Status tokens

PHASE35I_HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW_STATUS: COMPLETED_HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW
PHASE35I_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE35I_HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE35J_NEXT_UI_POLISH_SCOPE
PHASE35I_REVIEW_SCOPE: HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE35I_HYBRID_NAVIGATION_INDICATOR_SCOPE_STATUS: HYBRID_NAVIGATION_INDICATOR_REVIEWED_AND_CARRIED_FORWARD
PHASE35J_NEXT_UI_POLISH_SCOPE_SEED_STATUS: PREPARED_SCOPE_SEED

## Scope

Phase 35I reviews the merged Phase 35H Hybrid Sliding Navigation Indicator evidence only. It makes no runtime behavior changes, no route changes, no package changes, no test source changes, and no storage, backup, restore, import, parser, scheduler, FSRS, sync, cloud, backend, auth, telemetry, or data model changes.

## Inputs from Phase 35H

Phase 35H selected `PHASE35H_SELECTED_EFFECT: HYBRID_SLIDING_NAVIGATION_INDICATOR` and implemented a visual-only primary navigation active indicator in the existing desktop `Sidebar` and mobile `BottomNav`. Its evidence states that route destinations, `navRoutes`, click semantics, page rendering logic, focus behavior, reduced-motion behavior, and `/study-room` `focusMode` nav hiding were preserved.

## Review method

The review used merged Phase 35H evidence, static inspection of the Phase 35H evidence and validator claims, workflow registration review, and the required validation commands for this phase. The review treats Phase 35H browser evidence as carried-forward evidence and does not add or change runtime implementation.

## Hybrid Navigation Indicator evidence review table

| Review surface | Phase 35H evidence | Review finding | Remaining limitation | Decision impact | Allowed claim | Not allowed claim |
| --- | --- | --- | --- | --- | --- | --- |
| desktop active indicator | Desktop `/dashboard`, `/library`, and `/settings` evidence recorded active indicator bounds and `aria-current="page"`. | Evidence supports a visual active indicator on desktop nav-visible routes. | Evidence is scoped to listed routes and current nav density. | Supports pass to Phase 35J. | Desktop nav-visible routes have reviewed indicator evidence. | Phase 35I proves all desktop layouts are broadly validated. |
| mobile active indicator | Mobile 375px evidence recorded bottom-nav indicator bounds for `/dashboard`, `/library`, and `/settings`. | Evidence supports a visual active indicator on mobile nav-visible routes. | Evidence is scoped to 375px and current bottom-nav layout. | Supports pass to Phase 35J. | Mobile nav-visible routes have reviewed indicator evidence. | Phase 35I proves every mobile viewport is stress-tested. |
| dashboard route indicator | Phase 35H recorded `/dashboard` indicator evidence on desktop and mobile. | Dashboard active state evidence is adequate for this review. | Review does not add new route coverage. | Supports pass to Phase 35J. | Dashboard route indicator evidence is carried forward. | A dashboard runtime redesign is supported. |
| library route indicator | Phase 35H recorded `/library` indicator evidence on desktop and mobile. | Library active state evidence is adequate for this review. | Review does not add new route coverage. | Supports pass to Phase 35J. | Library route indicator evidence is carried forward. | A library runtime redesign is supported. |
| settings route indicator | Phase 35H recorded `/settings` indicator evidence on desktop and mobile. | Settings active state evidence is adequate for this review. | Review does not add new route coverage. | Supports pass to Phase 35J. | Settings route indicator evidence is carried forward. | Settings behavior changes are supported. |
| study-room route behavior | Phase 35H recorded that existing Phòng học links still route to `/study-room` and render the study heading. | Route behavior preservation is supported by the evidence. | Active indicator visibility is not expected on hidden-nav pages. | Supports pass to Phase 35J. | `/study-room` route behavior was reviewed as preserved. | Phase 35I claims the indicator is visible on hidden-nav pages. |
| Study Room focusMode nav hiding | Phase 35H documented existing `focusMode` page rendering hides primary navigation on `/study-room`. | This is an existing behavior and not a regression from the indicator. | No active indicator appears where nav is intentionally hidden. | Supports pass to Phase 35J with limitation carried forward. | `focusMode` nav hiding is reviewed and carried forward. | Changing Study Room nav visibility is supported. |
| keyboard/focus behavior | Phase 35H documented existing focus outlines, `pointer-events: none`, and `aria-hidden="true"` on the indicator. | Keyboard/focus evidence is adequate for a visual-only indicator review. | Evidence is not a broad accessibility audit. | Supports pass to Phase 35J. | Keyboard focus evidence was reviewed for nav-visible routes. | Broad accessibility certification is supported. |
| reduced-motion behavior | Phase 35H documented reduced-motion media query disabling transitions. | Reduced-motion evidence is adequate for this review. | Evidence is scoped to the indicator and nav items. | Supports pass to Phase 35J. | Reduced-motion behavior was reviewed for the indicator. | Broad motion-system changes are supported. |
| mobile 375px no-overflow | Phase 35H recorded `scrollWidth=375`, `clientWidth=375`, and `bodyScrollWidth=375`. | 375px no-overflow evidence is adequate. | Other mobile widths remain outside this review. | Supports pass to Phase 35J. | 375px no-overflow evidence is carried forward. | Phase 35I proves every device width is overflow-free. |
| E2E smoke | Phase 35H stated no E2E specs changed and existing smoke paths should continue route coverage. | Phase 35I validation reruns smoke coverage without changing specs. | E2E scope remains smoke-level. | Supports pass to Phase 35J if validation passes. | E2E smoke was rerun for this review. | Broad E2E coverage is supported. |
| E2E onboarding | Phase 35H stated onboarding paths should continue exercising same route destinations. | Phase 35I validation reruns onboarding coverage without changing specs. | E2E scope remains onboarding smoke-level. | Supports pass to Phase 35J if validation passes. | E2E onboarding was rerun for this review. | All onboarding variants are supported. |
| no route/destination changes | Phase 35H evidence states `navRoutes`, `NavLink to={item.path}`, click semantics, and page rendering were preserved. | Route behavior preservation is supported. | Review does not approve future route changes. | Supports pass to Phase 35J. | No route behavior change is carried forward. | Route behavior changes are supported. |
| no package/dependency changes | Phase 35H evidence states no packages or dependencies were added. | Dependency boundary is preserved. | Future package changes need separate approval. | Supports pass to Phase 35J. | No package/dependency change is carried forward. | Dependency changes are supported. |
| claim guardrails | Phase 35H retained LIMITED_BETA_CANDIDATE and denied broader readiness claims. | Claim guardrails remain valid. | No readiness expansion is granted. | Supports pass to Phase 35J. | LIMITED_BETA_CANDIDATE remains highest approved readiness. | BETA_READY or production readiness is supported. |
| validator post-merge safety | Phase 35I validator supports `pr-diff`, `post-merge-main`, and `validator-hotfix`. | Validator is designed to pass after merge when required files exist and diff is empty. | It depends on `origin/main` being available via checkout fetch-depth. | Supports pass to Phase 35J. | Validator mode safety is reviewed. | Shell-fetching remotes inside validators is supported. |
| Phase 35J next UI polish scope seed | Phase 35I creates the Phase 35J scope seed. | Next phase is bounded as a scope gate. | It does not approve implementation. | Supports pass to Phase 35J. | Phase 35J scope seed is prepared. | Automatic runtime polish implementation is supported. |

## Desktop indicator review

Phase 35H desktop evidence supports that the indicator appears behind the active sidebar item on nav-visible routes and follows route active state for `/dashboard`, `/library`, and `/settings`. Phase 35I carries this evidence forward without changing desktop navigation code.

## Mobile indicator review

Phase 35H mobile evidence supports that the indicator appears in the bottom navigation at 375px on nav-visible routes and follows route active state for `/dashboard`, `/library`, and `/settings`. Phase 35I carries this evidence forward without changing mobile navigation code.

## Route behavior preservation review

Phase 35H evidence states that `navRoutes`, `NavLink` destinations, click semantics, and page rendering logic were preserved. Phase 35I finds this evidence sufficient for an evidence-review pass and does not approve any route behavior changes.

## Study Room focusMode review

The existing `/study-room` `focusMode` behavior hides primary navigation. Phase 35I reviews that as existing behavior, not a regression, and does not claim the active indicator is visible on hidden-nav pages.

## E2E smoke and onboarding review

Phase 35I reruns smoke and onboarding E2E validation without changing E2E source. These tests remain smoke-level evidence and do not become broad validation.

## Accessibility and keyboard review

Phase 35H evidence shows the visual indicator is `aria-hidden`, has `pointer-events: none`, and leaves existing focus-visible styling in place. Phase 35I treats this as targeted keyboard/focus evidence, not a full accessibility audit.

## Reduced-motion review

Phase 35H evidence records reduced-motion handling for the indicator and nav item transitions. Phase 35I carries that evidence forward and does not approve broader motion-system changes.

## Mobile and responsive review

Phase 35H recorded no horizontal overflow at 375px on nav-visible routes and `/study-room`. Phase 35I carries forward this 375px evidence only.

## Forbidden system change review

Phase 35I does not approve storage/backup/restore behavior changes. Phase 35I does not approve sync/cloud/account/auth/backend. Phase 35I does not approve telemetry/network calls. Phase 35I does not approve built-in AI/OCR/API-key/BYOK behavior. Phase 35I does not approve route behavior changes. Phase 35I does not approve package/dependency changes. Phase 35I does not approve broad navigation rewrite.

## Validator post-merge safety review

The Phase 35I validator supports `pr-diff`, `post-merge-main`, and `validator-hotfix` from initial implementation. It verifies `origin/main` availability, does not execute internal `git fetch`, rejects forbidden changed files in PR-diff mode, permits empty post-merge-main diffs when required Phase 35I files and content checks pass, and limits validator-hotfix mode to the Phase 35I validator file.

## Claim guardrail review

Phase 35I confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status. Phase 35I does not approve BETA_READY. Phase 35I does not approve public production readiness. Phase 35I does not approve broad validation or stress-tested readiness. Phase 35I does not approve guaranteed data-loss prevention.

## Risks and follow-up

Remaining risk is limited to future UI phases changing nav density, route surfaces, or Study Room nav visibility. Any such change needs a separate scope gate and evidence.

## Chosen review decision

PHASE35I_HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE35J_NEXT_UI_POLISH_SCOPE

## Decision rationale

Phase 35H evidence is sufficient to carry the Hybrid Navigation Indicator forward as reviewed while preserving route behavior and readiness guardrails. The next step should be a scope gate, not automatic implementation.

## What Phase 35I supports

Phase 35I supports carrying forward the reviewed Hybrid Navigation Indicator evidence for existing desktop and mobile primary navigation.

## What Phase 35I does not approve

Phase 35I does not approve Elastic Button Compression implementation. Phase 35I does not approve Study Room polish. Phase 35I does not approve Streak Fire. Phase 35I does not approve Collapsible Header. Phase 35I does not approve Dynamic Canvas Themes implementation.

## Next recommended phase

Next recommended phase: Phase 35J — Next UI Polish Scope Gate. Phase 35J is a scope gate and is not automatic runtime implementation.
