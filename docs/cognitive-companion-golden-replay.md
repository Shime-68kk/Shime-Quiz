# Cognitive Companion V2 Golden Replay

Golden replay snapshots provide stable summaries for selected Companion V2 scenarios.

## Snapshot Fields

- `scenarioId`
- `eventCount`
- `acceptedCount`
- `rejectedCount`
- `finalIntent`
- `finalCommand`
- `finalSafetyOutcome`
- `privacyScoreBucket`
- `safetyScoreBucket`
- `nonSpamScoreBucket`
- `reasonCodeSummary`
- `invariantStatus`

Snapshots do not include raw transcripts or event payloads.

## Update Policy

Golden snapshots should change only when the V2 policy intentionally changes. If a snapshot changes, review:

- Whether privacy and safety invariants still pass.
- Whether reason codes explain the behavior.
- Whether classroom, disconnected, and sensitive attack behavior remain conservative.
- Whether the change is still dry-run only.

Use `node tools/deviceBridge/companionGoldenReplayReport.mjs` to print the current deterministic report.
