# Cognitive Companion V2 Evidence Benchmark

The Phase 33 evidence benchmark creates reviewable artifacts from a deterministic 1000+ scenario run.

## Design

- Includes curated replay scenarios.
- Generates at least 1000 deterministic adversarial scenarios.
- Adds at least 100 invalid attack scenarios.
- Runs V2 replay benchmark, invariants, coverage, readiness, golden snapshots, and audit sampling.
- Writes only sanitized summaries and snapshots.

## Generated Artifacts

- `docs/generated/companion-v2-evidence-benchmark.md`
- `docs/generated/companion-v2-evidence-summary.json`
- `docs/generated/companion-v2-golden-snapshots.json`
- `docs/generated/companion-v2-coverage-report.json`
- `docs/generated/companion-v2-readiness-report.json`
- `docs/generated/companion-v2-vs-legacy-comparison.json`
- `docs/generated/companion-v2-decision-audit-sample.json`

## Pass/Fail Gates

The benchmark fails if scenario count is below 1000, attack scenario count is below 100, readiness fails, coverage is below 100%, invariant failures appear, dry-run output is false, or any generated artifact contains forbidden sensitive data.
