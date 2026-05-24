# Phase 31J — Data Safety UX Visibility Re-Decision Seed

## Status token

```text
PHASE31J_DATA_SAFETY_UX_VISIBILITY_REDECISION_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Purpose

Phase 31J is the visibility re-decision gate following Phase 31I browser evidence. Phase 31I confirmed that the Phase 31G internal visibility implementation behaves correctly: default-off in production, internal opt-in via env flag, inert placeholder actions, no side effects.

Phase 31J must decide whether and how to expand visibility — from internal-only to limited ordinary-user visibility or limited settings visibility — or to hold at the current internal-only state.

Phase 31J is a separate gate. It is not automatically approved by Phase 31I.

## Inputs from Phase 31I

Phase 31I established:
- Direct browser evidence: all 11 lanes PASS
- Decision: `PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_DECISION: PASS_INTERNAL_BROWSER_EVIDENCE`
- Current readiness: `LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED`
- Evidence scope: `INTERNAL_BROWSER_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES`
- Evidence source: `DIRECT_BROWSER_RUN_RECORDED`

The Phase 31G implementation confirmed:
- `src/features/dataSafety/dataSafetyInternalVisibility.js` — pure helper, default-off
- `src/routes/Settings.jsx` — wired to internal visibility helper
- `shouldShowDataSafetyCenterPrototype` guards the prototype section
- `VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY` is the build-time opt-in flag
- Prototype visible in dev/test/internal builds only
- Both action buttons are disabled placeholders
- No storage writes, no external calls, no user-visible toggle

## Re-decision constraints

1. Any expansion of visibility must be gated by explicit evidence, not inferred from Phase 31I.
2. Ordinary-user visibility requires a separate design gate and evidence review.
3. Limited settings visibility to ordinary users is not approved by Phase 31I.
4. `BETA_READY` is not approved by Phase 31I and requires a separate decision chain.
5. Backup/export/restore behavior changes require a separate gate.
6. No sync/cloud/account/auth/backend may be introduced in Phase 31J.
7. Phase 31J must not modify src, tests, e2e, package files, or prior phase files beyond its allowed scope.

## Evidence required

Before Phase 31J can issue a `PASS_TO_LIMITED_SETTINGS_VISIBILITY` or `PASS_TO_LIMITED_INTERNAL_VISIBILITY` decision, the following evidence is required:

| Evidence type | Required for |
|---|---|
| Design spec for expanded visibility surface | PASS_TO_LIMITED_SETTINGS_VISIBILITY |
| User-facing copy review (Vietnamese-first) | PASS_TO_LIMITED_SETTINGS_VISIBILITY |
| Risk review for ordinary-user exposure | PASS_TO_LIMITED_SETTINGS_VISIBILITY or PASS_TO_LIMITED_INTERNAL_VISIBILITY |
| Browser evidence of new visibility surface | PASS_TO_LIMITED_SETTINGS_VISIBILITY |
| Rollback plan for expanded visibility | PASS_TO_LIMITED_SETTINGS_VISIBILITY or PASS_TO_LIMITED_INTERNAL_VISIBILITY |
| Claim boundary audit | Any PASS decision |

A `HOLD_DATA_SAFETY_UX_VISIBILITY` or `NEEDS_MORE_BROWSER_EVIDENCE` decision requires no additional evidence beyond Phase 31I.

## Decision options

```text
HOLD_DATA_SAFETY_UX_VISIBILITY
NEEDS_MORE_BROWSER_EVIDENCE
PASS_TO_LIMITED_INTERNAL_VISIBILITY
PASS_TO_LIMITED_SETTINGS_VISIBILITY
```

- `HOLD_DATA_SAFETY_UX_VISIBILITY` — Keep current state: internal-only visibility, no expansion. Use when evidence for expansion is insufficient or risk is too high.
- `NEEDS_MORE_BROWSER_EVIDENCE` — Additional browser evidence is required before re-deciding. Use when Phase 31I evidence was insufficient for the intended expansion scope.
- `PASS_TO_LIMITED_INTERNAL_VISIBILITY` — Allow expanded internal/dev/test visibility (e.g., additional env flag values or wider internal access). Requires: risk review, rollback plan, claim boundary audit.
- `PASS_TO_LIMITED_SETTINGS_VISIBILITY` — Allow limited ordinary-user visibility of the Data Safety UX prototype in Settings. Requires: full design spec, copy review, risk review, browser evidence, rollback plan, claim boundary audit.

## Forbidden default approvals

Phase 31J must not:
- Default to `PASS_TO_LIMITED_SETTINGS_VISIBILITY` based on Phase 31I alone
- Auto-approve ordinary-user visibility
- Auto-approve `BETA_READY`
- Auto-approve backup/export/restore behavior changes
- Auto-approve sync/cloud/account/auth/backend
- Auto-approve storage migration
- Auto-approve telemetry/analytics

Phase 31J is a separate visibility re-decision gate and is not automatically approved.

## Recommended next step

Begin Phase 31J by:
1. Reviewing the current Data Safety Center prototype content and determining whether it is suitable for limited ordinary-user exposure.
2. Deciding whether to hold at internal-only visibility or proceed to a design gate for limited settings visibility.
3. If proceeding to `PASS_TO_LIMITED_SETTINGS_VISIBILITY`: create a design spec, copy review, and risk audit before implementation.
4. If holding: issue `HOLD_DATA_SAFETY_UX_VISIBILITY` and document the rationale.

The recommended conservative path: issue `HOLD_DATA_SAFETY_UX_VISIBILITY` until a full design spec for ordinary-user visibility is approved.
