# Phase 37-uiU — Dynamic Canvas Themes Single-Surface Preview Pilot Evidence

## Status tokens
PHASE37UIU_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT_STATUS: COMPLETED_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT_IMPLEMENTATION
PHASE37UIU_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37UIU_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT_DECISION: READY_FOR_PHASE37UIV_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_EVIDENCE_REVIEW
PHASE37UIU_RUNTIME_SCOPE: DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_ONLY_NO_THEME_STATE_OR_PERSISTENCE_CHANGES
PHASE37UIU_SELECTED_SURFACE: DASHBOARD_DYNAMIC_CANVAS_TOKEN_PREVIEW
PHASE37UIU_SELECTED_EFFECT: DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT
PHASE37UIV_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED

## Scope
Phase 37-uiU implements a non-persistent preview on the selected Dashboard Dynamic Canvas token preview surface only. It does not implement a user preference, global theme, theme picker, route-dependent theme, storage write, or data behavior change.

## Inputs from Phase 37-uiT and UI plan
Phase 37-uiT selected DASHBOARD_DYNAMIC_CANVAS_TOKEN_PREVIEW and passed the next candidate to this runtime preview pilot. The UI plan asked for a visibly modern, calm, single-surface Dynamic Canvas Themes proof without expanding into a theme system.

## Selected Dashboard preview surface discovery
The existing Dashboard preview surface is in src/routes/Dashboard.jsx at the top-level Dashboard page stack. The exact runtime attachment is className="pageStack phase37uib-dynamic-canvas-token-preview phase37uiu-dynamic-canvas-single-surface-preview-pilot" with data-phase37uiu-dynamic-canvas-preview="moss-library". The existing Phase 37-uiB surface was safe because it already isolates the Dashboard Dynamic Canvas token preview.

## Theme-state, persistence, routing, storage, and telemetry boundary discovery
Static discovery found the selected Dashboard surface already used scoped CSS and no local theme state. Phase 37-uiU adds no useState, no context/provider, no localStorage/sessionStorage writes, no document/body/html/root mutation, no route changes, no network calls, and no telemetry calls.

## Implementation summary
Phase 37-uiU adds one passive class and one passive data marker to the existing Dashboard preview wrapper, then scopes a Moss Library visual treatment to that marker in src/styles/global.css. The treatment uses paper-like layering, a calm moss/cream palette, contained editorial glow, and chip/swatch styling for existing Badge and subject mini-list elements only.

## Changed files
- .github/workflows/e2e-smoke.yml
- src/routes/Dashboard.jsx
- src/styles/global.css
- tests/unit/dynamicCanvasThemesSingleSurfacePreviewPilot.test.jsx
- docs/testing/phase37-uiu-dynamic-canvas-themes-single-surface-preview-pilot-evidence.md
- docs/release/phase37-uiu-dynamic-canvas-themes-single-surface-preview-pilot-summary.md
- docs/planning/phase37-uiv-dynamic-canvas-themes-single-surface-evidence-review-seed.md
- scripts/validate-phase37-uiu-dynamic-canvas-themes-single-surface-preview-pilot.js

## Selected surface
DASHBOARD_DYNAMIC_CANVAS_TOKEN_PREVIEW, implemented through the existing Dashboard pageStack preview wrapper in src/routes/Dashboard.jsx.

## Selected preview direction
Moss Library. It was selected because the existing UI already uses calm moss/cream language and this direction can be expressed as local surface styling without theme state.

## User-facing visual difference
The Dashboard preview surface now reads as a contained editorial paper panel with cream paper layers, moss tinting, a contained glow, sharper surface hierarchy, and subtle chip/swatch treatment on existing badges and subject pills.

## Single-surface containment review
All Phase 37-uiU selectors start from .phase37uiu-dynamic-canvas-single-surface-preview-pilot[data-phase37uiu-dynamic-canvas-preview='moss-library']. No App, router, body, html, #root, or global data-theme selector is used for Phase 37-uiU.

## CSS-only theme preview containment review
The preview direction is CSS-only and local to the selected Dashboard wrapper. Local CSS custom properties are declared inside the Phase 37-uiU host only and are not a CSS variable theme engine.

## Runtime attachment review
src/routes/Dashboard.jsx received only a passive class and passive data attribute on the existing Dashboard preview wrapper. No imports, handlers, state ownership, navigation destinations, copy meaning, or data expressions were changed.

## Theme picker and persistence preservation
No theme picker, toggle, preference state, persisted preference, account-synced preference, localStorage write, or sessionStorage write was added.

## Global app theme preservation
No global app theme implementation was added. The preview does not mutate app root classes, global tokens, or global theme state.

## Body/html/root theme preservation
No Phase 37-uiU selector targets body, html, :root, or #root for theme behavior. Existing historical CSS remains outside this phase.

## Routing, handler, and data preservation
Routes, NavLink destinations, active page rendering, tab button handlers, Dashboard data reads, scheduler summaries, scoring, queue logic, streak logic, daily goal logic, and completion logic are unchanged.

## Storage, localStorage, sessionStorage, and telemetry preservation
No storage, backup, restore, import, parser, scheduler, FSRS, sync, auth, backend, telemetry, analytics, fetch, sendBeacon, or network behavior was added or changed.

## Accessibility and contrast evidence
The Moss Library palette keeps dark moss/ink text over cream paper surfaces. Existing controls and cards remain readable against lighter layered surfaces; Phase 37-uiV should verify screenshots and computed contrast before any broader approval.

## Focus-visible evidence
Existing focus-visible rules remain in place. Browser evidence at 375px tabbed to a Dashboard tab and reported outlineStyle solid, outlineWidth 3px, and a visible moss focus halo.

## Reduced-motion evidence
The CSS includes a scoped prefers-reduced-motion block that removes transition effects from the Phase 37-uiU host, cards, header, and tabs.

## Mobile 375px evidence
Browser evidence at 375x812 found the Phase 37-uiU host, width 359px, no horizontal overflow, no localStorage/sessionStorage keys in a fresh context, and no data-theme attribute on html/body/root.

## Desktop evidence
Browser evidence at 1280x900 found the Phase 37-uiU host, width 924px, no horizontal overflow, no localStorage/sessionStorage keys in a fresh context, and no data-theme attribute on html/body/root.

## E2E impact
The implementation changes presentation only. E2E smoke and onboarding remain required validation, and Phase 37-uiV should re-review screenshots.

## Forbidden system change review
Forbidden system areas were not touched: package files, App/main/router files, design-system tokens, storage/backup/restore/import/parser/scheduler/FSRS/sync/auth/backend/telemetry files, and e2e files.

## Phase 37C separation review
Phase 37-uiU does not replace Phase 37C Limited Release Readiness Gap Review. Phase 37C remains separate and no release-readiness upgrade is claimed.

## Claim guardrail review
Phase 37-uiU confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 37-uiU does not approve BETA_READY.
Phase 37-uiU does not approve public production readiness.
Phase 37-uiU does not approve release-readiness upgrade.
Phase 37-uiU does not approve full Dynamic Canvas Themes runtime.
Phase 37-uiU does not approve full theme picker runtime.
Phase 37-uiU does not approve persisted theme preferences.
Phase 37-uiU does not approve account-synced preferences.
Phase 37-uiU does not approve CSS variable theme engine implementation.
Phase 37-uiU does not approve global app theme implementation.
Phase 37-uiU does not approve body/html global theme changes.
Phase 37-uiU does not approve app root theme changes.
Phase 37-uiU does not approve route-dependent theme state.
Phase 37-uiU does not approve storage/backup/restore behavior changes.
Phase 37-uiU does not approve import/parser behavior changes.
Phase 37-uiU does not approve scheduler/FSRS behavior changes.
Phase 37-uiU does not approve scoring/correctness/scheduler/queue/data changes.
Phase 37-uiU does not approve streak calculation changes.
Phase 37-uiU does not approve daily goal logic changes.
Phase 37-uiU does not approve completion logic changes.
Phase 37-uiU does not approve route behavior changes.
Phase 37-uiU does not approve event handler changes.
Phase 37-uiU does not approve NavLink destination changes.
Phase 37-uiU does not approve router configuration changes.
Phase 37-uiU does not approve active page rendering changes.
Phase 37-uiU does not approve package/dependency changes.
Phase 37-uiU does not approve localStorage writes.
Phase 37-uiU does not approve sessionStorage writes.
Phase 37-uiU does not approve sync/cloud/account/auth/backend.
Phase 37-uiU does not approve telemetry/network calls.
Phase 37-uiU does not approve AI-generated themes.
Phase 37-uiU does not replace Phase 37C Limited Release Readiness Gap Review.

## Validation summary
Completed local validation: npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false passed; node scripts/validate-phase37-uiu-dynamic-canvas-themes-single-surface-preview-pilot.js passed in pr-diff mode; npm run build passed with the existing Vite chunk-size warning; npm run test:unit passed with 68 files and 2722 tests; npm run test:e2e:smoke passed with 7 tests; npm run test:e2e:onboarding passed with 3 tests. git diff --check remains required before final artifact creation.

## Risks and follow-up
The remaining risk is visual evidence quality, especially 375px mobile and contrast screenshots. Phase 37-uiV is evidence review only and is not automatic runtime implementation.

## Decision
PHASE37UIU_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT_DECISION: READY_FOR_PHASE37UIV_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_EVIDENCE_REVIEW

## What Phase 37-uiU supports
Phase 37-uiU supports one non-persistent, scoped Moss Library preview treatment on DASHBOARD_DYNAMIC_CANVAS_TOKEN_PREVIEW only.

## What Phase 37-uiU does not approve
Phase 37-uiU does not approve any broader theme system, theme picker, persisted preferences, global app theme, body/html/root mutation, route behavior changes, data behavior changes, storage changes, telemetry/network calls, release readiness, public production readiness, or BETA_READY.

## Next recommended phase
Next recommended phase: Phase 37-uiV — Dynamic Canvas Themes Single-Surface Evidence Review.
