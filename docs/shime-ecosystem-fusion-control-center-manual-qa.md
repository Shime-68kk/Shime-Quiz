# Shime Ecosystem Fusion Control Center Manual QA

## Scope

This checklist validates the dev-only Section D Control Center dry-run. It must remain explicit-click, local, privacy-safe, and non-sending.

## Checklist

1. Open Settings.
2. Confirm the language switch is still visible and reload resets it to Vietnamese.
3. Open the Companion Dev Panel.
4. Confirm Section D is visible with title `D. Hệ sinh thái Shime — chạy thử khớp nối`.
5. Confirm Section D does not run on page load.
6. Click `Chạy khớp nối Shime` before any fake/live transcript exists.
7. Confirm the empty state appears: `Chưa có đủ tín hiệu để chạy khớp nối Shime. Hãy chạy kịch bản giả lập hoặc theo dõi thật trước.`
8. Run fake normal scenario, then click `Chạy khớp nối Shime`.
9. Confirm output shows memory pressure, forgetting risk, recovery need, robot intervention, timetable suggestion, transport recommendation, capsule status, safety status, privacy status, and `dry-run / không gửi`.
10. Run fake struggle scenario, then click `Chạy khớp nối Shime`.
11. Confirm robot intervention remains supportive and does not shame or pressure the learner.
12. Run sensitive attack scenario, then click `Chạy khớp nối Shime`.
13. Confirm output blocks or neutralizes and does not show raw sensitive fields.
14. Enable live DeviceBridge observe-only transcript, produce safe study events, then click `Chạy khớp nối Shime`.
15. Confirm the dry-run output appears and remains label-only.
16. Confirm there is no send button.
17. Confirm no raw JSON is displayed.
18. Confirm no prompt, question, answer, correct answer, explanation, user answer, source metadata, settings, study history, backup payload, imported content, media, or biometric data is visible.
19. Click `Xóa kết quả khớp nối`.
20. Confirm the result clears.
21. Press F5.
22. Confirm the in-memory result resets.
23. Study in StudyRoom.
24. Confirm StudyRoom scoring, history, and review schedule behavior are unaffected.
25. Confirm DeviceBridge mock/real debug behavior is unaffected.

## PASS Criteria

- Section D is visible.
- It runs only after explicit click.
- It displays only privacy-safe labels.
- It never sends robot commands.
- It never mutates schedule, storage, notification, calendar, transport, or learning data.

## FAIL Criteria

- Any raw sensitive payload appears.
- A send/control button appears.
- Section D runs automatically.
- StudyRoom or DeviceBridge behavior changes.
- Storage, network, AI, notification, calendar, robot motion, or schedule mutation is introduced.
