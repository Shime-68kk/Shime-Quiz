# Phase 37-uiM — Streak Fire Evidence Review and Collapsible Avatar Header Scope Gate
## Status tokens
PHASE37UIM_STREAK_FIRE_IGNITION_MICRO_MOMENT_EVIDENCE_REVIEW_STATUS: COMPLETED_STREAK_FIRE_EVIDENCE_REVIEW_AND_COLLAPSIBLE_AVATAR_HEADER_SCOPE_GATE

PHASE37UIM_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE37UIM_STREAK_FIRE_IGNITION_MICRO_MOMENT_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UIN_COLLAPSIBLE_AVATAR_HEADER_PILOT_IMPLEMENTATION

PHASE37UIM_REVIEW_SCOPE: STREAK_FIRE_EVIDENCE_REVIEW_AND_COLLAPSIBLE_AVATAR_HEADER_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES

PHASE37UIM_SELECTED_CANDIDATE: COLLAPSIBLE_AVATAR_HEADER_PILOT

PHASE37UIN_COLLAPSIBLE_AVATAR_HEADER_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED
## Scope
Phase 37-uiM is docs/review/research/release/planning/static-validator/CI-only. It reviews Phase 37-uiL Streak Fire Ignition Micro-Moment evidence and gates the next visual candidate without runtime behavior changes.
## Inputs from Phase 37-uiL and UI plan
Inputs are the merged Phase 37-uiL evidence, release summary, implementation seed, validator, workflow registration, unit coverage, and the UI plan direction to keep visible product-quality progress calm, premium, Vietnamese-first, and learner-owned.
## UI leadership direction
The next UI phase should modernize the app shell without turning identity into an account system. Collapsible Avatar Header is viable only as a header/app-shell identity visual pilot, not auth, account, profile, sync, backend, or storage work.
## Review method
Review checked Phase 37-uiL claims against the changed-file boundary, one-surface containment, completion attachment, CSS-only micro-moment behavior, reduced-motion fallback, pressure-loop exclusions, storage/localStorage/telemetry preservation, E2E expectations, and release-readiness separation.
## Phase 37-uiL evidence review table
| Evidence row | Review result |
| --- | --- |
| exact success/completion attachment | Accepted: Phase 37-uiL attached the marker to the existing Study Room result summary rendered after `completedAttempt`. |
| one-surface containment | Accepted: the pilot targets `src/components/study/StudyResultSummary.jsx` `.studyResultHero` only. |
| passive marker | Accepted: the added class/data marker is decorative and does not create state, timers, handlers, or storage writes. |
| CSS-only visual treatment | Accepted: the ember aura and ignition ring are implemented in `src/styles/global.css`. |
| no new completion state | Accepted: Phase 37-uiL did not introduce a new completion source of truth. |
| no streak calculation changes | Accepted: streak calculation and streak counters remain outside the diff. |
| no daily goal logic changes | Accepted: daily goal and plan-progress logic remain outside the diff. |
| no completion logic changes | Accepted: `finishSession` in `src/routes/StudyRoom.jsx` was documented and not edited. |
| no scoring changes | Accepted: scoring and correctness logic remain outside the diff. |
| no queue or scheduler changes | Accepted: queue, scheduler, and FSRS areas remain outside the diff. |
| no data logic changes | Accepted: study data and history behavior remain outside the diff. |
| no storage or localStorage writes | Accepted: no storage, localStorage, sessionStorage, or theme writes were added. |
| no telemetry or network calls | Accepted: no telemetry, beacon, fetch, or network call was added. |
| no route/navigation changes | Accepted: route config and navigation behavior remain outside the diff. |
| no handlers or form submission changes | Accepted: no click handlers, submit handlers, or button types changed. |
| no disabled behavior changes | Accepted: no disabled-state behavior was changed. |
| pressure-loop exclusions | Accepted: no streak counter, daily goal engine, penalty messaging, social pressure, sound, confetti, casino-like reward loop, or persistent chain status was introduced. |
| reduced-motion fallback | Accepted: reduced-motion disables animations and keeps a static glow fallback. |
| focus-visible preservation | Accepted: focus-visible selectors and interactive behavior were not changed. |
| mobile 375px behavior | Accepted with carry-forward browser evidence: Phase 37-uiL reported one marker and no 375px horizontal overflow. |
| desktop behavior | Accepted: desktop layout remains the existing result card with bounded decorative treatment. |
| E2E smoke | Accepted as required validation coverage for unchanged app navigation and study flow. |
| E2E onboarding | Accepted as required validation coverage for unchanged onboarding behavior. |
| Phase 37C separation | Accepted: Limited Release Readiness Gap Review remains separate. |
| no readiness upgrade | Accepted: LIMITED_BETA_CANDIDATE remains the highest approved status. |
## Streak Fire visual quality review
The effect is a brief completion acknowledgement on an existing result surface. It reads as a calm success accent rather than a reward engine because it adds no counter, pressure copy, persistence, social comparison, sound, or confetti.
## Completion-state attachment review
Attachment to the existing Study Room completion summary is acceptable because the completion source of truth remains in `src/routes/StudyRoom.jsx` and Phase 37-uiL did not edit that logic.
## Streak, daily goal, completion, scoring, queue, and scheduler preservation review
Phase 37-uiM accepts the Phase 37-uiL preservation claim: no streak calculation, daily goal logic, completion logic, scoring/correctness, scheduler, queue, FSRS, or study data behavior changed.
## Storage, localStorage, telemetry, and network preservation review
Phase 37-uiM accepts that Phase 37-uiL added no storage writes, localStorage writes, telemetry events, beacons, fetches, sync/cloud/account/auth/backend behavior, or network calls.
## Handler, form, disabled, and route preservation review
Phase 37-uiM accepts that Phase 37-uiL did not change route/navigation implementation, NavLink destinations, event handlers, button handlers, form submission, button types, or disabled behavior.
## Pressure-loop and motivation guardrail review
The pilot remains within calm motivation guardrails. Future phases must continue to reject streak engines, daily goal engines, loss aversion, penalty messaging, social pressure, sound, confetti, casino-like reward loops, persistent chain status, telemetry, or persistence.
## Accessibility, contrast, focus-visible, and reduced-motion review
Decorative pseudo-elements use `pointer-events: none`; text and controls remain unchanged. Reduced-motion receives a static fallback, and focus-visible behavior remains outside the pilot diff.
## Mobile 375px and desktop review
Mobile and desktop evidence is acceptable for an evidence gate. Any later visual pilot must carry its own 375px and desktop checks because app-shell/header changes have broader layout risk.
## E2E smoke and onboarding review
E2E smoke and onboarding remain required validation gates. Static evidence review does not replace the runtime E2E runs used before handoff.
## Phase 37C release-readiness separation review
Phase 37C Limited Release Readiness Gap Review remains separate. Phase 37-uiM does not approve BETA_READY, public production readiness, or any release-readiness upgrade.
## Collapsible Avatar Header risk review
Collapsible Avatar Header has higher layout and identity risk than the Streak Fire review because it may touch `src/layout/AppLayout.jsx`, `src/layout/Sidebar.jsx`, `src/layout/BottomNav.jsx`, `src/components/PageHeader.jsx`, and app-shell CSS. It is viable only as a visual/app-shell pilot with no auth, account, profile backend, route, navigation destination, storage, sync, telemetry, or handler changes.
## Header identity scope guardrail review
The next pilot may use local visual identity affordances such as an avatar mark, compact header state, or responsive app-shell polish. It must not create sign-in, account recovery, cloud sync, profile editing, avatar upload, user identity persistence, network calls, or backend contracts.
## Next visual candidate comparison table
| Candidate | Phase 37-uiM decision |
| --- | --- |
| Collapsible Avatar Header Pilot | Selected as the next scoped runtime pilot candidate only as modern app-shell/header identity visual work. |
| Streak Fire Expansion Backlog | Deferred until more browser evidence proves the micro-moment remains calm and bounded. |
| Elastic Tap Expansion Backlog | Deferred to avoid broad interaction expansion without a fresh scope gate. |
| UI Modernization Coherence Review | Deferred because Collapsible Avatar Header is a clearer high-impact visual pilot. |
| Dashboard Progress Motion Pilot | Deferred because it risks motivation-pressure overlap after Streak Fire. |
| Navigation Visual Backlog Review | Deferred because recent hybrid navigation work already has evidence. |
| Full Dynamic Canvas Themes | Not approved. |
| Full Theme Picker | Not approved. |
| Return To Phase 37C Gap Review First | Not selected; Phase 37C remains separate and not replaced. |
## Selected candidate
PHASE37UIM_SELECTED_CANDIDATE: COLLAPSIBLE_AVATAR_HEADER_PILOT
## Why Collapsible Avatar Header Pilot next
Shime now has improved navigation, collection cards, answer surfaces, tactile controls, and a completion micro-moment. The next high-impact visual gap is the app-shell/header identity layer, which can make the product feel more modern while staying independent from account infrastructure.
## Why this is a scope gate, not runtime implementation
Phase 37-uiM does not implement Collapsible Avatar Header. It records the Streak Fire evidence review, selected candidate, guardrails, seed, and validator checks only.
## Phase 37-uiN allowed files / expected areas
Phase 37-uiN may proceed only if its task defines an exact small runtime allowlist around existing app-shell/header visual files. Expected candidates may include app layout/header/sidebar/bottom navigation styling and focused tests/evidence, but exact files must be named by the Phase 37-uiN task before implementation.
## Phase 37-uiN forbidden areas
Phase 37-uiN must not modify auth, account, profile backend, sync, cloud, storage, import, parser, scheduler, FSRS, scoring, queue, study data, daily goal logic, streak calculation, completion logic, telemetry, route/navigation implementation, handlers, form submission, disabled behavior, package files, localStorage, or generated artifacts.
## Evidence requirements for Phase 37-uiN
Evidence must show app-shell/header-only visual scope, exact changed files, no account/auth/profile backend, no new identity persistence, no route or navigation destination changes, no handlers or form submission changes, no storage/localStorage/telemetry writes, no disabled behavior changes, mobile 375px behavior, desktop behavior, reduced-motion/focus-visible preservation where applicable, E2E smoke, E2E onboarding, and rollback notes.
## Rollback / hold plan
Hold Phase 37-uiN or switch to research-only if the pilot requires account/auth/profile backend, storage or localStorage writes, route/navigation implementation changes, handler changes, package additions, layout instability at 375px, or identity claims that imply cloud/account features.
## Chosen review decision
PHASE37UIM_STREAK_FIRE_IGNITION_MICRO_MOMENT_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE37UIN_COLLAPSIBLE_AVATAR_HEADER_PILOT_IMPLEMENTATION
## Decision rationale
Phase 37-uiL evidence supports passing the Streak Fire pilot to review completion, and Collapsible Avatar Header is the next highest-impact UI candidate if constrained to visual app-shell/header identity only.
## What Phase 37-uiM supports
Phase 37-uiM supports completed Streak Fire evidence review, a Collapsible Avatar Header Pilot scope gate, exact changed-file allowlist validation, no generated artifacts, no active historical validator chain, and validator support for pr-diff, post-merge-main, and validator-hotfix.
## What Phase 37-uiM does not approve
Phase 37-uiM does not approve BETA_READY, public production readiness, release-readiness upgrade, runtime implementation in Phase 37-uiM, broad UI redesign, Streak Fire expansion, streak calculation changes, daily goal logic changes, completion logic changes, scoring/correctness/scheduler/queue/data changes, route behavior changes, navigation destination changes, event handler changes, button handler changes, form submission changes, disabled state behavior changes, package/dependency changes, storage/backup/restore changes, import/parser changes, scheduler/FSRS changes, sync/cloud/account/auth/backend, profile backend, avatar upload, telemetry/network calls, full Dynamic Canvas Themes, full theme picker, persisted preferences, localStorage writes, Collapsible Avatar Header implementation, or replacement of Phase 37C.
## Next recommended phase
Next recommended phase: Phase 37-uiN — Collapsible Avatar Header Pilot.
