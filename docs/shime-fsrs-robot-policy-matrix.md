# Shime FSRS Robot Policy Matrix

## Purpose

The FSRS robot policy matrix maps memory-state buckets into robot behavior families and routine suggestions without exposing quiz content. It turns stability, retrievability, difficulty, due pressure, recovery need, and schedule drift into safe expression plans.

## Current Safe Scope

- Implemented as pure logic in `src/shimeIntelligence/fsrsRobotPolicyMatrix.js`.
- No scheduler mutation.
- No robot command sending.
- No transport connection.
- No raw learning data.

## Future Scope

- The matrix can later inform expression-only robot prototypes.
- Wi-Fi LAN, BLE provisioning, and ESP32 capability handshakes must remain separately gated.
- Motion-capable behavior requires a future safety phase.

## Boundaries

- High due pressure becomes a calm nudge, not guilt.
- Low retrievability with high recovery need becomes recovery support, not pressure.
- Repeated lapse becomes gentle encouragement.
- Quiet mode protects rest.
- Classroom mode reduces intensity.
- Privacy unsafe output becomes `calm_error` or neutral behavior.

## Privacy Model

The matrix consumes buckets such as `duePressureBucket`, `retrievabilityBucket`, `recoveryNeedBucket`, and `scheduleDriftBucket`. It does not need prompt text, answers, explanations, source metadata, settings, study history, backup payloads, media, or biometric data.

## Safety Model

All selected policies are dry-run suggestions. Timetable policies include `scheduleMutationAllowed: false`. Robot policies do not send commands.

## Manual QA Guidance

- Check generated matrix evidence in `docs/generated/shime-intelligence/shime-fsrs-robot-policy-matrix.json`.
- Confirm selections are behavior-family names only.
- Confirm there is no raw quiz content in valid outputs.

## Remaining Risks

- Future UI should explain these as suggestions, not commands.
- Future robot expression mapping must preserve motion locks and privacy gates.
