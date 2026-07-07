# Cognitive Companion Review Report

## Scope

Reviewed public companion APIs, scenario fixtures, planner outputs, reason codes, safety governor decisions, simulator transcript behavior, Device Bridge event contracts, and the external robot reference project read-only.

## Public API Review

- `validateCompanionContext`: rejects forbidden keys recursively and normalizes unknown buckets.
- `reduceLearningSignal`: accepts only supported Device Bridge-style event types and rejects sensitive or malformed input.
- `reduceRobotPresenceSignal`: accepts only coarse presence, velocity, confidence, and sensor health buckets.
- `createCompanionDecision`: returns deterministic intent, tone, urgency, reason codes, and action family.
- `governCompanionDecision`: blocks sensitive context, privacy lock failure, unsafe transport, and downgrades motion by default.
- `planRobotIntent`: maps only to safe robot commands and expression-only mode by default.

## Privacy Findings

PASS:

- No prompt, question text, answer text, explanation, user answer, imported document text, full history, settings, backup, or source metadata enters a valid companion context.
- Valid scenario fixtures contain only coarse/redacted values.
- Planner outputs contain only safe command and reason fields.
- Attack fixtures are clearly invalid and are blocked before policy planning.

## Determinism Findings

PASS:

- No `Date.now`, timers, random values, storage, network, DOM, AI provider calls, or hardware imports are used in `src/companion`.
- Simulator output is deterministic for the same fixtures.

## Hardening Changes

- Unknown and malformed learning events are now rejected instead of silently passing through.
- Disconnected transport is now blocked to neutral by the safety governor.
- Correct-answer streak state is sticky across continued correct answers.
- Simulator no longer injects a forbidden key internally to represent blocked scenarios.

## Conclusion

The kernel is safe for review and simulation. It is not yet wired to live app runtime.
