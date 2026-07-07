# APP-H1 — Safe Learning Capsule Contract Seed

## Status token
APP_H1_SAFE_LEARNING_CAPSULE_CONTRACT_SEED_STATUS: PREPARED_SAFE_LEARNING_CAPSULE_CONTRACT_SEED

## Purpose
APP-H1 should define a local-first, privacy-preserving learning capsule contract before any optional Device Bridge, robot, companion, or hybrid integration work.

## Inputs from Phase 37F
Phase 37F kept readiness at `LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED` and selected `APP-H1_SAFE_LEARNING_CAPSULE_CONTRACT` because limited beta evidence gaps remain and future bridge/robot work needs a strict data boundary.

## Scope
APP-H1 should be contract/design only unless a later phase explicitly authorizes implementation. The contract should define allowed redacted learning signals, forbidden raw data, local-only behavior, test requirements, and review gates.

## Forbidden by default
APP-H1 must not implement Device Bridge runtime code, robot transport, firmware, MQTT/WebSocket/Bluetooth/serial integration, cloud sync, accounts, auth, backend services, telemetry, AI API calls, or raw quiz/user data export.

## Privacy boundary
Future bridge-facing data must be coarse and redacted. Allowed candidates may include non-identifying event types, item type category, progress buckets, score buckets, due-count buckets, mastery buckets, and local-only session identifiers.

Forbidden data includes raw prompts, answer text, explanations, imported file contents, user-authored notes, source metadata, exact study history, backup payloads, personal identifiers, account identifiers, and any data that can reconstruct a quiz item.

## Recommended next step
Next recommended phase: APP-H1_SAFE_LEARNING_CAPSULE_CONTRACT.
