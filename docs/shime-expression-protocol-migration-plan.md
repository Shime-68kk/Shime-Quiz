# Shime Expression Protocol Migration Plan

Safe migration sequence:

1. Protocol review.
2. Host simulator.
3. Log-only firmware parser.
4. Serial/log hardware QA.
5. Fake server bridge.
6. Expression-only OLED/LED.
7. LAN expression-only transport.
8. BLE provisioning.
9. Presence sensor.
10. Future motion safety phase.

Every step requires tests, manual QA, rollback, and a safety gate. Motion remains locked until a separate future safety phase.

