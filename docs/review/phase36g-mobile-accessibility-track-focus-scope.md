# Phase 36G — Mobile/Accessibility Track Completion and Accessibility Focus Scope Gate

## Status tokens

PHASE36G_MOBILE_ACCESSIBILITY_TRACK_SCOPE_STATUS: COMPLETED_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_AND_FOCUS_SCOPE_GATE

PHASE36G_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE36G_MOBILE_ACCESSIBILITY_TRACK_SCOPE_DECISION: PASS_TO_PHASE36H_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_IMPLEMENTATION

PHASE36G_REVIEW_SCOPE: MOBILE_ACCESSIBILITY_TRACK_COMPLETION_AND_FOCUS_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES

PHASE36G_SELECTED_CANDIDATE: CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT

PHASE36H_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Scope

Phase 36G is a docs/review/research/release/planning/static-validator/CI-only phase. It reviews whether the current mobile/touch track is complete enough for now and scopes exactly one small accessibility focus candidate for Phase 36H.

Phase 36G makes no runtime behavior changes and does not modify source, tests, E2E tests, package files, storage, import, scheduler, sync, backend, auth, telemetry, route behavior, Study Room answer logic, or data models.

## Inputs from Phase 36F

Phase 36F carried forward evidence that Library mobile tabs preserved tab roles, labels, `aria-selected`, `aria-controls`, panel mounting, raw workshop input, `importStatus` visibility, Workshop import reachability, import/parser/storage behavior, 375px no-overflow behavior, focus-visible behavior, reduced-motion behavior, desktop behavior, E2E smoke evidence, and E2E onboarding evidence.

Phase 36F also carried forward the static unit-test evidence boundary and the limitation that physical-device audit and assistive technology review completion are not claimed.

## Why this phase combines completion review and focus scope gate

The recent mobile/touch phases have closed a narrow sequence of safe mobile interaction improvements and evidence reviews. Combining the completion review with a focus scope gate avoids opening a broad runtime phase while still preserving momentum toward the next small accessibility improvement.

## Mobile/touch track completion review

The current mobile/touch track is complete enough for now within the LIMITED_BETA_CANDIDATE boundary. The bottom navigation and Library tabs work have been implemented and reviewed through focused phases, with guardrails around routing, import/parser behavior, storage, scheduler/FSRS, sync/backend/auth, telemetry, packages, and Study Room correctness.

The remaining mobile/touch risks are not urgent enough to justify another broad mobile runtime pass in Phase 36H. The next safest improvement is a narrow focus-visible consistency pilot for existing core interactive controls.

## Candidate next-step comparison table

| Candidate | User value | Expected implementation size | Risk | Accessibility/mobile impact | Decision |
| --- | --- | --- | --- | --- | --- |
| Close current mobile/touch track as sufficient for now | Confirms recent mobile work is enough for the current readiness boundary | None | Low | Preserves current mobile evidence but adds no keyboard polish | Deferred because one small focus candidate remains valuable |
| Core Interactive Focus Visible Consistency Pilot | Improves keyboard trust on existing controls | Small | Low if CSS-only or CSS/class-only | Direct accessibility benefit without business logic changes | Selected for Phase 36H |
| Accessibility Focus Polish Scope Gate with more research | Gives more scoping confidence | Small docs-only | Low | May delay a clearly bounded improvement | Deferred because Phase 36G already scopes the narrow candidate |
| 375px No-Overflow Audit / Fix Candidate | Helps mobile layout confidence | Medium | Medium because fixes may cross surfaces | Useful mobile impact but broader than focus-visible consistency | Deferred |
| Dashboard Calm Home Mobile Density Pilot | Improves dashboard scan comfort | Medium | Medium | Mobile readability impact but touches product layout | Deferred |
| Study Room Mobile Answer Feedback Readability Pilot | Improves study feedback clarity | Medium | Medium to high because Study Room logic must be protected | Useful but near answer feedback and scheduler boundaries | Deferred |
| Elastic Button Compression Mobile Touch Follow-up | Could improve touch response consistency | Small to medium | Medium | Narrow mobile feel impact, less important than keyboard focus | Deferred |
| Dynamic Canvas Themes Design Gate | Explores future visual system work | Docs-only gate | Medium | Indirect accessibility/mobile value | Deferred |
| Streak Fire Ignition Design Gate | Explores future motivation visuals | Docs-only gate | Medium | Indirect accessibility/mobile value | Deferred |
| Collapsible Header Scope Gate | Explores layout density | Docs-only gate | Medium | Mobile density value but routing/layout risk may be higher | Deferred |

## Selected candidate

PHASE36G_SELECTED_CANDIDATE: CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT

Phase 36G selects Core Interactive Focus Visible Consistency Pilot as the single small candidate to seed for Phase 36H.

## Why Core Interactive Focus Visible Consistency Pilot first

Phase 36 mobile/touch work repeatedly depended on focus-visible preservation. A small focus-visible pilot can improve keyboard confidence across existing core interactive controls while avoiding route changes, tab behavior changes, import behavior changes, storage changes, scheduler/FSRS changes, data changes, sync/backend/auth changes, telemetry changes, package changes, and content rewrites.

## Why this is a scope gate, not runtime implementation

Phase 36G only records review findings, chooses one candidate, prepares the Phase 36H seed, registers the validator, and updates CI. It does not implement focus-visible styling, change CSS/source files, alter event handlers, or change runtime behavior.

## Phase 36H allowed files / expected areas

Phase 36H should be a small runtime pilot only. Expected areas are existing core interactive control styling and any existing CSS/class surfaces needed for focus-visible consistency.

Phase 36H should prefer CSS-only or CSS/class-only changes and should target existing core interactive controls only.

## Phase 36H forbidden areas

Phase 36H must not change event handlers, routing, tab state, import behavior, storage, scheduler/FSRS, data, sync/backend/auth, telemetry, package files, dependencies, or page content.

Phase 36H must not implement Dynamic Canvas Themes, Streak Fire, Collapsible Header, broad mobile redesign, broad accessibility redesign, accessibility certification, or assistive technology review completion.

## Accessibility and reduced-motion requirements

Phase 36H must not remove browser default focus semantics. It must preserve reduced-motion behavior and avoid adding motion-dependent focus feedback.

## Mobile and keyboard evidence requirements

Phase 36H must include keyboard tab evidence, focus-visible evidence, 375px mobile evidence, reduced-motion evidence, desktop evidence, E2E smoke evidence, E2E onboarding evidence, and rollback notes.

## Risk assessment

The selected candidate is low risk if it remains limited to existing core interactive controls and CSS-only or CSS/class-only focus-visible consistency. Risk increases if it changes event handling, routing, page content, data behavior, import/storage systems, or broad UI structure.

## Rollback plan for Phase 36H

Rollback should be limited to reverting the Phase 36H focus-visible CSS/class changes and validator updates. It must not require data migrations, storage cleanup, route restoration, import repair, scheduler repair, package changes, or backend cleanup.

## Chosen scope decision

PHASE36G_MOBILE_ACCESSIBILITY_TRACK_SCOPE_DECISION: PASS_TO_PHASE36H_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_IMPLEMENTATION

## Decision rationale

The current mobile/touch track is complete enough for now, and the selected accessibility focus candidate is the smallest useful next runtime pilot. It provides clear user value for keyboard users while staying away from business logic, data, routing, import, storage, scheduler, sync, backend, auth, telemetry, packages, and broad redesign.

## What Phase 36G supports

Phase 36G supports closing the current mobile/touch track as sufficient for now and preparing Phase 36H as a small Core Interactive Focus Visible Consistency Pilot implementation.

Phase 36G supports validator modes `pr-diff`, `post-merge-main`, and `validator-hotfix`.

## What Phase 36G does not approve

Phase 36G confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 36G does not approve BETA_READY.
Phase 36G does not approve public production readiness.
Phase 36G does not approve broad validation or stress-tested readiness.
Phase 36G does not approve guaranteed data-loss prevention.
Phase 36G does not approve storage/backup/restore behavior changes.
Phase 36G does not approve import/parser behavior changes.
Phase 36G does not approve sync/cloud/account/auth/backend.
Phase 36G does not approve telemetry/network calls.
Phase 36G does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 36G does not approve route behavior changes.
Phase 36G does not approve package/dependency changes.
Phase 36G does not approve Study Room correctness/scoring/scheduler/queue/data changes.
Phase 36G does not approve accessibility certification.
Phase 36G does not approve assistive technology review completion.
Phase 36G does not approve Dynamic Canvas Themes implementation.
Phase 36G does not approve Streak Fire.
Phase 36G does not approve Collapsible Header.
Phase 36G does not approve broad UI redesign.
Phase 36G does not approve new runtime UI implementation.
Phase 36G does not approve broader mobile/accessibility runtime changes.

## Next recommended phase

Next recommended phase: Phase 36H — Core Interactive Focus Visible Consistency Pilot Implementation.

Phase 36H is a small runtime pilot and is not approval for broad accessibility redesign.
