# BIG-UPDATE-13 Shape, Motion and Navigation Audit

## 1. Executive Verdict

**PASS to proceed.** The repository is clean at `e73660c8058afb01719480869c274fc570f08f69` on `main`, baseline build and required test suites pass, and the reported defects are isolated to presentation and UI navigation state. No learning, scheduler, import/export, Safe Capsule, device, robot bridge, or persistence behavior needs to change.

## 2. Current Route Rendering Architecture

`src/main.jsx` owns one `BrowserRouter` and a static route tree. `src/App.jsx` resolves focus mode and keeps `AppLayout` mounted. `src/layout/AppLayout.jsx` keeps Sidebar and BottomNav outside a pathname-keyed `.routeStage`, so only the route content remounts. StudyRoom uses the same stage only on route entry; question changes do not change the pathname or stage key.

## 3. Shape and Radius Inventory

`src/design-system/tokens.css` currently exposes numeric roles from `--radius-sm` through `--radius-2xl` plus `--radius-pill`. Components select numeric size names directly, so parent/child intent is not explicit. The safe extension is a semantic alias layer: shell, panel, card, control, small, and pill, preserving all existing dimensions.

## 4. Confirmed Sharp-Corner Defects

- **High:** `.subjectDetailContainer` and `.subjectDetailHeader` both compute to `0px` radius. The detail header therefore does not visually resolve as an inner surface. A coordinated shell/header radius is required without touching selection, search, or study callbacks.
- **High:** `.settingsPanel__warningBlock` computes to `0px` radius inside the rounded experimental section. Its warning background and left accent form sharp corners. A semantic control/card radius and balanced padding are required without changing the FSRS toggle or gate.

## 5. Overflow and Clipping Risks

`.settingsGroup` uses `overflow: clip` while containing focusable disclosure controls. This risks clipped focus outlines and future popovers. It should use coordinated child radii with visible overflow. Large interactive containers must not gain `overflow: hidden` or `overflow: clip`; decorative clipping is not needed for either confirmed defect.

## 6. Route Motion Architecture

`.routeStage` runs `bu12-route-enter` for 180ms with opacity and 4px translation. Home proof cards independently run `shimeHomeEnter`; other page-local panel animations also exist. Navigation indicators transition their transform for 210ms. Reduced-motion CSS disables much of this motion, but the normal path has multiple independently composited arrivals.

## 7. Ghosting Root-Cause Analysis

The old route is not retained in the DOM: the pathname-keyed stage replaces it immediately and no exit wrapper exists. The perceived afterimage is caused by compounded paint/compositing: the new route-stage opacity/transform runs together with nested page/card entry animation, while a separate large navigation indicator translates from the old destination after the new link has already become active. Shadowed and translucent surfaces amplify that transient double state. The repair is one quiet top-level fade, no page-level Home reveal, and a static active navigation surface.

## 8. Sidebar Active-State Analysis

`NavLink` supplies the semantic active item, but Sidebar also renders a separate moving `.primaryNavSlidingIndicator` based on an exact pathname index. During route changes, the active link updates immediately while the old indicator position transitions. This creates two visual layers and does not naturally cover future nested paths. The safe fix is one deterministic static active link surface and a Home brand link for internal return navigation.

## 9. Bottom Navigation Analysis

BottomNav repeats the same moving-indicator architecture. It remains mounted correctly, but the indicator can visually cross destinations while the new item is already active. The same static active-state contract should apply, with exactly one `aria-current` item and no moving background.

## 10. Current Back-Navigation Behavior

Home has no internal-history boundary and no contextual Back control. Library material detail already has the useful localized shelf-specific Back action and must retain it. A provider-scoped, in-memory pathname history can distinguish direct/refreshed Home from an internal Library/Settings-to-Home transition; it must ignore duplicates and use `navigate(-1)` only for a known valid prior route.

## 11. Current Robot Presentation

`ShimeRobotPresence` is a reusable CSS-based component with decorative and informative modes, semantic states, and reduced-motion handling. It already has approved ambient/sparse eye behavior. It can be extended with an arrival modifier on the existing face: one left-eye close/open cycle and a 1px shared gaze, while greeting text remains a separate visible localized element. No duplicate robot implementation is needed.

## 12. i18n Readiness

Vietnamese and English dictionaries already have parity and Home copy is key-based. New keys are limited to Home Back, intent, actions, and arrival greeting/support. No quiz content or imported user text is translated or transformed.

## 13. Theme Risks

Five themes map through semantic `--theme-*` tokens. Fixed surface colors or one-off radii would regress Forest Dark and alternate palettes. The implementation must use theme warning, surface, navigation, focus, and companion tokens and verify computed contrast/overflow across all five themes.

## 14. Accessibility Risks

Risks are clipped focus outlines, a dead Back control on direct Home, motion that remains under reduced motion, and duplicated active navigation cues. Controls must remain native buttons/links with visible labels, 44px targets where practical, no focus stealing, no `aria-live`, no route-content `aria-hidden`, and no motion-only meaning.

## 15. Logic Boundaries

Locked behavior includes StudyRoom answers, library import/export, scheduler adapters and flags, FSRS beta gating, learning/history storage, Safe Capsule/checksum, companion/device bridges, sensing, and all network APIs. Home must not import learning or scheduler data. Smart practice may only use the existing StudyRoom selection-state contract; it must not invent a query-only mode that StudyRoom does not read.

## 16. Safe Implementation Plan

1. Add semantic radius aliases and repair the two confirmed nested surfaces without clipping.
2. Reduce route arrival to one immediate top-level fade and replace moving nav indicators with static active surfaces.
3. Add a UI-only in-memory internal route history provider, a localized conditional Home Back button, and a clickable brand route to Home.
4. Add a session-only arrival flag module, extend the existing robot component for a single asymmetric wink, and refine Home’s compact intent actions using the existing smart-practice navigation state.
5. Add targeted tests, validator, reports, then run the full build/unit/E2E/scheduler/Safe Capsule/mobile matrix and browser-based visual checks.

## 17. PASS / NOT PASS to Proceed

**PASS.** Baseline evidence is green, the worktree is clean, root causes are confirmed, and every implementation batch can remain within presentation and UI-only navigation boundaries.
