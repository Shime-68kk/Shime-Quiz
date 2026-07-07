# Cognitive Companion V2 vs Legacy Comparison

The comparison model compares current Control Center transcript rows with V2 dry-run rows.

## Compared Fields

- Intent family
- Command family
- Safety outcome
- Reason code coverage
- Privacy status
- Non-spam score
- Premium feel score where available

## Status Values

- `v2_safer`: V2 reduces risk or blocks unsafe output.
- `equivalent`: V2 and legacy output are compatible for dry-run review.
- `v2_needs_review`: V2 differs in a way that should be reviewed before integration.
- `v2_blocked`: V2 blocked the row for privacy/safety.

The comparison report never includes raw event payloads.
