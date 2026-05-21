# Phase 24D-HF2 — CI Validator Strategy Summary

## Status token

PHASE24D_HF2_CI_VALIDATOR_STRATEGY_STATUS: COMPLETED_CURRENT_PHASE_GATE_RESET

## Scope

Phase 24D-HF2 is CI/docs/static-validator only.
Phase 24D-HF2 does not change runtime behavior.
Phase 24D-HF2 does not implement Phase 24E.
Phase 24D-HF2 does not modify historical validators.
Phase 24D-HF2 does not weaken current-phase validators.
Phase 24D-HF2 separates current PR validation from historical full-chain audit debt.
Phase 24D-HF2 does not make Shime BETA_READY.

## Strategy summary

Current PR validation is separated from historical full-chain validator audit debt.
Current-phase validators remain strict.
Historical full-chain validation remains available as manual/local/scheduled audit guidance.
Runtime behavior is unchanged.

Current PR gate:
- run the Phase 24D-HF2 validator explicitly
- run build and unit tests
- do not rerun Phase 24D validator as a merge-blocking PR gate because Phase 24D validator passed in its own phase
- run current/changed phase validators explicitly
- run relevant prior adjacent validator when needed
- run build/unit tests as appropriate
- do not run the entire historical scripts/validate-*.js chain as a default PR blocker

For Phase 24D-HF2, the default e2e-smoke gate is the Phase 24D-HF2 validator plus build and unit tests. Phase 24D validator passed in its own phase. HF2 does not rerun Phase 24D validator as a merge-blocking PR gate.

Historical audit:
- full scripts/validate-*.js chain remains useful
- run it manually, locally, or on scheduled/maintenance workflows
- full chain failures from historical forward-compat debt should create maintenance tasks, not force unrelated runtime phases to patch old validators
- historical/current-pr-adjacent validators may still be run manually when intentionally debugging validator debt

## Guardrails

- current-phase validators must remain strict
- no broad allowlists
- no runtime/source/package files are allowed in this phase
- no continue-on-error: true is allowed in the e2e-smoke workflow
- Phase 24D-HF2 does not approve production adapter-aware backup/export/restore.
- Phase 24E is a separate runtime/data-loss-risk gate.

## Rollback plan

Revert .github/workflows/e2e-smoke.yml.
Remove docs/research/phase24d-hf2-ci-validator-strategy-reset.md.
Remove docs/release/phase24d-hf2-ci-validator-strategy-summary.md.
Remove scripts/validate-phase24d-hf2-ci-validator-strategy-reset.js.
No runtime data migration or cleanup is required because no runtime behavior changes.

## Validation summary

- npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false
- node scripts/validate-phase24d-hf2-ci-validator-strategy-reset.js
- npm run build
- npm run test:unit
- git apply --check /home/quang/Documents/quiz_beta/phase24d-hf2-ci-validator-strategy-reset.patch

## Next recommended phase

Next recommended phase: Phase 24E — Adapter-Aware Backup/Export/Restore Scaffold, default OFF or test-only

Phase 24E is a separate runtime/data-loss-risk gate.
Phase 24D-HF2 does not approve production adapter-aware backup/export/restore.
