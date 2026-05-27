# Phase 37-uiN — Collapsible Avatar Header Pilot Evidence

## Status tokens

PHASE37UIN_COLLAPSIBLE_AVATAR_HEADER_PILOT_STATUS: COMPLETED_COLLAPSIBLE_AVATAR_HEADER_PILOT_IMPLEMENTATION

PHASE37UIN_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE37UIN_RUNTIME_SCOPE: COLLAPSIBLE_AVATAR_HEADER_PILOT_ONLY_NO_AUTH_PROFILE_OR_ROUTE_BEHAVIOR_CHANGES

PHASE37UIN_SELECTED_EFFECT: COLLAPSIBLE_AVATAR_HEADER_PILOT

PHASE37UIO_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED

PHASE37UIN_COLLAPSIBLE_AVATAR_HEADER_PILOT_DECISION: READY_FOR_PHASE37UIO_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW

## Scope

Phase 37-uiN is a runtime visual pilot on exactly one safe existing app-shell identity surface. It does not implement account, auth, profile, avatar upload, persisted identity, storage writes, network calls, telemetry, route behavior, or app-shell architecture changes.

## Inputs from Phase 37-uiM and UI plan

Phase 37-uiM selected `COLLAPSIBLE_AVATAR_HEADER_PILOT` and passed this work to Phase 37-uiN. The visual direction is a compact calm avatar/identity chip, modern app-shell/header panel treatment, cream/moss editorial language, subtle border glow, and reduced-motion-safe behavior.

## App-shell/header/avatar discovery

Static inspection found a safe existing app-shell surface in `src/layout/Sidebar.jsx`: the desktop sidebar brand block with `brandMark`, `brandName`, `brandSub`, and `APP_VERSION_LABEL`.

`src/layout/BottomNav.jsx` was inspected and preserved as mobile navigation only. It was not selected for this pilot because it is route-navigation chrome, not a header/avatar/identity surface.

## Selected runtime surface

Selected surface: `src/layout/Sidebar.jsx` brand block.

Selected runtime file: `src/layout/Sidebar.jsx`.

The pilot adds one passive class and one passive data marker:

`phase37uin-collapsible-avatar-header-pilot`

`data-phase37uin-collapsible-avatar-header="sidebar-brand-identity"`

## Implementation summary

The existing sidebar brand block now receives a scoped visual host marker. `src/styles/global.css` adds a cream/moss paper-glass panel, compact static avatar treatment for the existing `S` brand mark, subtle border glow and depth, and reduced-motion fallback.

No actual collapse engine was added because no existing collapsed/compact app-shell state exists. This is a static collapsible-ready compact header treatment.

## Changed files

Runtime and style:

- `src/layout/Sidebar.jsx`
- `src/styles/global.css`

Validation and evidence:

- `.github/workflows/e2e-smoke.yml`
- `tests/unit/collapsibleAvatarHeaderPilot.test.jsx`
- `docs/testing/phase37-uin-collapsible-avatar-header-pilot-evidence.md`
- `docs/release/phase37-uin-collapsible-avatar-header-pilot-summary.md`
- `docs/planning/phase37-uio-collapsible-avatar-header-evidence-review-seed.md`
- `scripts/validate-phase37-uin-collapsible-avatar-header-pilot.js`

## Route and navigation preservation

`NavLink` destinations remain `to={item.path}`. Active index logic remains based on `useLocation`, `navRoutes.findIndex`, and `item.path === location.pathname`.

No route definitions, router configuration, navigation order, labels, icons, click handlers, or active page rendering changed.

## Local-first identity boundaries

The pilot uses only existing static brand text and the existing `S` mark. It does not create a learner profile, account menu, auth claim, uploaded avatar, persisted identity, synced preference, or storage key.

## Storage, network, and telemetry preservation

The changed runtime/CSS does not call `localStorage.setItem`, `sessionStorage.setItem`, `fetch`, `XMLHttpRequest`, or `navigator.sendBeacon`.

## Accessibility and focus evidence

The selected brand block is non-interactive and does not alter keyboard focus order. Existing `.navItem:focus-visible` and `.bottomNav__item:focus-visible` rules remain unchanged.

## Reduced-motion evidence

The Phase 37-uiN CSS includes `@media (prefers-reduced-motion: reduce)` and disables the pilot transition/transform treatment there.

## Mobile 375px evidence

The selected sidebar is hidden at the existing mobile breakpoint, so the mobile bottom nav, safe-area behavior, and route navigation remain unchanged.

## Desktop evidence

On desktop, the existing sidebar brand block becomes a compact premium chip with cream/moss panel depth and a calmer avatar-like brand mark.

## E2E impact

The pilot is visual-only. Smoke and onboarding route behavior should remain unchanged because the pilot does not add handlers, links, storage, network, or route logic.

## Phase 37C separation review

Phase 37-uiN does not upgrade readiness. `LIMITED_BETA_CANDIDATE` remains the highest approved status. Phase 37C Limited Release Readiness Gap Review remains separate.

## Validation summary

Required validation commands:

```bash
npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false
node scripts/validate-phase37-uin-collapsible-avatar-header-pilot.js
npm run build
npm run test:unit
npm run test:e2e:smoke
npm run test:e2e:onboarding
git diff --check
```

## Decision

READY_FOR_PHASE37UIO_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW

## What Phase 37-uiN supports

Phase 37-uiN supports a one-surface visual pilot for the existing sidebar brand identity block, with scoped CSS and no app behavior changes.

## What Phase 37-uiN does not approve

Phase 37-uiN does not approve BETA_READY, public production readiness, release-readiness upgrade, auth/account/profile backend, avatar upload, persisted identity, cloud sync, synced preferences, storage writes, telemetry, route changes, navigation behavior changes, package changes, or replacement of Phase 37C.

## Next recommended phase

Phase 37-uiO — Collapsible Avatar Header Evidence Review.
