# Phase 37-uiB — Dynamic Canvas Theme Token Preview Pilot Evidence
## Status tokens
PHASE37UIB_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT_STATUS: COMPLETED_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT_IMPLEMENTATION
PHASE37UIB_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37UIB_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT_DECISION: READY_FOR_PHASE37UIC_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_EVIDENCE_REVIEW
PHASE37UIB_RUNTIME_SCOPE: DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT_ONLY_ONE_SURFACE_NO_PERSISTENCE
PHASE37UIB_SELECTED_EFFECT: DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT
PHASE37UIC_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED

## Scope
Phase 37-uiB is a Dashboard-only, non-persisted Dynamic Canvas Theme Token Preview Pilot. It adds one passive host class in `src/routes/Dashboard.jsx` and one scoped CSS block in `src/styles/global.css`.

## Inputs from Phase 37-uiA
Phase 37-uiA selected `DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT` and warned that Dynamic Canvas Themes can affect theme state, CSS variables, localStorage, user preferences, and many UI surfaces.

## Dashboard ownership discovery
Static discovery found the Dashboard route in `src/routes/Dashboard.jsx`. Existing visual hooks include `pageStack`, `dashboardCalmTabs`, `dashboardCalmTab`, `dashboardCalmPanel`, and shared `card`/`pageHeader` classes.

## Theme and persistence boundary discovery
Theme persistence remains owned by `src/ui/theme.js` and `src/boot-guard.js`. Token definitions remain in `src/design-system/tokens.css`. None of those files are changed.

## Implementation summary
The implementation adds `phase37uib-dynamic-canvas-token-preview` to the Dashboard top-level `pageStack`. The CSS creates scoped preview tokens, a soft canvas background, stronger panel borders/shadows, tab treatment, and focus-visible reinforcement under that Dashboard class only.

## Changed files
- `.github/workflows/e2e-smoke.yml`
- `src/routes/Dashboard.jsx`
- `src/styles/global.css`
- `tests/unit/dynamicCanvasThemeTokenPreviewPilot.test.jsx`
- `docs/testing/phase37-uib-dynamic-canvas-theme-token-preview-pilot-evidence.md`
- `docs/release/phase37-uib-dynamic-canvas-theme-token-preview-pilot-summary.md`
- `docs/planning/phase37-uic-dynamic-canvas-theme-token-preview-evidence-review-seed.md`
- `scripts/validate-phase37-uib-dynamic-canvas-theme-token-preview-pilot.js`

## Targeted surface
The only runtime surface is Dashboard Calm Home / Dashboard top-level visual surface via `src/routes/Dashboard.jsx`.

## Visual difference summary
Dashboard now has a visible canvas-like wash, subtle grid texture, warmer elevated panels, clearer tab container styling, and tokenized accent rings. No copy, data, route, event handler, or storage behavior is changed.

## One-surface containment review
All new CSS selectors are scoped under `.phase37uib-dynamic-canvas-token-preview`, which exists only in `src/routes/Dashboard.jsx`.

## No persistence and localStorage review
The runtime change does not call `localStorage`, does not write localStorage, does not read or mutate the existing `theme` key, and does not set `data-theme`.

## No global theme system review
No theme picker, persisted preference, account-synced preference, or global theme system was added.

## Accessibility and contrast evidence
Playwright inspection found Dashboard text remains readable against the new scoped panel backgrounds. The treatment uses light panel backgrounds and keeps existing text colors.

## Focus-visible evidence
The Dashboard tab focus-visible selector remains present and gains a scoped accent shadow under the pilot class. Existing global focus-visible rules remain unchanged. Keyboard focus inspection reported a visible `3px` solid outline and focus shadow.

## Reduced-motion evidence
The pilot adds no animation. Existing reduced-motion rules continue to disable Dashboard tab transitions. Playwright reduced-motion inspection reported the Dashboard tab transition duration reduced to `1e-05s`.

## Mobile 375px evidence
Mobile 375px Playwright inspection found no horizontal overflow: `scrollWidth - clientWidth` was `0`. The scoped host reduces margin/padding at `max-width: 560px`.

## Desktop evidence
Desktop Playwright inspection found the Dashboard canvas and panel treatment visibly distinct and contained, with the phase host present exactly once.

## E2E impact
Smoke and onboarding e2e suites passed. The pilot does not alter routes, handlers, storage, or data behavior.

## Forbidden system change review
No storage, backup, restore, import, parser, scheduler, FSRS, sync, backend, auth, telemetry, route behavior, event handler, Study Room correctness, package, dependency, `src/ui/theme.js`, `src/boot-guard.js`, or `src/design-system/tokens.css` changes are included.

## Phase 37C separation review
Phase 37-uiB does not replace Phase 37C Limited Release Readiness Gap Review.

## Claim guardrail review
Phase 37-uiB confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status. Phase 37-uiB does not approve BETA_READY or public production readiness.

## Validation summary
Validation completed: `node scripts/validate-phase37-uib-dynamic-canvas-theme-token-preview-pilot.js` passed, `npm run build` passed with the existing chunk-size warning, `npm run test:unit` passed with 60 files and 2680 tests, `npm run test:e2e:smoke` passed with 7 tests, and `npm run test:e2e:onboarding` passed with 3 tests.

## Risks and follow-up
Risk remains that the single-surface treatment needs more contrast and viewport review before any wider theme work. Phase 37-uiC should review evidence only.

## Decision
PHASE37UIB_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT_DECISION: READY_FOR_PHASE37UIC_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_EVIDENCE_REVIEW

## What Phase 37-uiB supports
Phase 37-uiB supports a one-surface, reversible, non-persisted Dashboard token preview pilot.

## What Phase 37-uiB does not approve
Phase 37-uiB does not approve BETA_READY.
Phase 37-uiB does not approve public production readiness.
Phase 37-uiB does not approve full Dynamic Canvas Themes.
Phase 37-uiB does not approve a full theme picker.
Phase 37-uiB does not approve persisted theme preferences.
Phase 37-uiB does not approve localStorage writes.
Phase 37-uiB does not approve mutation of the existing theme key.
Phase 37-uiB does not approve account-synced preferences.
Phase 37-uiB does not approve a global theme system.
Phase 37-uiB does not approve sync/cloud/account/auth/backend.
Phase 37-uiB does not approve telemetry/network calls.
Phase 37-uiB does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 37-uiB does not approve storage/backup/restore behavior changes.
Phase 37-uiB does not approve import/parser behavior changes.
Phase 37-uiB does not approve scheduler/FSRS behavior changes.
Phase 37-uiB does not approve route behavior changes.
Phase 37-uiB does not approve event handler changes.
Phase 37-uiB does not approve package/dependency changes.
Phase 37-uiB does not approve Study Room correctness/scoring/scheduler/queue/data changes.
Phase 37-uiB does not approve Streak Fire.
Phase 37-uiB does not approve Collapsible Header.
Phase 37-uiB does not approve broad UI redesign.

## Next recommended phase
Next recommended phase: Phase 37-uiC — Dynamic Canvas Theme Token Preview Evidence Review. Phase 37-uiC is evidence review only and is not automatic runtime implementation.
