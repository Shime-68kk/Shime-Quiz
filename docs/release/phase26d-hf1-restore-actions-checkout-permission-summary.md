# Phase 26D-HF1 — Restore GitHub Actions Checkout Permission

## Status token

```
PHASE26D_HF1_CHECKOUT_PERMISSION_STATUS: COMPLETED_CI_HOTFIX
PHASE26D_HF1_CHECKOUT_PERMISSION_DECISION: RESTORE_ACTIONS_CHECKOUT_CONTENTS_READ_ONLY
```

## Scope

CI/workflow hotfix only. No runtime source changes. No test changes. No UI changes.

This hotfix restores the top-level `permissions:` block to `.github/workflows/e2e-smoke.yml` so that `actions/checkout@v4` can read the repository during GitHub Actions runs.

## Problem

After Phase 26D merge, the main GitHub Actions workflow failed before checkout:

```
actions/checkout@v4
fatal: could not read Username for 'https://github.com': terminal prompts disabled
```

The workflow had no top-level `permissions:` block. GitHub Actions defaults to write permissions in some organization configurations; the absence of an explicit `contents: read` declaration caused the checkout to fail.

## Fix

Added top-level `permissions:` block with `contents: read` to `.github/workflows/e2e-smoke.yml`, placed between the `on:` trigger block and the `jobs:` block:

```yaml
permissions:
  contents: read
```

This is the minimal safe permission required for `actions/checkout@v4` to clone the repository.

## Active validator update

Updated the active Phase validator step in `.github/workflows/e2e-smoke.yml` to run:

```
node scripts/validate-phase26d-hf1-restore-actions-checkout-permission.js
```

The Phase 26D validator is retained as a comment for historical reference and is not run as a Phase 26D-HF1 merge-blocking gate.

## What this hotfix does not change

- No `src/**` files modified.
- No `tests/**` files modified.
- No `e2e/**` files modified.
- No `package.json` or `package-lock.json` modified.
- No `sw.js` or `boot-guard.js` modified.
- No `docs/adr/**` files modified.
- No Phase 26D implementation files modified.
- No backup/export/restore modules modified.
- No storage drivers modified.
- No dependencies added.
- No runtime behavior changed.
- No telemetry or analytics added.
- No sync/cloud/account/auth/backend changes.
- No BETA_READY claim.
- No local-first hybrid readiness claim.

## Guardrails

- `permissions: contents: read` is the minimum required permission. No broad permissions are added.
- No `continue-on-error: true` is introduced.
- No full `scripts/validate-*.js` glob loop is introduced.
- Phase 26D validator is retained as a comment only and is not run as an active merge-blocking gate.
- Production backup/export/restore behavior remains unchanged.
- Backup file format remains unchanged.
- Restore overwrite behavior remains unchanged.
- Default storage driver remains unchanged.
- No IndexedDB.
- No storage migration.
- No sync/cloud/account/auth/backend.
- No telemetry or analytics.
- No BETA_READY.

## Rollback/removal plan

To roll back this hotfix:
- Remove the `permissions:\n  contents: read` block from `.github/workflows/e2e-smoke.yml`.
- Restore the Phase 26D validator as the active validator step.
- Remove `docs/release/phase26d-hf1-restore-actions-checkout-permission-summary.md`.
- Remove `scripts/validate-phase26d-hf1-restore-actions-checkout-permission.js`.
- No learner data migration or cleanup is required because Phase 26D-HF1 does not migrate data or change backup/export/restore behavior.

## Next recommended phase

Phase 26E — Tester Evidence Review, UI Wiring Re-Decision, Phase 26 Closure, and Phase 27A Planning Seed.
