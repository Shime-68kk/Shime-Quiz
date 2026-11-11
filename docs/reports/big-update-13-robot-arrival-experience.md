# BIG-UPDATE-13 Robot Arrival Experience

## Experience

The existing `ShimeRobotPresence` visual language now supports an optional arrival modifier. `ShimeArrivalGreeting` composes that reusable robot with visible localized text; it does not duplicate the face implementation.

The first Home appearance in a browser session runs one 1,100ms CSS sequence:

1. Robot fades from opacity 0 and scale 0.98 to its resting pose.
2. Only the left eye closes and opens once with `scaleY`; the right eye remains open.
3. Vietnamese or English greeting copy settles into view.
4. Both eyes shift 1px toward the primary action and return to rest.

The sequence uses no timer, interval, animation frame, canvas, media, animation dependency, pointer tracking, or sensing input. Buttons remain usable from the first frame, focus is not moved, and no overlay is created.

## Session Contract

`src/uiMotion/arrivalSession.js` owns `shime.ui.arrival.v1` in `sessionStorage`. Home reads once during state initialization and marks the session after first commit. A route return, language change, theme change, or rerender does not replay the sequence. A storage-denied browser falls back to document-lifetime memory.

## Copy

- Vietnamese: “Chào mừng bạn đến với Shime.” / “Hôm nay bạn muốn học gì?”
- English: “Welcome to Shime.” / “What would you like to learn today?”

The robot is decorative; meaningful greeting text remains ordinary visible text. Copy does not claim observation, listening, sensing, physical connection, networking, or knowledge of quiz content.

## Reduced Motion

`prefers-reduced-motion: reduce` and the component `reducedMotion` override disable arrival, wink, and gaze. The robot and greeting render immediately at full opacity. Existing focus and color state remain intact.

## Browser Evidence

- First Home: arrival active, session flag `seen`, exactly one wink-class eye.
- Returned Home: arrival inactive.
- Reduced motion: route, robot, and wink computed animation names are `none`; greeting opacity is `1`.
- Vietnamese and English greetings match the selected locale.
