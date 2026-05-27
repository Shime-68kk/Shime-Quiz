# Phase 37-uiP — UI Modernization Coherence Pass Pilot Seed
## Status token
PHASE37UIP_UI_MODERNIZATION_COHERENCE_PASS_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Purpose
Prepare a bounded runtime pilot only if it visually aligns already-modernized Phase 37 surfaces into one coherent product system. The scope is visual coherence across already-modernized Phase 37 surfaces.

## Inputs from Phase 37-uiO
Inputs are the accepted Collapsible Avatar Header evidence review, the modernized surface inventory, and the decision to pass to UI_MODERNIZATION_COHERENCE_PASS_PILOT.

## Runtime candidate
UI Modernization Coherence Pass Pilot.

## User-facing intent
Dashboard, Library, Study Room, Navigation, tactile actions, completion micro-moment, and Sidebar/header identity should feel intentionally related without changing user flows.

## Allowed files / expected areas
Phase 37-uiP may touch CSS and at most two runtime files only if passive class alignment is necessary. Expected areas are already-modernized Phase 37 surfaces, surface language, density, border glow, shadow, and motion timing.

## Forbidden areas
Phase 37-uiP must not redesign flows, change copy, change layout architecture, add themes, add preferences, create a design-system rewrite, alter routing, handlers, storage/import/parser/scheduler/scoring/queue/data/streak/completion logic, auth/profile/backend, telemetry, packages, localStorage/sessionStorage, or Phase 37C boundaries.

## Implementation guidance
Keep changes visual and reversible. Reuse existing tokens/classes where practical, tune only mismatched visual rhythm, and avoid expanding scope into new components or features.

## Responsive and motion requirements
Preserve mobile 375px no-overflow, desktop rendering, sidebar-hidden behavior, and reduced-motion fallback. Align motion timing only for already-present visual treatments.

## Accessibility, contrast, and reduced-motion requirements
Preserve focus-visible, keyboard behavior, semantic navigation, contrast, and reduced-motion behavior.

## Cross-surface coherence restrictions
Coherence means shared restraint and polish, not broad UI redesign. No full Dynamic Canvas Themes, no full theme picker, no persisted theme preferences, and no new preference storage.

## Evidence required
Evidence must cover Dashboard visual refresh / Dynamic Canvas token preview, Library shelf modern collection cards, Study Room modern answer surface, Hybrid sliding navigation indicator, Premium elastic tap compression, Streak Fire ignition micro-moment, Collapsible avatar/header identity surface, mobile 375px, desktop, reduced-motion, focus-visible, contrast, E2E smoke, E2E onboarding, changed files, and rollback.

## Rollback plan
Rollback must remove coherence CSS and any passive class alignment while preserving all existing routes, handlers, storage, data, auth, telemetry, and Phase 37C boundaries.

## Decision options
HOLD_UI_MODERNIZATION_COHERENCE_PASS_PILOT
NEEDS_UI_MODERNIZATION_COHERENCE_PASS_REWORK
PASS_TO_PHASE37UIQ_UI_MODERNIZATION_COHERENCE_EVIDENCE_REVIEW
PASS_TO_UI_COHERENCE_RESEARCH_ONLY

## Forbidden default approvals
The seed does not approve BETA_READY, public production readiness, release-readiness upgrade, broad redesign, theme system work, persisted preferences, route behavior changes, storage writes, auth/profile/backend work, telemetry/network calls, package changes, or replacement of Phase 37C.

## Recommended next step
Implement Phase 37-uiP only as a tightly scoped visual coherence pilot across already-modernized Phase 37 surfaces.
