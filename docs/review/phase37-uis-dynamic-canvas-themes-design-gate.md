# Phase 37-uiS — Dynamic Canvas Themes Design Gate Only
## Status tokens
PHASE37UIS_DYNAMIC_CANVAS_THEMES_DESIGN_GATE_STATUS: COMPLETED_DYNAMIC_CANVAS_THEMES_DESIGN_GATE_ONLY
PHASE37UIS_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37UIS_DYNAMIC_CANVAS_THEMES_DESIGN_GATE_DECISION: PASS_TO_PHASE37UIT_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE
PHASE37UIS_REVIEW_SCOPE: DYNAMIC_CANVAS_THEMES_DESIGN_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE37UIS_SELECTED_CANDIDATE: DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE
PHASE37UIT_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE_SEED_STATUS: PREPARED_SCOPE_GATE_SEED

## Scope
Phase 37-uiS is docs/design/research/release/planning/static-validator/CI-only. It defines a design gate for Dynamic Canvas Themes and does not change runtime source, CSS source, tests, E2E specs, package files, generated artifacts, route/navigation implementation, handlers, form submission, disabled behavior, scoring, queue, scheduler, data logic, daily goal logic, streak calculation, completion logic, storage, import, parser, FSRS, sync, auth, backend, telemetry, localStorage, sessionStorage, user preferences, theme files, or generated artifacts.

## Inputs from Phase 37-uiR and UI plan
Phase 37-uiR selected `PHASE37UIR_SELECTED_CANDIDATE: DYNAMIC_CANVAS_THEMES_DESIGN_GATE_ONLY` and passed to `PHASE37UIS_DYNAMIC_CANVAS_THEMES_DESIGN_GATE_SEED_STATUS: PREPARED_DESIGN_GATE_SEED`. The UI plan keeps the product visually ambitious, modern, calm, Vietnamese-first, learner-owned, trustworthy, lightweight, local-first, and respectful of attention while avoiding storage, routing, scheduler, import, scoring, and learning-clarity regressions.

## UI leadership direction
Dynamic Canvas Themes remain the most ambitious modern direction after the Phase 37 UI modernization arc. Phase 37-uiS accepts the direction only as a gate: the team may define theme intent, risk boundaries, and evidence requirements, but it must not approve a runtime theme system.

## Design gate method
The gate reviews candidate theme directions, allowed and forbidden token categories, candidate surfaces, state and persistence risks, accessibility obligations, local-first guardrails, rollback requirements, and candidate next phases. The selected next step must be smaller than a runtime implementation and must preserve Phase 37C release-readiness separation.

## Why Dynamic Canvas Themes are high risk
Dynamic Canvas Themes are high risk because they can affect theme state, CSS variables, localStorage/sessionStorage, preferences, persisted or synced settings, contrast across surfaces, reduced-motion behavior, focus visibility, route rendering, screenshots, and rollback complexity. A broad runtime could also create subtle storage, import, scheduler, scoring, or navigation regressions if boundaries are not explicit.

## Current UI modernization baseline
The current baseline includes completed scoped visual work across Dashboard, Library, Study Room, navigation, tactile controls, Streak Fire, collapsible avatar/header identity, and a coherence pass. This baseline supports design exploration, not `BETA_READY`, public production readiness, or a release-readiness upgrade.

## Candidate theme direction inventory
| Theme direction | Gate position |
| --- | --- |
| Calm Study Desk | Valid candidate direction for low-motion, study-focused surfaces. |
| Morning Paper | Valid candidate direction if readability and contrast are proven. |
| Moss Library | Valid candidate direction if color contrast and Vietnamese text clarity are proven. |
| Focus Night Preview | Research candidate only until contrast, focus, and reduced-motion evidence exists. |
| Low-contrast Cream | High-risk candidate; must not proceed without strict readability proof. |
| High-contrast Accessible Variant | Required comparison direction for accessibility evidence. |

## Allowed theme-token categories
- surface color tokens
- subtle border tokens
- shadow depth tokens
- focus ring tokens
- non-persistent preview tokens
- reduced-motion-safe accent tokens

## Forbidden theme-token categories
- persisted user preference tokens
- account-synced preference tokens
- localStorage/sessionStorage-backed theme tokens
- route-dependent theme state
- import/scheduler/scoring state tokens
- telemetry-driven personalization
- AI-generated theme tokens

## Allowed candidate surfaces
- Dashboard Dynamic Canvas token preview only
- one static preview card
- one documentation-only preview table
- one Storybook-like docs surface if it already exists

## Forbidden candidate surfaces
- global app root
- body/html global theme
- routing shell
- all pages at once
- Study Room scoring/answer state
- storage/import/parser/scheduler surfaces
- auth/account/profile surfaces
- localStorage/sessionStorage
- backend/sync/cloud

## Single-surface pilot recommendation
The next candidate should choose at most one low-risk surface before any runtime work. The preferred direction is a static Dashboard Dynamic Canvas token preview or another single, non-persistent visual preview surface that cannot affect answer state, routes, storage, scheduler, import, scoring, account, backend, or telemetry behavior.

## Theme-state and persistence policy
No theme state is approved in Phase 37-uiS. No persisted preferences, account-synced preferences, localStorage writes, sessionStorage writes, route-dependent theme state, CSS variable theme engine, or theme picker runtime is approved. Future preview work must be non-persistent and must reset without storage cleanup.

## Accessibility, contrast, and readability requirements
Any future runtime pilot must provide contrast evidence for Vietnamese text, numeric data, disabled states, focus states, selection states, hover states, and error states. Low-contrast palettes must be treated as failing until proven otherwise. The High-contrast Accessible Variant must remain available as a comparison direction.

## Reduced-motion and animation requirements
Future theme previews must be reduced-motion safe by default. Motion may not communicate required state, may not interfere with study flow, and must have a documented reduced-motion behavior before runtime approval.

## Focus-visible requirements
Focus rings must remain visible across all candidate surfaces and token directions. Focus ring tokens may be explored as non-persistent preview tokens only, and they must not weaken keyboard navigation clarity.

## Mobile 375px and desktop requirements
Future evidence must include 375px mobile no-overflow proof and desktop rendering proof for the selected surface. Text must fit within controls and cards, and theme previews must not hide or overlap primary learning content.

## Local-first and privacy guardrails
Dynamic Canvas Themes must preserve local-first trust. The design gate does not approve network calls, telemetry-driven personalization, backend theme generation, sync/cloud/account/auth/backend changes, or any behavior that moves learner preference state outside the local app without a separate approval path.

## Storage, localStorage, sessionStorage, and telemetry guardrails
Phase 37-uiS does not approve storage/backup/restore behavior changes, localStorage writes, sessionStorage writes, persisted theme preferences, account-synced preferences, telemetry/network calls, or AI-generated themes. Future work must prove that storage, backup, restore, import, parser, database, and prompt behavior remain untouched.

## Routing, handlers, data, scheduler, and import guardrails
Phase 37-uiS does not approve route behavior changes, event handler changes, NavLink destination changes, router configuration changes, active page rendering changes, form submission changes, disabled behavior changes, import/parser behavior changes, scheduler/FSRS behavior changes, scoring/correctness/scheduler/queue/data changes, streak calculation changes, daily goal logic changes, or completion logic changes.

## Rollback and kill-switch design requirements
Any future preview pilot must define how the surface can be removed by reverting a small file set. If runtime work is later approved, it must define a kill-switch or rollback plan before implementation and must not depend on persisted cleanup.

## Evidence requirements before any runtime pilot
Before runtime, the team must provide selected-surface rationale, token inventory, contrast proof, 375px mobile proof, desktop proof, reduced-motion proof, focus-visible proof, storage and persistence non-touch proof, route and handler non-touch proof, no telemetry proof, rollback steps, and screenshots or equivalent review evidence.

## Future runtime pilot minimum scope
The minimum future runtime pilot must be one low-risk surface, non-persistent visual preview only, no theme picker, no localStorage/sessionStorage writes, no account sync, no CSS variable theme engine, no global app theme, no body/html global theme changes, no route changes, no storage/import/parser/scheduler/data changes, no package changes, no telemetry, and no backend work.

## Phase 37C release-readiness separation review
Phase 37-uiS does not replace Phase 37C Limited Release Readiness Gap Review. Phase 37C remains the path for release-readiness review, and this design gate does not approve `BETA_READY`, public production readiness, or release-readiness upgrade.

## Next candidate comparison table
| Candidate | Gate decision |
| --- | --- |
| Dynamic Canvas Themes Single-Surface Scope Gate | Selected; safest next step before any runtime preview. |
| Phase 37C Limited Release Readiness Gap Review | Valid later; still required for release-readiness review. |
| UI Track Archive And Handoff | Hold; the theme direction should be scoped first. |
| Dynamic Canvas Themes Research Only | Valid fallback if the single-surface gate lacks enough evidence. |
| Full Dynamic Canvas Themes Runtime | Not approved. |
| Full Theme Picker Runtime | Not approved. |
| Persisted Theme Preferences Runtime | Not approved. |
| Account-Synced Theme Preferences | Not approved. |

## Selected candidate
PHASE37UIS_SELECTED_CANDIDATE: DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE.

## Why Dynamic Canvas Themes Single-Surface Scope Gate next
A single-surface scope gate keeps the ambitious modern direction alive while preventing a broad theme system from touching high-risk areas. It forces the team to pick one low-risk surface, define token limits, and prove accessibility, persistence, rollback, and evidence requirements before runtime work.

## Why this is design gate, not runtime implementation
Phase 37-uiS documents decisions and guardrails only. It does not implement Dynamic Canvas Themes runtime, full theme picker runtime, persisted theme preferences, account-synced preferences, CSS variable theme engine implementation, global app theme implementation, body/html global theme changes, or any runtime behavior change.

## Phase 37-uiT allowed files / expected areas
Phase 37-uiT should be scope-gate only. Expected areas are docs/review, docs/release, docs/planning, a static validator, and workflow registration. It may choose one candidate surface and define evidence requirements, but it must not implement runtime.

## Phase 37-uiT forbidden areas
Phase 37-uiT must not modify `src/**`, `tests/**`, `e2e/**`, package files, CSS source, theme files, generated artifacts, route/navigation implementation, handlers, form submission, disabled behavior, storage/import/parser/scheduler/FSRS/sync/auth/backend/telemetry code, scoring/queue/scheduler/data logic, daily goal logic, streak calculation, completion logic, localStorage, sessionStorage, backend work, telemetry, or runtime theme implementation.

## What Phase 37-uiS supports
Phase 37-uiS supports `pr-diff`, `post-merge-main`, and `validator-hotfix` validation modes, a Dynamic Canvas Themes design gate, a single-surface scope-gate recommendation, required guardrails, release summary, Phase 37-uiT seed, and CI registration.

## What Phase 37-uiS does not approve
Phase 37-uiS does not approve `BETA_READY`, public production readiness, release-readiness upgrade, runtime implementation in Phase 37-uiS, Dynamic Canvas Themes runtime, full theme picker runtime, persisted theme preferences, account-synced preferences, CSS variable theme engine implementation, global app theme implementation, body/html global theme changes, storage/backup/restore behavior changes, import/parser behavior changes, scheduler/FSRS behavior changes, scoring/correctness/scheduler/queue/data changes, streak calculation changes, daily goal logic changes, completion logic changes, route behavior changes, event handler changes, NavLink destination changes, router configuration changes, active page rendering changes, package/dependency changes, localStorage writes, sessionStorage writes, sync/cloud/account/auth/backend, telemetry/network calls, AI-generated themes, or replacement of Phase 37C.

## Chosen design gate decision
PHASE37UIS_DYNAMIC_CANVAS_THEMES_DESIGN_GATE_DECISION: PASS_TO_PHASE37UIT_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE.

## Decision rationale
Full Dynamic Canvas Themes runtime is too risky because it can touch state, persistence, CSS variables, preferences, contrast, and many surfaces. The single-surface scope gate is the smallest credible next step that preserves visual ambition while requiring explicit safety decisions first.

## Next recommended phase
Phase 37-uiT — Dynamic Canvas Themes Single-Surface Scope Gate.
