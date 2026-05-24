# Phase 31A — Post-Limited-Beta Roadmap Summary

## Status tokens

```text
PHASE31A_POST_LIMITED_BETA_ROADMAP_STATUS: COMPLETED_POST_LIMITED_BETA_ROADMAP_PLANNING
PHASE31A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE31A_POST_LIMITED_BETA_ROADMAP_DECISION: PASS_TO_PHASE31B_DATA_SAFETY_UX_DESIGN_GATE
PHASE31A_ROADMAP_SCOPE: PLANNING_RESEARCH_ONLY_NO_RUNTIME_SYNC_CLOUD_OR_BACKEND
PHASE31B_DATA_SAFETY_UX_DESIGN_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Scope

Phase 31A is a planning/research/docs/static-validator/CI gate.

Deliverables:
- `docs/planning/phase31a-post-limited-beta-roadmap-data-safety-ux-planning.md`
- `docs/research/phase31a-local-first-ux-research-brief.md`
- `docs/release/phase31a-post-limited-beta-roadmap-summary.md` (this file)
- `docs/planning/phase31b-data-safety-ux-design-gate-seed.md`
- `scripts/validate-phase31a-post-limited-beta-roadmap-data-safety-ux-planning.js`
- `.github/workflows/e2e-smoke.yml` (Phase 31A validator registered)

No runtime source changes. No unit test changes. No e2e changes. No production UI changes. No migrations. No sync/cloud/account/auth/backend.

## Current readiness

Highest approved readiness after Phase 30C and Phase 31A:

```text
LIMITED_BETA_CANDIDATE
```

BETA_READY is not approved. Public production readiness is not approved.

Open evidence gaps inherited from Phase 30C:
1. Restore rehearsal browser lane — BLOCKED.
2. Adapter-awareness browser lane — BLOCKED.
3. Before/after localStorage diff — not collected.
4. 100+ card stress test — not performed.
5. Full rollback/removal execution — navigation-only.
6. Real learner data evidence — generated/test data only.
7. Dynamic route copy audit — static-only in Phase 30A.
8. Legacy release-notes claim — bounded as historical.

All gaps remain open. Phase 31A plans lanes for resolution. Execution requires separate gated phases.

## Roadmap result

Phase 31A produced:

1. **Post-limited-beta roadmap**: 14-lane decision table covering Data Safety Center UX planning, evidence collection, claim/copy cleanup, local-first UX research, and deferred BYOC/WebDAV/P2P research.

2. **Local-first UX research brief**: Six options compared (better backup UX, Data Safety Center, backup reminders, device transfer, BYOC/WebDAV, P2P/WebRTC) with comparative risk table and recommendation.

3. **Phase 31B seed**: Data Safety UX Design Gate seed with required boundaries, candidate UX surfaces, decision options, and forbidden defaults.

4. **Conservative release summary**: This document.

## Chosen decision

```text
PHASE31A_POST_LIMITED_BETA_ROADMAP_DECISION: PASS_TO_PHASE31B_DATA_SAFETY_UX_DESIGN_GATE
```

## Decision rationale

- Planning output is complete for all required lanes.
- Phase 31B Data Safety UX Design Gate is the appropriate next step: design-only, conservative, no runtime implementation.
- Evidence collection lanes are planned but require separate gated phases for execution.
- No forbidden default approvals were made.
- BYOC/WebDAV/P2P remain research-only with no implementation commitment.
- LIMITED_BETA_CANDIDATE remains the highest approved readiness.

## Recommended next lanes

In recommended order:

1. **Phase 31B** — Data Safety UX Design Gate (design-only; no runtime implementation).
2. **Evidence collection phase** (separate gate after Phase 31B or in parallel) — restore rehearsal browser lane, adapter-awareness browser lane, before/after localStorage diff, 100+ card stress test.
3. **Claim/copy cleanup phase** (separate gate) — release-notes contextualization, dynamic copy audit.
4. **Optional** — Opus 4.7 research gate for BYOC/WebDAV/P2P/device-transfer comparison.
5. **Future** — BETA_READY gate after evidence gaps are resolved and claims are clean.

## What is supported

- Post-limited-beta roadmap planning.
- Data Safety Center / Local Backup Center UX planning (design-only).
- Local-first UX research (six options, comparative table, recommendation).
- Evidence collection planning (execution deferred to separate phases).
- Claim/copy cleanup planning (execution deferred to separate phases).
- Phase 31B seed.

## What remains not approved

Phase 31A does not approve BETA_READY.
Phase 31A does not approve public production readiness.
Phase 31A does not approve guaranteed data-loss prevention.
Phase 31A does not approve restore execution.
Phase 31A does not approve production restore rehearsal.
Phase 31A does not approve real learner data restore rehearsal.
Phase 31A does not approve runtime backup/export/restore changes.
Phase 31A does not approve backup file format changes.
Phase 31A does not approve restore overwrite behavior changes.
Phase 31A does not approve storage migration.
Phase 31A does not approve sync/cloud/account/auth/backend.
Phase 31A does not approve telemetry/analytics.
Phase 31A does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 31A does not approve BYOC/WebDAV/P2P/device-transfer implementation.

## Validation summary

Validator: `scripts/validate-phase31a-post-limited-beta-roadmap-data-safety-ux-planning.js`

Checks performed:
- Required docs and validator exist.
- CI registers Phase 31A validator as active gate.
- Prior validators are comments only (no active merge blockers).
- Required tokens present and valid.
- Decision token is one of three allowed values.
- Required headings present in all new docs.
- Roadmap decision table columns and rows present.
- Local-first UX research brief includes comparative table, options, and recommendation.
- Phase 31B seed includes required token, headings, and decision options.
- Phase 31B framed as separate design gate.
- Changed files are exact allowed files only.
- No src/tests/e2e/ADR/RELEASE_NOTES changes.
- No production backup/export/restore/storage driver changes.
- No telemetry/sync/cloud/backend changes.
- Prior phase files not modified.
- Docs do not approve BETA_READY or any forbidden claim.

## Guardrails

- No runtime implementation in Phase 31A.
- No BETA_READY approval.
- No sync/cloud/account/auth/backend approval.
- No BYOC/WebDAV/P2P implementation approval.
- No storage migration.
- No guarantee of data-loss prevention.
- Phase 31B is a separate design gate and is not automatically approved.
- Evidence collection requires a separate, explicitly-gated phase.

## Next recommended phase

Next recommended phase: Phase 31B — Data Safety UX Design Gate.
Phase 31B is a separate design gate and is not automatically approved.
Phase 31A confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 31A does not approve BETA_READY.
Phase 31A does not approve public production readiness.
Phase 31A does not approve guaranteed data-loss prevention.
Phase 31A does not approve restore execution.
Phase 31A does not approve production restore rehearsal.
Phase 31A does not approve real learner data restore rehearsal.
Phase 31A does not approve runtime backup/export/restore changes.
Phase 31A does not approve backup file format changes.
Phase 31A does not approve restore overwrite behavior changes.
Phase 31A does not approve storage migration.
Phase 31A does not approve sync/cloud/account/auth/backend.
Phase 31A does not approve telemetry/analytics.
Phase 31A does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 31A does not approve BYOC/WebDAV/P2P/device-transfer implementation.
