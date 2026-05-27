# Phase 37-uiN — Collapsible Avatar Header Pilot Seed
## Status token
PHASE37UIN_COLLAPSIBLE_AVATAR_HEADER_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED
## Purpose
Prepare a small runtime visual pilot for Collapsible Avatar Header after Phase 37-uiM accepted Streak Fire evidence and selected the next high-impact app-shell/header identity visual candidate.
## Inputs from Phase 37-uiM
Inputs are the accepted Phase 37-uiL Streak Fire evidence review, selected candidate `COLLAPSIBLE_AVATAR_HEADER_PILOT`, and the restriction that Phase 37-uiN must be a modern app-shell/header identity visual pilot only.
## Runtime candidate
Collapsible Avatar Header Pilot.
## User-facing intent
Make the app shell feel more modern and personal through a compact header/avatar identity visual treatment while preserving the current local-first product model.
## Visual-only app-shell/header identity boundary
The pilot may adjust existing app-shell/header visual hierarchy, compact header treatment, avatar mark presentation, or responsive header polish. It must not create or imply sign-in, account recovery, cloud sync, profile editing, avatar upload, persisted identity, auth/account/profile backend, telemetry, or network behavior.
## Allowed files / expected areas
Phase 37-uiN may touch only the exact runtime style/component/test/evidence files named by its implementation task. Expected areas may include existing app-shell/header surfaces such as `src/layout/AppLayout.jsx`, `src/layout/Sidebar.jsx`, `src/layout/BottomNav.jsx`, `src/components/PageHeader.jsx`, and `src/styles/global.css`, but the Phase 37-uiN task must define an exact allowlist before implementation.
## Forbidden areas
Do not modify auth, account, profile backend, sync, cloud, storage, import, parser, scheduler, FSRS, scoring, queue, study data, daily goal logic, streak calculation, completion logic, telemetry, route/navigation implementation, handlers, form submission, disabled behavior, package files, localStorage, or generated artifacts.
## Implementation guidance
Use existing CSS and component patterns. Keep the pilot small, reversible, and bounded to existing app-shell/header visuals. Do not add dependencies, data fetching, identity forms, upload flows, route destinations, or persisted preferences.
## App-shell, navigation, and route restrictions
Preserve route definitions, route order unless explicitly allowed by the Phase 37-uiN task, NavLink destinations, active page rendering, sidebar/bottom-nav semantics, click handlers, keyboard behavior, and disabled behavior.
## Auth, account, profile, storage, and telemetry restrictions
No sign-in, sign-out, account menu, profile backend, avatar upload, remote user identity, cloud sync, sync prompts, storage writes, localStorage writes, sessionStorage writes, telemetry events, beacons, fetches, or network calls.
## Responsive and motion requirements
The header/avatar treatment must be stable at 375px mobile and desktop widths. It must avoid layout overlap, text clipping, horizontal overflow, and excessive motion. Reduced-motion behavior must remain static or near-static.
## Accessibility and focus requirements
Preserve accessible names, landmarks, heading hierarchy, focus-visible behavior, keyboard navigation, contrast, and target sizes. Decorative avatar visuals should remain decorative unless the existing element already has a semantic role.
## Evidence required
Evidence must show exact changed files, app-shell/header-only visual scope, no auth/account/profile backend, no avatar upload, no identity persistence, no storage/localStorage/telemetry writes, no route/navigation destination changes, no handlers or form submission changes, no disabled behavior changes, no package changes, mobile 375px behavior, desktop behavior, reduced-motion/focus-visible preservation, E2E smoke, E2E onboarding, and rollback notes.
## Rollback plan
Rollback must be a scoped removal of Phase 37-uiN classes/styles/markup/tests/evidence. It must not require data migration, storage cleanup, route changes, account cleanup, or backend rollback.
## Decision options
HOLD_COLLAPSIBLE_AVATAR_HEADER_PILOT
NEEDS_COLLAPSIBLE_AVATAR_HEADER_REWORK
PASS_TO_PHASE37UIO_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW
PASS_TO_COLLAPSIBLE_AVATAR_HEADER_RESEARCH_ONLY
PASS_TO_UI_MODERNIZATION_COHERENCE_REVIEW
## Forbidden default approvals
Phase 37-uiN must not approve BETA_READY, public production readiness, release-readiness upgrade, broad UI redesign, auth/account/profile backend, avatar upload, cloud sync, route behavior changes, navigation destination changes, event handler changes, button handler changes, form submission changes, disabled state behavior changes, package/dependency changes, storage/backup/restore changes, import/parser changes, scheduler/FSRS changes, scoring/correctness/scheduler/queue/data changes, daily goal logic changes, streak calculation changes, completion logic changes, telemetry/network calls, localStorage writes, Streak Fire expansion, full Dynamic Canvas Themes, full theme picker, persisted preferences, or replacement of Phase 37C.
## Recommended next step
Next recommended phase: Phase 37-uiN — Collapsible Avatar Header Pilot implementation, only after exact allowed files are defined.
