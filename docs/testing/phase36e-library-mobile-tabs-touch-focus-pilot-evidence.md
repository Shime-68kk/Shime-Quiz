# Phase 36E — Library Mobile Tabs Touch and Focus Pilot Evidence

## Status tokens

PHASE36E_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_STATUS: COMPLETED_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_IMPLEMENTATION

PHASE36E_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE36E_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_DECISION: READY_FOR_PHASE36F_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_EVIDENCE_REVIEW

PHASE36E_RUNTIME_SCOPE: LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_ONLY_NO_IMPORT_OR_STORAGE_BEHAVIOR_CHANGES

PHASE36E_SELECTED_EFFECT: LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT

## Scope

Phase 36E implements only the Library mobile tabs touch and focus pilot selected by Phase 36D. The runtime change is limited to the existing Library tab switcher class and CSS.

Selected runtime file: src/routes/Library.jsx

## Inputs from Phase 36D

Phase 36D selected `LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT` and passed the implementation scope to Phase 36E.

## Library tab ownership discovery

Static inspection found the Library tabs in `src/routes/Library.jsx`. The existing classes are `.libraryTabList`, `.libraryTab`, `.libraryTab--active`, and `.libraryTabPanel`. The existing CSS lives in `src/styles/global.css`. The existing Phase 35B unit coverage is `tests/unit/libraryBookshelfTabs.test.jsx`.

`importStatus` is rendered after the workshop panel block, outside both panels. Both panels remain mounted and use `hidden={libraryTab !== 'shelf'}` and `hidden={libraryTab !== 'workshop'}` for inactive state.

## Implementation summary

The tablist keeps `libraryTabList` and adds `phase36e-library-tabs-touch-pilot`. CSS scoped to that pilot class increases tab min height, keeps a 44px minimum target width, improves focus-visible outline clarity, allows mobile wrapping, and keeps reduced-motion transition suppression.

## Changed files

- `.github/workflows/e2e-smoke.yml`
- `src/routes/Library.jsx`
- `src/styles/global.css`
- `tests/unit/libraryMobileTabsTouchFocusPilot.test.jsx`
- `docs/testing/phase36e-library-mobile-tabs-touch-focus-pilot-evidence.md`
- `docs/release/phase36e-library-mobile-tabs-touch-focus-pilot-summary.md`
- `docs/planning/phase36f-library-mobile-tabs-touch-focus-pilot-evidence-review-seed.md`
- `scripts/validate-phase36e-library-mobile-tabs-touch-focus-pilot.js`

## Targeted Library tab surfaces

Only the Library tab switcher is targeted: the `role="tablist"` wrapper and its two existing `.libraryTab` buttons.

## Tab semantics preservation

Static and browser evidence confirmed preservation of tab roles, labels, `aria-selected`, and `aria-controls`. The visible labels remain `Kệ sách của tôi` and `Xưởng nạp tài liệu`.

## Import and storage behavior preservation

No import tools behavior, parser logic, file import behavior, backup/restore behavior, schema behavior, demo sample behavior, EduGen/draft workshop logic, stored data, sync/backend/auth/telemetry behavior, routes/navigation, or package files were changed.

## Panel mounting and raw input preservation

Both panels remain in `src/routes/Library.jsx` and continue to use the existing `hidden` inactive state. Raw input preservation remains in the Library component through `textDraft` and `aiPromptSource` state.

## ImportStatus visibility preservation

`importStatus` remains outside the shelf and workshop panels, after the workshop panel closing block.

## 375px mobile evidence

Playwright verification at 375px confirmed no horizontal overflow: `scrollWidth=375`, `clientWidth=375`, `noOverflow=true`.

## Touch comfort and tap target evidence

Playwright measured both Library tabs at 375px. `Kệ sách của tôi` measured `172x48`; `Xưởng nạp tài liệu` measured `172x48`. Both tabs used `touch-action: manipulation`, `white-space: normal`, and `overflow-wrap: anywhere`, with no clipping observed.

## Keyboard and focus-visible evidence

Playwright focused the tab controls with keyboard navigation. The active focused tab retained visible outline styling from `.phase36e-library-tabs-touch-pilot .libraryTab:focus-visible`: `outline-style=solid`, `outline-width=3px`, `outline-offset=3px`.

## Reduced-motion evidence

CSS inspection confirms the existing reduced-motion block still disables `.libraryTab` transitions, and Phase 36E explicitly includes `.phase36e-library-tabs-touch-pilot .libraryTab { transition: none; }` inside the same media query. Playwright with reduced motion reported `transition-property=none`.

## Desktop non-impact review

Desktop browser verification at 1280px confirmed the Library route still renders the same two tabs and content areas with no horizontal overflow. The desktop tab measurements were `132x48` and `158x48`. The pilot class changes spacing and focus/touch sizing only for the existing tabs and does not alter desktop navigation, panels, cards, or import controls.

## E2E impact

E2E specs were not modified. `npm run test:e2e:smoke` passed 7 tests. `npm run test:e2e:onboarding` passed 3 tests.

## Forbidden system change review

The changed-file set avoids package files, E2E specs, storage/backup/restore/import/parser/database/scheduler/FSRS/sync/auth/backend/telemetry code, Study Room, BottomNav, Sidebar, Dashboard, app routing, and generated artifacts.

## Claim guardrail review

Phase 36E confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status. Phase 36E does not approve BETA_READY.

## Validation summary

Validation completed:

- `npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false` passed.
- `node scripts/validate-phase36e-library-mobile-tabs-touch-focus-pilot.js` passed in `pr-diff` mode.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run test:unit` passed: 58 files, 2671 tests.
- `npm run test:e2e:smoke` passed: 7 tests.
- `npm run test:e2e:onboarding` passed: 3 tests.

## Risks and follow-up

This is a narrow source/CSS pilot and not a full accessibility audit. Phase 36F should review the evidence before any further runtime implementation.

## Decision

PHASE36E_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_DECISION: READY_FOR_PHASE36F_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_EVIDENCE_REVIEW

## What Phase 36E supports

Phase 36E supports a small Library tab touch comfort and focus-visible pilot only. Next recommended phase: Phase 36F — Library Mobile Tabs Touch and Focus Pilot Evidence Review.

Phase 36F is an evidence review and is not automatic next runtime implementation.

## What Phase 36E does not approve

Phase 36E confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.

Phase 36E does not approve BETA_READY.
Phase 36E does not approve public production readiness.
Phase 36E does not approve broad validation or stress-tested readiness.
Phase 36E does not approve guaranteed data-loss prevention.
Phase 36E does not approve storage/backup/restore behavior changes.
Phase 36E does not approve import/parser behavior changes.
Phase 36E does not approve file import behavior changes.
Phase 36E does not approve schema behavior changes.
Phase 36E does not approve demo sample behavior changes.
Phase 36E does not approve EduGen/draft workshop logic changes.
Phase 36E does not approve stored data changes.
Phase 36E does not approve sync/cloud/account/auth/backend.
Phase 36E does not approve telemetry/network calls.
Phase 36E does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 36E does not approve route behavior changes.
Phase 36E does not approve package/dependency changes.
Phase 36E does not approve Study Room correctness/scoring/scheduler/queue/data changes.
Phase 36E does not approve Dynamic Canvas Themes implementation.
Phase 36E does not approve Streak Fire.
Phase 36E does not approve Collapsible Header.
Phase 36E does not approve broad UI redesign.
Phase 36E does not approve broader mobile runtime changes.
