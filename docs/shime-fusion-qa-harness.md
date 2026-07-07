# Shime Fusion QA Harness

## Purpose

The Shime Fusion QA harness creates deterministic dry-run cases for Section D and future expression-only manual QA.

## Cases

- Empty state.
- Normal review day.
- High due pressure.
- Low retrievability.
- Repeated lapse.
- Recovery after struggle.
- High stability gain.
- Session complete.
- Privacy attack.
- Transport unsafe.
- Robot unavailable.
- Classroom safe.
- Quiet mode.
- Phone plus desktop plus robot.
- Display-only robot.
- LED-only robot.
- Motion-capable but locked.

## Safety Model

Every case must remain dry-run and `not_sent`. Expression plans must keep motion locked, avoid forbidden channels, avoid transport connections, avoid schedule mutation, avoid notification/calendar mutation, and avoid raw content.

## Manual QA Guidance

Use the generated artifact `docs/generated/shime-intelligence/shime-fusion-qa-harness.json` as a scenario reference for Section D testing. The artifact is evidence only, not production runtime behavior.
