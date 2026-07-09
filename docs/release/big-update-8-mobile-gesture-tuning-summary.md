# BIG-UPDATE-8 Mobile Gesture Tuning Summary

Decision status: BIG_UPDATE_8_MOBILE_GESTURE_TUNING_DEFINED

## Summary

BIG-UPDATE-8 adds a deterministic mobile gesture intent model, applies it to StudyRoom question swipe navigation, strengthens the diagonal swipe guard, prioritizes vertical scrolling, softens question transitions, and documents the mobile gesture policy.

## Safety

- Vertical scrolling has priority over ambiguous diagonal gestures.
- Horizontal navigation requires clear intent.
- Transitions are short and non-blocking.
- Reduced motion is supported.
- No artificial delay was added.
- No cloud/backend/network was added.
- No robot transport changed.
- No SM2/FSRS behavior changed.
- FSRS default did not change.
