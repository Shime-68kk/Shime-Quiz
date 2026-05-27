# Phase 37-uiO — Collapsible Avatar Header Evidence Review Seed

## Status token

PHASE37UIO_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED

## Purpose

Phase 37-uiO should review the Phase 37-uiN Collapsible Avatar Header Pilot evidence before any further runtime UI work.

## Inputs from Phase 37-uiN

Review:

- `src/layout/Sidebar.jsx`
- `src/styles/global.css`
- `tests/unit/collapsibleAvatarHeaderPilot.test.jsx`
- `docs/testing/phase37-uin-collapsible-avatar-header-pilot-evidence.md`
- `docs/release/phase37-uin-collapsible-avatar-header-pilot-summary.md`
- `scripts/validate-phase37-uin-collapsible-avatar-header-pilot.js`

## Review surfaces

Confirm the pilot targets exactly one existing safe app-shell identity surface: the sidebar brand block.

Confirm the mobile bottom nav, route definitions, router configuration, `NavLink` destinations, active page rendering, and navigation click behavior remain unchanged.

## Evidence required

Phase 37-uiO evidence should cover:

- one-surface containment
- passive marker only
- CSS-only visual treatment
- compact calm avatar/identity chip quality
- cream/moss editorial visual language
- subtle border glow and depth
- no account menu
- no auth/profile/backend semantics
- no avatar upload
- no persisted identity
- no storage writes
- no localStorage/sessionStorage/theme key changes
- no telemetry or network calls
- no route/navigation changes
- focus-visible preservation
- reduced-motion fallback
- mobile 375px behavior
- desktop behavior
- E2E smoke/onboarding impact
- Phase 37C separation
- no readiness upgrade

## Non-goals

Phase 37-uiO is evidence review only. It is not automatic runtime implementation and must not approve BETA_READY, public production readiness, release-readiness upgrade, broad app-shell redesign, account/profile/auth backend, avatar upload, storage/profile persistence, route behavior changes, or Phase 37C replacement.

## Decision options

Allowed decisions:

- PASS_PHASE37UIN_COLLAPSIBLE_AVATAR_HEADER_PILOT_EVIDENCE
- NEEDS_COLLAPSIBLE_AVATAR_HEADER_PILOT_FIXES
- HOLD_COLLAPSIBLE_AVATAR_HEADER_PILOT
- PASS_TO_UI_MODERNIZATION_COHERENCE_REVIEW
- PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW

## Forbidden default approvals

Do not approve BETA_READY, public production readiness, release-readiness upgrade, auth/account/profile backend, avatar upload, persisted identity, synced preferences, storage writes, telemetry/network calls, package changes, route behavior changes, or full Dynamic Canvas Themes.

## Recommended next step

Run Phase 37-uiO as an evidence review lane before selecting any next runtime UI pilot.
