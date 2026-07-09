# FSRS Beta Readiness Evidence

Status: FSRS_BETA_EVIDENCE_COLLECTING

## Decision

- SM2 remains the stable default.
- FSRS remains beta and opt-in.
- `fsrsCanBeDefault` remains false.
- FSRS strength must be evaluated by evidence, not assumption.

## Readiness Gate

The gate in `src/scheduler/fsrsReadinessGate.js` checks:

- deterministic output pass
- due count sanity pass
- workload sanity pass
- no negative interval pass
- no impossible next review date pass
- rollback available pass
- backup metadata available pass
- import/export compatibility pass
- StudyRoom integration safe pass
- user opt-in required pass

Even when all gates pass, default approval is still false for this phase.

## Rollback

Rollback is mandatory before beta opt-in. `src/scheduler/schedulerBetaPreferenceModel.js` and `src/scheduler/schedulerBackupMetadata.js` keep SM2 as the rollback scheduler.

## Privacy

The scheduler contract does not require raw question text, answer text, explanation text, source document text, or raw review logs. No cloud, AI, external service, or backend behavior is added.

## Evidence Gap

FSRS still needs longer-running real-user evidence, explicit user experience review, and migration review before any future default-scheduler decision.
