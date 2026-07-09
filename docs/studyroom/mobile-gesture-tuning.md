# BIG-UPDATE-8 Mobile Gesture Tuning

## Problem

Horizontal StudyRoom navigation felt too slippery on mobile. Slightly diagonal finger paths could be interpreted as horizontal navigation while the user intended to scroll vertically.

## Gesture Policy

Vertical scrolling has priority over ambiguous diagonal gestures. Horizontal navigation requires clear intent: enough horizontal distance, strong horizontal dominance over vertical movement, and no slow ambiguous drag.

The pure model in `src/studyRoom/mobileGestureIntentModel.js` classifies gestures as:

- `vertical_scroll`
- `horizontal_swipe`
- `tap_or_small_motion`
- `ignore`

## UI Application

StudyRoom question navigation uses the gesture model through `src/studyRoom/studyRoomSwipeGesture.js`. It does not call `preventDefault` on touch move, so normal browser vertical scrolling remains smooth.

Subject-space navigation uses proximity scroll snap instead of aggressive mandatory snapping.

## Transitions

Question transition polish is short and non-blocking. It uses transform/opacity only, around 180ms, and never waits before accepting input.

Reduced motion is supported. When users prefer reduced motion, slide movement is removed.

## Boundaries

No cloud/backend/network was added. No robot transport was changed. No scheduler behavior changed, and FSRS remains non-default.
