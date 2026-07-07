# Cognitive Companion V2 Readiness Gate

The readiness gate combines replay benchmark results, invariant checks, scenario coverage, and privacy/safety summaries.

## Dimensions

- `privacy`
- `safety`
- `determinism`
- `nonSpam`
- `behaviorCoverage`
- `robotCommandSafety`
- `classroomSafety`
- `disconnectedSafety`
- `sensitiveAttackHandling`
- `integrationReadiness`

## Blockers

A V2 build is not ready for dry-run integration if:

- Sensitive keys appear in V2 output.
- Motion is enabled.
- A command outside the allowed dry-run command set appears.
- Audit output is not dry-run only.
- Coverage misses required behavior classes.
- Sensitive attacks are not blocked.
- Disconnected transport does not resolve to neutral/reconnect-safe behavior.

Expected stress warnings, such as repeated event spam lowering non-spam score, do not block integration if privacy and safety invariants still pass.

Use `node tools/deviceBridge/companionV2ReadinessReport.mjs`.
