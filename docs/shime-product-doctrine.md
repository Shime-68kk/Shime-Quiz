# Shime Product Doctrine

## Purpose

Shime is a local-first learning intelligence ecosystem. Shime Robot is the visible product face, while Shime Quiz remains the companion app and local-first learning brain. The product should not be framed as a quiz app with a robot accessory; the robot and app ship as complementary parts of one system.

## Current Safe Scope

- Product doctrine is encoded as pure constants and validators in `src/shimeIntelligence/productDoctrine.js`.
- The app is the canonical source of learning state.
- The robot is an expression, presence, and bridge endpoint.
- FSRS remains the review scheduling authority.
- All robot-facing behavior in this phase is dry-run only.

## Future Scope

- Robot expression can make FSRS memory dynamics visible through light, sound, display, or safe presence.
- Future device behavior must remain downstream of app-approved capsules.
- Optional AI research must remain local-first or privacy-preserving and capsule-limited.

## Boundaries

- The robot must not store canonical learning data.
- The robot must not mutate review schedules.
- The robot must not receive raw prompts, answers, explanations, source data, settings, study history, backups, media, or biometric data.
- Safety policy can block every plan.

## Privacy Model

Only redacted/coarse capsules may cross the app-to-robot boundary. Product doctrine treats local-first privacy as a product principle, not just an implementation choice.

## Safety Model

Safety has highest authority over app, robot, transport, routine, and future AI plans. In unsafe cases the system falls back to neutral, blocked, or dry-run output.

## Manual QA Guidance

- Confirm docs and reports identify Shime Robot as the product face.
- Confirm Shime Quiz remains the local-first brain.
- Confirm generated evidence contains only summaries and coarse buckets.

## Remaining Risks

- Product copy must avoid implying that the robot owns learning state.
- Future UI must not expose robot controls before safety gates and manual QA.
