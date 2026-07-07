# Beta Phase 28B: Live Tap Route Persistence Fix

Date: 2026-06-27 08:43:54 +07

## Cause

The live companion tap runtime was owned by `CompanionDevPanel` through a component-local ref. The panel cleanup disabled the runtime on unmount. Normal SPA navigation away from Settings unmounted the panel, so the live tap unsubscribed before StudyRoom emitted Device Bridge events.

## Fix Applied

- Moved live tap ownership to a lazy module-level in-memory shared runtime in `src/companion/companionDevTapRuntime.js`.
- Kept the runtime disabled by default.
- Kept subscription gated behind explicit `Bật theo dõi thật`.
- Changed `CompanionDevPanel` unmount to unsubscribe only the UI listener.
- Kept explicit `Tắt theo dõi thật` as the action that disables/unsubscribes the shared live runtime.
- Kept full page refresh reset behavior because the runtime is module memory only and no storage is used.

## Files Changed

- `src/companion/companionDevTapRuntime.js`
- `src/companion/index.js`
- `src/components/settings/CompanionDevPanel.jsx`
- `tests/unit/companionDevTapRuntime.test.js`
- `tests/unit/companionLiveDeviceBridgeTap.test.jsx`
- `docs/cognitive-companion-live-dev-tap-manual-qa.md`
- `docs/beta-phase-28b-live-tap-route-persistence-fix.md`

## Boundary Results

- StudyRoom changed: no.
- DeviceBridge runtime/facade/transport changed: no.
- Firmware changed: no.
- Package or lockfile changed: no.
- Storage added: no.
- Network added: no.
- AI/cloud added: no.
- Robot command sending added: no.
- Live tap enabled by default: no.
- Live tap auto-subscribes on page load: no.
- SPA route navigation survival: yes.
- F5/full reload reset: yes.
- Explicit disable stops observation: yes.

## Validation Results

```bash
npm run build
npm run test:unit
npx vitest run tests/unit/companionLiveDeviceBridgeTap.test.jsx tests/unit/companionLiveDeviceBridgeTapPrivacy.test.js
npx vitest run tests/unit/companionDevTapRuntime.test.js tests/unit/companionDevPanel.test.jsx
```

- Build: PASS.
- Full unit suite: PASS, 121 files / 3037 tests.
- Focused live tap/runtime/panel tests: PASS, 4 files / 31 tests.
- Runtime-only safety scan: PASS, no forbidden storage/network/AI/credential/robot-send matches.
- Broader scan matched only negative assertions in tests for `sendRobotCommand` and `emitStudyEvent`.

## Recommendation

SAFE_TO_RETRY_PHASE_28_LIVE_TAP_MANUAL_QA
