# BIG-UPDATE-7 Mobile and Wireless Handoff Summary

Decision status: BIG_UPDATE_7_MOBILE_POLISH_AND_WIRELESS_HANDOFF_PLAN_DEFINED

## Summary

BIG-UPDATE-7 improves mobile StudyRoom layout and defines a robot wireless handoff architecture plan.

## Mobile

- StudyRoom uses more mobile width.
- Long question text has tighter responsive typography.
- Answer options remain touch-friendly but less vertically stretched.
- Subject navigation uses scroll-snap, active subject visibility, and accessible previous/next controls.
- Reduced-motion safety is preserved.

## Robot Handoff

- Normal user flow should not require cable.
- USB/cable remains dev/debug only.
- No real BLE/Wi-Fi is enabled in this phase.
- BLE/Wi-Fi LAN are future candidate transports.
- Current PWA/web recommendation remains manual export plus mock verification.
- Future native mobile wrapper can evaluate BLE or Wi-Fi LAN as primary handoff paths.
- Safe capsule only.
- No raw question/answer/explanation.
- No cloud required.

## Safety

No cloud/backend/network transport, AI/API call, camera/mic, real robot bridge, scheduler change, or FSRS default change is introduced.
