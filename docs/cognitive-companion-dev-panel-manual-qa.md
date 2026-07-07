# Cognitive Companion Dev Panel Manual QA

Date: 2026-06-27 07:55:59 +07

## Scope

This checklist verifies only the dev-only Companion Brain Panel in Settings. It does not validate StudyRoom live events, production Device Bridge runtime, WebSocket transport, ESP32 firmware, robot motion, AI, cloud, storage, telemetry, or backend behavior.

## Checklist

1. Open the app in a browser.
2. Go to Settings.
3. Confirm `Dev-only Companion Brain Panel` is visible.
4. Confirm the warning says fake facade only, no StudyRoom live events, no robot commands sent, no AI/cloud, no persistence, and redacted/coarse signals only.
5. Confirm the panel starts disabled.
6. Click `Run normal session` while disabled.
7. Confirm the scenario is ignored and transcript remains empty.
8. Click `Enable dev panel`.
9. Run `Normal session`.
10. Confirm observed and accepted counts increase.
11. Confirm transcript rows show only step, event type, accepted/rejected, intent, tone, safety outcome, command label, reason codes, and privacy status.
12. Run `Struggle session`.
13. Confirm safe encouragement/focus decisions are visible as labels only.
14. Run `Sensitive attack`.
15. Confirm sensitive attack rows are rejected/blocked.
16. Confirm no unsafe raw values are displayed.
17. Click `Clear transcript`.
18. Confirm counts/transcript clear while the panel remains manually controlled.
19. Click `Disable dev panel`.
20. Refresh the page.
21. Confirm the panel is disabled again.
22. Confirm no transcript persists after refresh.
23. Confirm no auto-enable and no auto-connect behavior occurs.

## PASS Criteria

- Panel starts disabled.
- Scenario playback before enable is ignored.
- Manual enable is required.
- Normal and struggle scenarios show only redacted/coarse decision summaries.
- Sensitive attack is blocked/rejected.
- No raw quiz content or unsafe fixture values are rendered.
- Clear transcript works.
- Refresh does not preserve panel state.
- No network, storage, AI, robot send, or robot motion behavior appears.

## FAIL Criteria

- Panel subscribes to live StudyRoom or production Device Bridge events.
- Panel sends any robot command externally.
- Panel connects to WebSocket/ESP32 or any network API.
- Panel persists state.
- Panel renders unsafe raw values or raw quiz content.
- Build or unit tests fail.

