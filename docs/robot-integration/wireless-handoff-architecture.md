# Robot Wireless Handoff Architecture

## Decision Boundary

Normal user flow should not require a cable. USB/cable is dev/debug only.

This phase does not enable real BLE, Wi-Fi LAN, WebSocket, serial, cloud, backend, or robot bridge transport. It only adds a local planning model in `src/deviceBridge/robotHandoffTransportPlan.js`.

## Transport Modes

- `manual_export`: available now, safe baseline, acceptable UX.
- `usb_dev_only`: lab-only dev/debug path, requires cable, poor normal-user UX.
- `ble_candidate`: future wireless candidate, not enabled.
- `wifi_lan_candidate`: future local-network candidate, not enabled.
- `qr_pairing_candidate`: future pairing helper, not enabled.
- `native_wrapper_required`: likely best future mobile BLE/Wi-Fi UX, requires native wrapper research.

## Privacy

All modes are `safe_capsule_only`. No raw question/answer/explanation/imported document text may be sent to the robot.

## Platform Notes

PWA/browser support differs by platform. A native wrapper may be needed for the best mobile BLE experience and more predictable local wireless handoff.

## Future Work

Pairing, local authentication, replay protection, user consent, device naming, and revocation are future work. No cloud is required.
