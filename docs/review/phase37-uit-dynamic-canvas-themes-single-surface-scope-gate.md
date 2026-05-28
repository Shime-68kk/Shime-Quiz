# Phase 37-uiT — Dynamic Canvas Themes Single-Surface Scope Gate
## Status tokens
PHASE37UIT_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE_STATUS: COMPLETED_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE
PHASE37UIT_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37UIT_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE_DECISION: PASS_TO_PHASE37UIU_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT
PHASE37UIT_REVIEW_SCOPE: DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE37UIT_SELECTED_SURFACE: DASHBOARD_DYNAMIC_CANVAS_TOKEN_PREVIEW
PHASE37UIT_SELECTED_CANDIDATE: DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT
PHASE37UIU_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Scope
Phase 37-uiT is docs/review/research/release/planning/static-validator/CI-only. It selects exactly one low-risk Dynamic Canvas Themes candidate surface for a possible later runtime preview pilot and changes no runtime behavior.

## Inputs from Phase 37-uiS and UI plan
Phase 37-uiS passed `PHASE37UIS_DYNAMIC_CANVAS_THEMES_DESIGN_GATE_DECISION: PASS_TO_PHASE37UIT_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE` and selected `PHASE37UIS_SELECTED_CANDIDATE: DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE`. The UI plan keeps Shime Quiz visually ambitious, modern, calm, Vietnamese-first, learner-owned, trustworthy, lightweight, local-first, and respectful of attention.

## UI leadership direction
Dynamic Canvas Themes remain a major modern direction, but the safe sequence is design gate, single-surface scope gate, small runtime preview pilot, then evidence review. Phase 37-uiT keeps visual ambition while protecting routing, storage, scheduler, import, scoring, and learning clarity.

## Scope gate method
The gate inventories possible surfaces, scores each option for visual impact and risk, rejects high-risk surfaces, defines token and persistence boundaries, and chooses one candidate for a future pilot only if rollback and evidence requirements are clear.

## Candidate surface inventory
- Dashboard Dynamic Canvas token preview
- one static preview card
- Library shelf cards
- Study Room answer surface
- Sidebar/header identity surface
- global app root
- body/html global theme
- routing shell
- all pages at once
- localStorage/sessionStorage-backed theme preference
- account-synced theme preference

## Candidate surface comparison table
| Surface option | Visual impact | Implementation risk | Persistence risk | Contrast risk | Routing/data risk | Rollback simplicity | Selected/not selected |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Dashboard Dynamic Canvas token preview | High | Low | Low | Medium | Low | High | Selected |
| one static preview card | Medium | Low | Low | Medium | Low | High | Not selected; less connected to the existing Dashboard concept. |
| Library shelf cards | Medium | Medium | Low | Medium | Low | Medium | Not selected; it risks reopening completed Library card work. |
| Study Room answer surface | High | High | Low | High | High | Medium | Not selected; it is too close to scoring and answer state. |
| Sidebar/header identity surface | Medium | Medium | Low | Medium | Medium | Medium | Not selected; identity surfaces can imply account or profile state. |
| global app root | High | High | Medium | High | Medium | Low | Not selected. |
| body/html global theme | High | High | Medium | High | Medium | Low | Not selected. |
| routing shell | High | High | Medium | High | High | Low | Not selected. |
| all pages at once | High | High | High | High | High | Low | Not selected. |
| localStorage/sessionStorage-backed theme preference | Medium | High | High | Medium | Medium | Low | Not selected. |
| account-synced theme preference | Medium | High | High | Medium | High | Low | Not selected. |

## Selected surface
PHASE37UIT_SELECTED_SURFACE: DASHBOARD_DYNAMIC_CANVAS_TOKEN_PREVIEW.

## Why Dashboard Dynamic Canvas Token Preview is selected
The Dashboard already carries the Dynamic Canvas token preview idea from the Phase 37 modernization arc. It is lower risk than global theme surfaces, Study Room answer state, routing shell work, or persisted preferences because a future pilot can stay contained to one non-persistent Dashboard preview surface.

## Why other surfaces are rejected for now
Static preview cards are viable but lower impact. Library, Study Room, sidebar, and header surfaces overlap with completed pilots or sensitive state. Global app root, body/html, routing shell, all-pages work, persisted preferences, and account-synced preferences are rejected because they raise theme-state, persistence, contrast, routing, data, and rollback risk.

## Theme-token boundaries for selected surface
The selected surface may later use scoped surface color tokens, subtle border tokens, shadow depth tokens, focus ring tokens, non-persistent preview tokens, and reduced-motion-safe accent tokens. It must not use persisted user preference tokens, account-synced preference tokens, localStorage/sessionStorage-backed theme tokens, route-dependent theme state, import/scheduler/scoring state tokens, telemetry-driven personalization, or AI-generated theme tokens.

## Theme-state and persistence restrictions
The future pilot must be non-persistent. It must not become a theme picker, write localStorage or sessionStorage, implement account-synced preferences, mutate global app theme, change body/html or app root theme, add a CSS variable theme engine, or create route-dependent theme state.

## Accessibility, contrast, and readability requirements
Before runtime merge, the pilot must include contrast and readability evidence for Vietnamese text, numeric data, disabled states, hover states, selected states, error states, and focus states. Low-contrast directions remain blocked until evidence proves readability.

## Reduced-motion and animation requirements
The future pilot must be reduced-motion safe by default. Any animation must be decorative, must not communicate required state, and must include reduced-motion evidence.

## Focus-visible requirements
Keyboard focus must remain visible inside and near the selected Dashboard preview surface. Focus-visible evidence must prove the preview tokens do not weaken focus rings or tab-order clarity.

## Mobile 375px and desktop requirements
Evidence must include 375px mobile no-overflow proof and desktop proof. Preview text must fit without overlapping controls, cards, charts, or primary learning content.

## Local-first and privacy guardrails
The selected surface must preserve local-first trust. No sync/cloud/account/auth/backend, telemetry/network calls, backend generation, or external personalization is approved.

## Storage, localStorage, sessionStorage, and telemetry guardrails
Phase 37-uiT does not approve storage/backup/restore behavior changes, localStorage writes, sessionStorage writes, persisted theme preferences, account-synced preferences, telemetry/network calls, or AI-generated themes.

## Routing, handlers, data, scheduler, and import guardrails
Phase 37-uiT does not approve route behavior changes, event handler changes, NavLink destination changes, router configuration changes, active page rendering changes, form submission changes, disabled behavior changes, storage/import/parser behavior changes, scheduler/FSRS behavior changes, scoring/correctness/scheduler/queue/data changes, streak calculation changes, daily goal logic changes, or completion logic changes.

## Future runtime pilot minimum scope
The future pilot must be scoped to one Dashboard preview surface only. It must not touch Study Room scoring/answer state, storage/import/parser/scheduler/data, route behavior, page rendering, packages, telemetry, auth/backend, localStorage, or sessionStorage.

## Future runtime pilot allowed files / expected areas
Expected areas for Phase 37-uiU are the smallest necessary Dashboard preview component or style surface, scoped CSS tokens/classes within the selected preview surface, static evidence docs, release summary, validator, and workflow registration.

## Future runtime pilot forbidden areas
Forbidden areas include global app root, body/html theme, theme picker, persisted preferences, account-synced preferences, CSS variable theme engine, route/navigation implementation, handlers, forms, disabled behavior, Study Room answer state, storage/import/parser/scheduler/FSRS/sync/auth/backend/telemetry code, scoring/queue/data logic, daily goal logic, streak calculation, completion logic, localStorage, sessionStorage, package files, and generated artifacts.

## Rollback and hold plan
If Phase 37-uiU cannot keep the preview non-persistent and single-surface, hold the pilot or pass to research only. Rollback must be a small revert with no storage cleanup, preference migration, account cleanup, route cleanup, backend cleanup, or telemetry cleanup.

## Evidence requirements before runtime merge
Required evidence includes selected-surface screenshots or equivalent review, token inventory, contrast/readability proof, focus-visible proof, reduced-motion proof, 375px mobile proof, desktop proof, storage and persistence non-touch proof, route and handler non-touch proof, no telemetry proof, smoke/onboarding results, and rollback steps.

## Phase 37C release-readiness separation review
Phase 37-uiT does not replace Phase 37C Limited Release Readiness Gap Review and does not approve `BETA_READY`, public production readiness, or release-readiness upgrade.

## Next candidate comparison table
| Candidate | Gate position |
| --- | --- |
| Dynamic Canvas Themes Single-Surface Preview Pilot | Selected; safest next implementation candidate if kept non-persistent and Dashboard-only. |
| Phase 37C Limited Release Readiness Gap Review | Valid separate release-readiness path; not replaced. |
| UI Track Archive And Handoff | Hold; too early while a narrow preview remains available. |
| Dynamic Canvas Themes Research Only | Valid fallback if preview scope cannot stay safe. |
| Full Dynamic Canvas Themes Runtime | Not approved. |
| Full Theme Picker Runtime | Not approved. |
| Persisted Theme Preferences Runtime | Not approved. |
| Account-Synced Theme Preferences | Not approved. |

## Selected candidate
PHASE37UIT_SELECTED_CANDIDATE: DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT.

## Why Dynamic Canvas Themes Single-Surface Preview Pilot next
It is the smallest runtime step that can validate visual direction without introducing a full theme system. The pilot can prove contrast, focus, reduced motion, mobile layout, desktop layout, no persistence, and rollback before any broader theme decision.

## Why this is scope gate, not runtime implementation
Phase 37-uiT only documents the selected surface, candidate, constraints, evidence requirements, and validator. It does not change runtime source, CSS source, tests, E2E specs, packages, route behavior, handlers, data logic, storage, telemetry, theme files, or generated artifacts.

## What Phase 37-uiT supports
Phase 37-uiT supports `pr-diff`, `post-merge-main`, and `validator-hotfix` validation modes; a single selected surface; a single selected next candidate; release summary; Phase 37-uiU implementation seed; workflow registration; and scope gate guardrails.

## What Phase 37-uiT does not approve
Phase 37-uiT does not approve `BETA_READY`, public production readiness, release-readiness upgrade, runtime implementation in Phase 37-uiT, Dynamic Canvas Themes runtime in Phase 37-uiT, full Dynamic Canvas Themes runtime, full theme picker runtime, persisted theme preferences, account-synced preferences, CSS variable theme engine implementation, global app theme implementation, body/html global theme changes, app root theme changes, route-dependent theme state, storage/backup/restore behavior changes, import/parser behavior changes, scheduler/FSRS behavior changes, scoring/correctness/scheduler/queue/data changes, streak calculation changes, daily goal logic changes, completion logic changes, route behavior changes, event handler changes, NavLink destination changes, router configuration changes, active page rendering changes, package/dependency changes, localStorage writes, sessionStorage writes, sync/cloud/account/auth/backend, telemetry/network calls, AI-generated themes, or replacement of Phase 37C.

## Chosen scope gate decision
PHASE37UIT_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE_DECISION: PASS_TO_PHASE37UIU_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT.

## Decision rationale
Dashboard Dynamic Canvas token preview has the best balance of visual impact, low implementation risk, low persistence risk, low routing/data risk, and simple rollback. Broader theme work remains blocked until a single-surface preview produces evidence.

## Next recommended phase
Phase 37-uiU — Dynamic Canvas Themes Single-Surface Preview Pilot.
