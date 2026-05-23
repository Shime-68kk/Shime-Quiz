# Phase 25I-HF1 — Post-Merge Validator Context Fix — Release Summary

## Status

PHASE25I_HF1_POST_MERGE_VALIDATOR_CONTEXT_STATUS: COMPLETED_CI_STATIC_VALIDATOR_FIX

## What this hotfix fixes

After Phase 25I merged into `main`, GitHub Actions on `main` failed with:

```
FAIL  Exact changed-file set mismatch — missing all six Phase 25I files
```

Root cause: `git diff --name-only origin/main..HEAD` returns an empty list when HEAD is already `origin/main` (post-merge context). The validator treated an empty diff as a missing-file failure.

This hotfix makes the Phase 25I validator context-aware so it passes on post-merge `main` while keeping PR branch enforcement strict.

## Changes

Single file modified:

- `scripts/validate-phase25i-backup-health-thin-read-only-signal-layer.js`

Single doc added:

- `docs/release/phase25i-hf1-post-merge-validator-context-summary.md` (this file)

## Validator behavior after fix

| Context | Diff result | Validator behavior |
|---|---|---|
| Phase 25I PR branch | 6 Phase 25I files | PASS — all files within authorized set |
| Phase 25I-HF1 PR branch | HF1 files only | PASS — all files within authorized set |
| Post-merge `main` (HEAD = origin/main) | empty | PASS — skips changed-file check; content guardrails remain enforced |
| Any branch with unauthorized file | non-empty, unexpected file present | FAIL — unauthorized files changed |
| Non-main branch with empty diff | empty | FAIL — unexpected empty diff on non-main context |

## What this hotfix is

- CI/static-validator-only fix.
- Fixes post-merge `main` validator context detection.
- Does not weaken PR exact changed-file enforcement: any file outside the authorized set on a non-main branch still causes a hard FAIL.

## What this hotfix is not

- This hotfix does not change Phase 25I runtime behavior.
- This hotfix does not change `src/state/backupHealthSignal.js`.
- This hotfix does not change `tests/unit/backupHealthSignal.test.js`.
- This hotfix does not change backup/export/restore behavior.
- This hotfix does not modify storage drivers.
- This hotfix does not modify production UI wiring.
- This hotfix does not add dependencies.
- This hotfix does not add telemetry/analytics.
- This hotfix does not add sync/cloud/account/auth/backend code.
- This hotfix does not approve UI, writes, telemetry, sync/cloud/account/auth/backend, BETA_READY, or broad backup reliability claims.
- This hotfix does not perform storage migration.
- This hotfix does not claim BETA_READY.

## Guardrails preserved from Phase 25I

- Phase 25I does not add production UI for Backup Health display.
- Phase 25I does not wire the signal layer into any production React component or context.
- Phase 25I does not write to localStorage or IndexedDB.
- Phase 25I does not perform data migration.
- Phase 25I does not change backup, export, or restore behavior.
- Phase 25I does not add network requests or telemetry.
- Phase 25I does not claim BETA_READY status for Backup Health UI.
- Phase 25I does not allow UI/routes/settings/library/dashboard files to import the signal layer.
- Phase 25I does not allow backup/restore modules to import the signal layer.
- Phase 25I does not modify package.json or package-lock.json.
- Phase 25I does not add browser-only APIs.
- Phase 25I does not modify the Phase 25G prototype helper.

## Next

Phase 25J — Backup Health Read-Only Integration Design Gate (unchanged by this hotfix).
