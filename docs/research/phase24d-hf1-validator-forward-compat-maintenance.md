# Phase 24D-HF1 — Validator Forward-Compat Maintenance / Token Cost Reduction

## Status token

PHASE24D_HF1_VALIDATOR_FORWARD_COMPAT_MAINTENANCE_STATUS: COMPLETED_TOOLING_ONLY

## Scope

Phase 24D-HF1 is tooling/docs/static-validator only.
Phase 24D-HF1 does not change runtime behavior.
Phase 24D-HF1 does not modify src, tests, e2e, package files, sw.js, or boot-guard.js.
Phase 24D-HF1 does not implement adapter-aware backup/export/restore.
Phase 24D-HF1 does not implement Phase 24E.
Phase 24D-HF1 does not change backup/export/restore behavior.
Phase 24D-HF1 does not implement IndexedDB.
Phase 24D-HF1 does not implement storage migration.
Phase 24D-HF1 does not add sync, cloud, account, auth, or backend behavior.
Phase 24D-HF1 does not make Shime BETA_READY.

## Inputs

Phase 24D is merged on origin/main with this decision token:
PHASE24D_BACKUP_RESTORE_ADAPTER_AWARENESS_DESIGN_DECISION: PASS_TO_PHASE24E_TEST_ONLY_SCAFFOLD_WITH_ROLLBACK_GATES

Next recommended phase: Phase 24E — Adapter-Aware Backup/Export/Restore Scaffold, default OFF or test-only

## Problem statement

Historical validators use strict changed-file allowlists. Each new phase adds exact docs, release, and validator files, then older validators fail until their forward-compat entries are updated. Repeating those edits by hand burns review time and token budget before the real phase work begins.

## Root cause

The validator chain has many local allowlist styles: arrays of exact paths, Sets seeded by arrays, and later Set.add exact entries. The project intentionally rejects broad changed-file patterns, so new phases require exact historical compatibility entries. Without a reusable helper, Codex repeatedly patches one validator, reruns the chain, finds the next blocker, and repeats.

## Safe forward-compat policy

Historical validator edits must remain exact path entries only.
No broad allowlists are allowed.
Forward-compat entries may cover only the current phase docs, release summary, validator, and approved tooling files.
The helper must report unsupported validator patterns instead of weakening validators.
Phase 24D-HF1 does not weaken validator guardrails.

## Tooling design

scripts/register-phase-forward-compat.js is a local developer tool. It uses only Node built-ins, accepts exact validator paths through --validators, accepts exact forward-compat paths through --paths, defaults to dry-run, and requires --write before changing files. It updates only narrow supported validator shapes:

- arrays of exact forward-compat paths
- Set/add exact forward-compat entries
- existing phase forward-compat marker followed by path entries
- idempotent no-op when entries already exist

Unsupported validator patterns stop the tool with a clear non-zero failure.
Generated compatibility variable names are derived from --phase, so future phases such as PHASE24E use their own phase-specific variable names instead of reusing the Phase 24D-HF1 variable name.

## Dry-run-first workflow

Future phases should use scripts/register-phase-forward-compat.js in dry-run mode before hand-editing validators.
Run a dry-run against exact validator paths and exact new phase paths. Confirm the summary lists only expected exact entries. Dry-run mode must not modify files.

## Write-mode workflow

Use --write only after the dry-run output is reviewed. Write mode should be followed by the targeted phase validators, then one full scripts/validate-*.js chain after targeted validators pass.

## Rollback plan

Revert scripts/register-phase-forward-compat.js.
Revert scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js.
Revert Phase 24D-HF1 docs.
Revert CI registration for Phase 24D-HF1.
Revert only Phase 24D-HF1 exact forward-compat entries from historical validators.
No runtime data migration or cleanup is required because no runtime behavior changes.

## Validation plan

Run npm ci before the full validator chain.
Run the Phase 24D validator.
Run the Phase 24D-HF1 validator.
Run tool dry-run fixture checks.
Run tool write-mode, idempotence, phase-derived variable, wildcard rejection, and unsupported-pattern fixture checks.
Run full scripts/validate-*.js chain once after targeted validators pass.
Run npm run build.
Run npm run test:unit.
Do not rerun the full validator chain after every tiny edit.
Use short log tails only.
Stop and create continuation handoff if token falls below 25%.

## Token reduction policy

Use the helper to batch exact forward-compat entries before the full chain. If the helper reports unsupported validator patterns, stop and report the exact blocker instead of ad-hoc patching many validators. This creates a validator forward-compat maintenance workflow, a dry-run-first forward-compat helper, and a helper intended to reduce future validator churn and token cost.

## Future Phase 24E+ workflow

Future phases should use scripts/register-phase-forward-compat.js in dry-run mode before hand-editing validators.
If the tool reports unsupported validator patterns, stop and report the exact blocker instead of ad-hoc patching many validators.
Historical validator edits must remain exact path entries only.
No broad allowlists are allowed.

## What Phase 24D-HF1 can claim

A validator forward-compat maintenance workflow exists.
A dry-run-first forward-compat helper exists.
The helper rejects broad wildcard allowlists.
The helper is intended to reduce future validator churn and token cost.
Runtime behavior is unchanged.

## What Phase 24D-HF1 must not claim

BETA_READY is not claimed.
local-first hybrid beta ready is not claimed.
production IndexedDB storage exists is not claimed.
StorageAdapter expansion broadly implemented is not claimed.
storage migration complete is not claimed.
backup/export adapter-aware is not claimed.
restore adapter-aware is not claimed.
adapter-aware backup/export/restore implemented is not claimed.
sync exists is not claimed.
cloud sync exists is not claimed.
account/auth/backend exists is not claimed.
production sync ready is not claimed.
guaranteed data-loss prevention is not claimed.
platform backup will preserve user data is not claimed.
Phase 24E implemented is not claimed.
Phase 24E automatically approved is not claimed.
validator guardrails weakened is not claimed.
broad validator allowlists are acceptable is not claimed.

## Guardrails

The helper rejects wildcard or broad paths such as docs/**, docs/research/**, docs/release/**, scripts/validate-*.js, src/**, and tests/**. It does not import app runtime modules. It avoids modifying non-validator runtime files.

## Next recommended phase

Next recommended phase: Phase 24E — Adapter-Aware Backup/Export/Restore Scaffold, default OFF or test-only

Phase 24E is a separate runtime/data-loss-risk gate.
Phase 24D-HF1 only improves validator maintenance and does not approve production adapter-aware backup/export/restore.
