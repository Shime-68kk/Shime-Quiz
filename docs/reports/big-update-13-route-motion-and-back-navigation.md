# BIG-UPDATE-13 Route Motion and Back Navigation

## Confirmed Root Cause

The router did not retain the old route. `AppLayout` replaced one pathname-keyed route stage immediately, with Sidebar and BottomNav remaining mounted. The perceived ghost came from two presentation effects running together:

1. The route stage faded and translated while Home cards or Library panels ran separate entrance animations.
2. A moving nav indicator transitioned from the old index while the new `NavLink` active class appeared immediately.

Translucent surfaces and shadows amplified the transient double state.

## Motion Repair

- One top-level `.routeStage` remains.
- Entry is 160ms, opacity plus 2px vertical travel.
- There is no exit animation, overlap wrapper, timer, `requestAnimationFrame`, View Transition API, blur, or navigation delay.
- Home reveal selectors and the route-entered Library tab panel are static.
- Reduced motion disables route animation and translation immediately.
- StudyRoom question changes do not alter pathname and do not remount the stage.

## Active Navigation

Sidebar and BottomNav no longer render moving indicator elements or calculate active indexes. `NavLink` owns the semantic active state, and one static theme-token surface owns its visual state. The old item loses its background immediately; only color has a short 120ms transition. Nested Library paths retain Library active semantics.

## Internal Route History

`InternalRouteHistoryProvider` tracks only normalized in-app pathnames in memory. It ignores duplicate paths, rejects external-like values, excludes Home and hidden routes as return origins, and resets on refresh. It uses React Router's navigation type so only an internal `PUSH` to Home creates a return origin; browser `POP` and route `REPLACE` cannot create a false Back action. The brand identity is a keyboard-focusable Home link.

Home renders `ContextualBackControl` only when the immediate previous path is a valid app destination. The button uses localized text and `navigate(-1)`, preserving browser Back/Forward behavior. Direct Home and refreshed Home render no disabled or dead Back control. Library keeps its existing contextual “Quay lại học liệu” / “Back to materials” action.

## Browser Evidence

- Direct Home: Back count `0`.
- Library → Home: Back count `1`; Back destination `/library`.
- Refreshed Home: Back count `0`.
- App route Sidebar active count: `1`.
- Mobile app route BottomNav active count: `1`.
- Rendered moving indicator elements: `0`.
- Home proof-card animation: `none`.
