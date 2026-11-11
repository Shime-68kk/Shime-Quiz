# BIG-UPDATE-14 Arrival and Idle Motion

## Arrival Replay

Arrival state is module-scoped per JavaScript document. A hard load or refresh creates a new document and plays Home arrival. Home to Library to Home within the same SPA document does not replay. Theme, language, and normal rerenders do not replay. No `sessionStorage` or `localStorage` guard is used.

## Arrival Sequence

The existing 1100ms one-shot sequence remains: settle, left-eye wink, localized greeting reveal, one-pixel action gaze, then rest. `animationend` changes only local presentation state; there is no timeout and user actions remain available throughout.

## Idle Motion

Home and StudyRoom opt into a 6.4-second CSS blink with fixed negative phase offsets. Medium and large placements use a 4.8-second, 2px vertical float. Compact marks do not float. There is no JavaScript randomization, timer, cursor tracking, sensor tracking, or continuous `requestAnimationFrame` loop.

## Reduced Motion

`prefers-reduced-motion: reduce` and the component override disable arrival, wink, gaze, blink, float, nod, shake, and transitions. Static face expressions and localized text remain visible, so no meaning depends on motion.
