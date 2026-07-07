# Cognitive Companion V2 Invariants

Companion V2 must remain a pure, dry-run decision engine until a later explicit integration phase.

## Required Invariants

- No sensitive keys in output: `prompt`, `question`, `answer`, `correctAnswer`, `explanation`, `userAnswer`, `sourceMetadata`, `settings`, `studyHistory`, `backupPayload`, imported document text, raw quiz payload, camera frames, audio recordings, or biometric identity.
- No raw quiz payload is copied into session state, memory, audit output, replay output, golden snapshots, or readiness reports.
- Motion is false by default. A decision with `shouldMove: true`, `motion: true`, or `motionAllowed: true` fails.
- Robot command families are limited to dry-run safe buckets: `neutral`, `focus`, `encourage`, `celebrate`, `due_review`, and `session_complete`.
- Unsafe transport must resolve to neutral or reconnect-safe behavior.
- Privacy violations must resolve to `calm_error` or `neutral_wait`.
- `classroom_safe` mode must downgrade high-intensity behavior.
- Break suggestions are delayed until repeated wrong answers reach the configured threshold.
- A single correct answer must not trigger `celebrate_big`.
- Repeated intense behavior is treated as a spam risk.
- Every decision and audit entry must include reason codes.
- Audit output must remain dry-run only.
- No external send path is allowed.

## Implementation

The invariant implementation lives in `src/companion/companionInvariants.js`.

Primary exports:

- `assertCompanionDecisionInvariants(decision, options)`
- `checkCompanionOutputForSensitiveData(output, options)`
- `checkCompanionReplayInvariants(replayResult, options)`
- `summarizeInvariantFailures(failures)`

The checks inspect object keys recursively. Allowed event names such as `question_presented`, `answer_correct`, and `answer_wrong` are not treated as sensitive payload keys.
