# BIG-UPDATE-13 Final Report

## 1. Executive Verdict

**PASS.** The implementation is presentation/navigation only, all required automated gates pass, and browser QA confirms the target behavior.

## 2. Verified Baseline

Baseline was clean on `main` at `e73660c8058afb01719480869c274fc570f08f69`. Build passed at 293 modules; full unit passed at 284 files / 3,517 tests; smoke passed 7/7; onboarding passed 3/3; scheduler lab passed 4/4.

## 3. Audit Summary

The required 17-section audit concluded PASS before runtime edits. It confirmed coordinated-radius gaps, interactive clipping, compounded route/page motion, and a moving active indicator as presentation defects with UI-only remedies.

## 4. Radius System

Added shell, panel, card, control, small, and pill semantic roles over unchanged numeric tokens.

## 5. Learning-Material Detail Fix

The detail shell/header now resolve at coordinated `36px/28px` browser-computed radii. Search, filtering, material content, and action callbacks are unchanged.

## 6. Settings Experimental Card Fix

The warning strip now uses warning semantics, a `16px` control radius, balanced padding, and the existing accent. FSRS toggle behavior is unchanged.

## 7. Other Shape Fixes

Settings disclosures and the Library shelf no longer clip focusable descendants. Their inner surfaces use coordinated radii.

## 8. Route Motion Root Cause

There was no retained old route. Nested page reveal effects compounded the keyed route entry, while the moving indicator crossed positions after the new NavLink was already active.

## 9. Route Motion Implementation

One 160ms top-level fade/2px entry remains. There is no exit, overlap wrapper, timer, route delay, blur, or View Transition API. Nested route-entry reveals are neutralized.

## 10. Sidebar Active State

Sidebar uses one static NavLink active surface. The moving indicator and active-index choreography were removed.

## 11. Bottom Navigation Active State

BottomNav uses the same one-surface contract and remains mounted across app route changes.

## 12. Internal Route History

A provider-scoped in-memory boundary tracks normalized, valid app routes only. Duplicate, external-like, browser `POP`, and route `REPLACE` transitions do not create a return origin.

## 13. Home Back Behavior

Direct/refreshed Home hides Back. Library/Settings → Home shows a subtle localized button that calls `navigate(-1)`.

## 14. Deep-Page Back Behavior

Library retains its contextual “Quay lại học liệu” / “Back to materials” action. No generic replacement was made.

## 15. Robot Arrival Ritual

The existing robot performs one non-blocking 1,100ms first-session arrival with one asymmetric wink and a 1px shared gaze.

## 16. Vietnamese Greeting

“Chào mừng bạn đến với Shime.” with “Hôm nay bạn muốn học gì?”

## 17. English Greeting

“Welcome to Shime.” with “What would you like to learn today?”

## 18. Session-Only Behavior

The UI-only key is `shime.ui.arrival.v1`. First Home writes `seen`; route, language, theme, and rerender paths do not replay.

## 19. Reduced Motion

Reduced motion makes route arrival, wink, gaze, and greeting movement static and immediate. Focus and state clarity remain.

## 20. Intent-Led Home

Home asks the localized intent question and keeps one primary Continue action plus Open Library and existing-contract Smart Practice actions. Home reads no learning or scheduler data.

## 21. Theme Matrix

Forest Calm, Forest Dark, Ocean Calm, Sunset Warm, and Lavender Field passed computed radius, active-state, warning-surface, and horizontal-overflow checks.

## 22. Mobile Review

360, 390, 428, 768, 1024, and 1440px browser checks reported no horizontal overflow. Actions stack clearly and the fixed BottomNav remains stable.

## 23. Accessibility Review

Back is a native button with localized name and visible focus. Brand Home is a real link. Arrival steals no focus, creates no live region, and leaves meaningful copy outside decorative robot art. Focusable disclosure content is not clipped.

## 24. Performance Comparison

Baseline → after: JS `990.79 → 993.60 kB` minified and `274.70 → 275.73 kB` gzip; CSS `165.24 → 168.80 kB` minified and `27.74 → 28.28 kB` gzip. Final build time was `1.54s` versus a `4.18s` baseline under non-controlled local conditions, so no speed claim is made. Existing >500kB chunk warning remains. No dependency added.

## 25. Learning Logic Safety

Learning logic unchanged. Home only passes the existing `smart-practice` selection state to StudyRoom; selection and weighting remain owned by StudyRoom services.

## 26. Scheduler Safety

Scheduler behavior unchanged. SM2 remains default, FSRS remains beta-only, and `fsrsCanBeDefault` remains false.

## 27. Safe Capsule Safety

Safe Capsule unchanged. No checksum, payload, export, bridge, or privacy field changed.

## 28. Data Preservation

Import/export, quiz schemas, learning history, settings schema, scheduler records, and storage behavior are unchanged. No network API added.

## 29. Files Modified

Runtime and presentation:

- `package.json`
- `src/components/brand/ShimeArrivalGreeting.jsx`
- `src/components/brand/ShimeRobotPresence.jsx`
- `src/components/navigation/ContextualBackControl.jsx`
- `src/design-system/tokens.css`
- `src/layout/BottomNav.jsx`
- `src/layout/Sidebar.jsx`
- `src/main.jsx`
- `src/navigation/InternalRouteHistoryProvider.jsx`
- `src/navigation/internalRouteHistory.js`
- `src/navigation/useInternalBackNavigation.js`
- `src/routes/Home.jsx`
- `src/styles/global.css`
- `src/uiI18n/translations/en.js`
- `src/uiI18n/translations/vi.js`
- `src/uiMotion/arrivalSession.js`

Validation and evidence:

- `scripts/validate-big-update-13-embodied-navigation.js`
- `tests/unit/bigUpdate13EmbodiedNavigation.test.jsx`
- `tests/unit/ShimeRobotPresence.test.jsx`
- `tests/unit/bottomNavTouchComfortSafeAreaPilot.test.jsx`
- `tests/unit/collapsibleAvatarHeaderPilot.test.jsx`
- `tests/unit/hybridNavigationIndicator.test.jsx`
- `tests/unit/hybridSlidingNavigationIndicatorPilot.test.jsx`
- `tests/unit/motionTokens.test.js`
- Five `docs/reports/big-update-13-*.md` reports.

Historical navigation tests were updated to the explicitly superseding static-active contract.

## 30. Automated Validation

- BIG-UPDATE validators 10/11/12/13: PASS.
- Architecture foundation validator: PASS.
- Production build: PASS, 299 modules.
- Full unit: PASS, 285 files / 3,528 tests.
- Main smoke E2E: PASS, 7/7.
- Onboarding E2E: PASS, 3/3.
- Scheduler lab: PASS, 2 files / 4 tests.
- Targeted scheduler: PASS, 5 files / 16 tests.
- Safe Capsule: PASS, 5 files / 40 tests.
- Mobile: PASS, 3 files / 9 tests.
- BIG-UPDATE-13 targeted: PASS, 1 file / 11 tests.
- Focused compatibility set: PASS, 5 files / 59 tests before the final navigation-type test was added.

## 31. Manual Validation

Real Chromium checks completed for Home, Overview, Library detail, StudyRoom Smart Practice entry, Settings, repeated route switching, direct/returned/refreshed Home, browser Back/Forward, deep-route refresh, contextual material Back, both languages, five themes, six viewports, reduced motion, keyboard focus, and horizontal overflow. A 720px CSS viewport verified the layout equivalent of 200% zoom on a 1440px display.

## 32. Known Limitations

The existing main JS chunk remains above Vite’s 500kB warning threshold. Historical sliding-indicator CSS remains inert for prior audit traceability, but no indicator element is mounted. Browser QA uses repository Playwright because no Browser plugin is installed. The 200% zoom check is layout-equivalent rather than an interactive browser-toolbar zoom measurement.

## 33. Codex Recommendations

Keep future route motion at the single AppLayout stage. Remove inert historical indicator CSS only in a dedicated cleanup with corresponding historical-validator retirement. Do not persist internal Back history across refresh.

## 34. Final PASS / NOT PASS Decision

**PASS.** No dependency added; learning logic unchanged; scheduler behavior unchanged; Safe Capsule unchanged; no network API added; reduced motion is supported. Ready for review; do not commit or push yet.
