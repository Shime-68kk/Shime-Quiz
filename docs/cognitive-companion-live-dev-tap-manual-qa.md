# Cognitive Companion Live Dev Tap Manual QA

Date: 2026-06-27 08:16:59 +07

## Scope

This checklist verifies the dev-only live Device Bridge observe mode in the Companion Brain Panel. It does not authorize production companion behavior, robot motion, cloud/AI, telemetry, persistence, or ESP32 command sending.

## Checklist

1. Open the app.
2. Go to Settings.
3. Confirm `Dev-only Companion Brain Panel` is visible.
4. Confirm the fake panel and live tap are both disabled by default.
5. Confirm live status says not subscribed.
6. Click `Enable dev panel`.
7. Run a fake scenario.
8. Confirm fake scenario transcript still works.
9. Click `Enable live dev tap`.
10. Confirm live status says enabled/subscribed.
11. In Device Bridge panel, enable Device Bridge and connect mock transport.
12. Go to StudyRoom.
13. Run a short study session.
14. Return to Settings.
15. Confirm live transcript receives redacted/coarse Device Bridge events.
16. Confirm transcript rows show only step, event type, accepted/rejected, intent, tone, safety, command label, reason codes, and privacy status.
17. Confirm no raw prompt, question, answer, correct answer, explanation, user answer, source metadata, settings, study history, backup payload, imported document text, or raw quiz payload appears.
18. Click `Disable live dev tap`.
19. Run more StudyRoom events.
20. Confirm live transcript no longer updates.
21. Refresh the page.
22. Confirm live tap is disabled again and not subscribed.
23. Confirm no transcript persisted.

## Route Survival Check

1. Open Settings.
2. Click `Bật theo dõi thật`.
3. Navigate to StudyRoom without refreshing the page.
4. Complete a short study session.
5. Navigate through completion actions such as Overview or Library.
6. Return to Settings through normal app navigation.
7. Confirm the live tap is still enabled.
8. Confirm the live transcript contains redacted/coarse session events from the study session.
9. Click `Tắt theo dõi thật`.
10. Run more study actions.
11. Confirm the transcript no longer grows.

Full browser refresh is different from route navigation: refresh should reset the live tap to disabled with an empty transcript.

## PASS Criteria

- Live tap is disabled by default.
- No subscription occurs until explicit enable.
- Live tap observes redacted/coarse Device Bridge events only.
- Live transcript is in-memory and sanitized.
- Disable unsubscribes cleanly.
- Refresh clears state.
- No robot command is sent externally.
- No storage, network, AI, telemetry, or robot motion is added by the companion tap.

## FAIL Criteria

- Live tap auto-subscribes.
- StudyRoom behavior changes.
- Raw quiz content appears.
- Robot commands are sent externally.
- Storage or telemetry appears.
- AI/cloud/backend APIs appear.
- ESP32/WebSocket send behavior is added by the companion tap.
