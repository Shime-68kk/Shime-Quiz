# Phase 30A — Limited Beta Candidate Claim/Copy Boundary Audit Seed

## Status token

```text
PHASE30A_LIMITED_BETA_CANDIDATE_AUDIT_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Purpose

Phase 30A is a claim/copy boundary audit of all user-visible surfaces in ShimeChamHoc v2.0.0-rc1, conducted before any limited beta candidate decision. Its purpose is to verify that no user-visible copy, wording, or claim violates the established claim boundary: no BETA_READY, no LIMITED_BETA_CANDIDATE, no public production readiness, no guaranteed data-loss prevention, no restore execution, no production restore rehearsal, no sync/cloud/account/auth/backend, and no telemetry/analytics claims.

Phase 30A is a claim/copy audit gate. It is not a beta approval gate. It does not approve LIMITED_BETA_CANDIDATE. It does not approve BETA_READY. It does not automatically follow from Phase 29F.

Phase 30A is a separate gate and must be executed and reviewed independently.

## Inputs from Phase 29F

Phase 29F delivered:
- Evidence review doc: `docs/testing/phase29f-evidence-review-limited-beta-candidate-redecision.md`
- Release summary: `docs/release/phase29f-evidence-review-limited-beta-candidate-redecision-summary.md`
- Phase 30A seed (this document): `docs/planning/phase30a-limited-beta-candidate-claim-copy-boundary-audit-seed.md`
- Validator: `scripts/validate-phase29f-evidence-review-limited-beta-candidate-redecision.js`

Phase 29F tokens:
```text
PHASE29F_EVIDENCE_REVIEW_STATUS: COMPLETED_PHASE29C_29D_29E_EVIDENCE_REVIEW
PHASE29F_LIMITED_BETA_CANDIDATE_REDECISION: PASS_TO_PHASE30A_LIMITED_BETA_CANDIDATE_CLAIM_COPY_BOUNDARY_AUDIT
PHASE29F_DECISION_SCOPE: PASS_TO_AUDIT_ONLY_NOT_BETA_READY_NOT_PUBLIC_PRODUCTION_READY
PHASE29F_OPEN_GAPS_STATUS: DOCUMENTED_BLOCKED_LANES_AND_LIMITATIONS
PHASE30A_LIMITED_BETA_CANDIDATE_AUDIT_SEED_STATUS: PREPARED_PLANNING_SEED
```

Phase 29F chose PASS_TO_PHASE30A_LIMITED_BETA_CANDIDATE_CLAIM_COPY_BOUNDARY_AUDIT. This advances to Phase 30A only. It does not approve LIMITED_BETA_CANDIDATE or BETA_READY.

Open gaps inherited from Phase 29F that Phase 30A must not resolve or approve:
1. Restore rehearsal browser lane (BLOCKED) — not resolved in Phase 29E or 29F.
2. Adapter-awareness browser lane (BLOCKED) — not resolved in Phase 29E or 29F.
3. No before/after localStorage diffs — not captured in any Phase 29E lane.
4. No 100+ card stress test — not performed.
5. No full rollback/removal — rollback/removal lane was navigation-only.
6. No real learner data — all prior evidence was generated/test data only.

## Audit constraints

Phase 30A operates under the following constraints:

1. **No default approvals**: Phase 30A must not approve LIMITED_BETA_CANDIDATE, BETA_READY, public production readiness, or any claim not directly supported by evidence reviewed in Phase 30A.
2. **Claim/copy audit only**: Phase 30A audits user-visible copy and claim surfaces only. It does not introduce runtime changes, restore execution, storage migration, sync/cloud/backend, or telemetry.
3. **No runtime source changes**: Phase 30A must not modify `src/**`, `tests/**`, `e2e/**`, or any production module.
4. **No fabrication**: All claim/copy observations must be recorded exactly as observed. No evidence may be fabricated.
5. **Conservative decision default**: If any user-visible copy or claim is ambiguous or potentially overreaching, the conservative decision must be chosen.
6. **Separate gate**: Phase 30A cannot be pre-approved by Phase 29F or any prior phase. An explicit Phase 30A decision token must be produced.
7. **Open gaps acknowledged**: Phase 30A must explicitly acknowledge all Phase 29F open gaps (restore rehearsal BLOCKED, adapter-awareness BLOCKED, localStorage diffs absent, stress test not performed, code rollback not performed).

## Claim surfaces to audit

Phase 30A must audit the following user-visible claim surfaces:

1. **Landing page visible copy**: All user-visible text on the landing/home page. Check for forbidden claims (BETA_READY, production readiness, guaranteed data-loss prevention, etc.).
2. **Dashboard copy**: All user-visible text on the dashboard route. Check for forbidden claims.
3. **Library/import copy**: All user-visible text on the library and import routes. Check for forbidden claims about import persistence, data safety, or production readiness.
4. **Backup/export/restore copy if visible**: Any user-visible text related to backup, export, or restore features, if any such surface is exposed. Check for forbidden claims about restore safety, data-loss prevention, or production readiness.
5. **Settings copy**: All user-visible text on the settings route. Check for forbidden claims.
6. **Release notes/PR notes**: Any user-visible release notes, changelog entries, or PR description text. Check for forbidden claims.
7. **User-facing docs**: Any user-facing documentation (README, onboarding, help text, tooltips). Check for forbidden claims.
8. **Any future limited beta candidate wording**: If any user-visible copy references "beta", "limited beta", "beta candidate", or similar, check that such wording is explicitly bounded and does not claim BETA_READY or full production readiness.

## Required gates before audit execution

Before Phase 30A audit execution, ALL of the following must be confirmed:

1. Phase 29F decision explicitly set to PASS_TO_PHASE30A_LIMITED_BETA_CANDIDATE_CLAIM_COPY_BOUNDARY_AUDIT — confirmed.
2. Phase 29F validator passes.
3. All Phase 29F required docs present.
4. All Phase 29F required tokens present.
5. No forbidden file areas changed in Phase 29F or any prior phase.
6. No generated artifacts present.
7. Phase 29F is a separate gate (not automatically approved by Phase 29E or prior phases) — confirmed.

## Forbidden default approvals

Phase 30A must not approve by default:

- LIMITED_BETA_CANDIDATE
- BETA_READY
- Public production readiness
- Guaranteed data-loss prevention
- Production restore rehearsal (real learner data)
- Real learner data restore rehearsal
- Restore execution safety
- Adapter-awareness production safety
- Backup file format changes
- Restore overwrite behavior changes
- Storage migration (LocalStorage → IndexedDB)
- Production adapter-aware backup/export/restore
- Sync/cloud/account/auth/backend
- Telemetry/analytics
- Broad external real-user validation without evidence
- Stress-tested readiness without evidence
- Any claim not supported by Phase 30A evidence reviewed

## Required allowed wording boundaries

Phase 30A must verify that all user-visible copy respects the following allowed wording boundaries:

- App is "in development" or "beta preview" or "early access" — allowed if not claiming production readiness.
- Features are "experimental" or "limited" — allowed if not claiming full stability or data-loss prevention.
- Backup/export features are available — allowed if not claiming guaranteed data-loss prevention or production restore safety.
- Study data is stored locally — allowed if not claiming sync/cloud/account safety.
- No sync, no cloud, no account required — allowed if accurate per implementation.
- "Not for production use" or "use at your own risk" — allowed and encouraged.
- Vietnamese-first user-facing language — allowed per Phase 16D product principles.

## Required forbidden wording checks

Phase 30A must flag the following forbidden wording if found in any user-visible surface:

- "production ready" or "production-ready" without qualification.
- "beta ready" or "BETA_READY" as a positive claim.
- "guaranteed" data safety, data preservation, or data-loss prevention.
- "restore" as a production feature claim (unless restore rehearsal evidence has been collected and the phase gate passed).
- "sync" or "cloud" as a feature claim (unless sync/cloud has been implemented and gated).
- Any wording that implies LIMITED_BETA_CANDIDATE has been approved.
- Any wording that implies broader testing or validation than what Phase 29C–29F evidence supports.

## Evidence packet requirements

Phase 30A must produce an evidence packet containing:

1. List of all claim surfaces audited (at minimum: landing page, dashboard, library/import, settings, backup/export/restore if visible, release notes, user-facing docs).
2. For each surface: the exact visible copy reviewed and the result (PASS, PASS_WITH_LIMITATIONS, NEEDS_FIX, or NOT_FOUND/NOT_APPLICABLE).
3. Any flagged forbidden wording or overreaching claims, with exact text.
4. Any claim surfaces that could not be audited (reason documented).
5. Overall Phase 30A decision.

All evidence must be recorded exactly as observed. No evidence may be fabricated.

## Decision options

Phase 30A must produce exactly one of the following decisions:

### Option 1: HOLD_LIMITED_BETA_CANDIDATE

```text
PHASE30A_LIMITED_BETA_CANDIDATE_AUDIT_DECISION: HOLD_LIMITED_BETA_CANDIDATE
```

Use when: One or more user-visible claim surfaces contain forbidden wording or overreaching claims that must be fixed before any limited beta candidate decision.

Consequence: Phase 30A must identify specific claim/copy fixes required and produce a targeted fix plan. No LIMITED_BETA_CANDIDATE advancement.

### Option 2: NEEDS_COPY_OR_CLAIM_FIXES

```text
PHASE30A_LIMITED_BETA_CANDIDATE_AUDIT_DECISION: NEEDS_COPY_OR_CLAIM_FIXES
```

Use when: Some claim surfaces are acceptable but others require targeted copy or claim fixes. The issues are specific and bounded.

Consequence: Phase 30A must identify specific claim/copy fixes required. After fixes are confirmed, a follow-up gate (Phase 30A-HF or Phase 30B) may advance to a limited beta candidate decision.

### Option 3: PASS_TO_LIMITED_BETA_CANDIDATE_GATE

```text
PHASE30A_LIMITED_BETA_CANDIDATE_AUDIT_DECISION: PASS_TO_LIMITED_BETA_CANDIDATE_GATE
```

Use when: All audited claim surfaces are within the allowed wording boundary and no forbidden wording is found. The accumulated evidence (Phase 29C–29F) is sufficient to advance to a formal limited beta candidate gate.

This option may only be used if:

1. All required claim surfaces have been audited.
2. No forbidden wording or overreaching claims were found (or all findings have been resolved).
3. All Phase 29F open gaps are explicitly acknowledged.
4. The advance is to a LIMITED_BETA_CANDIDATE gate — not automatically to LIMITED_BETA_CANDIDATE approval.
5. An explicit Phase 30A decision token is produced.

Consequence: Phase 30A passes to a formal limited beta candidate gate (Phase 30B or equivalent). The limited beta candidate gate is a separate, non-automatically-approved gate.

## Recommended next step

Phase 30A should begin by reviewing all user-visible claim surfaces listed in the Claim surfaces to audit section. For each surface, the reviewer must check for forbidden wording and verify that all copy respects the allowed wording boundary. The review must produce an explicit decision token (HOLD_LIMITED_BETA_CANDIDATE, NEEDS_COPY_OR_CLAIM_FIXES, or PASS_TO_LIMITED_BETA_CANDIDATE_GATE).

Phase 30A is a separate claim/copy audit gate and is not automatically approved.
Phase 29F does not approve LIMITED_BETA_CANDIDATE.
Phase 29F does not approve BETA_READY.
Phase 29F does not approve public production readiness.
Phase 29F does not approve guaranteed data-loss prevention.
Phase 29F does not approve restore execution.
Phase 29F does not approve production restore rehearsal.
Phase 29F does not approve real learner data restore rehearsal.
Phase 29F does not approve runtime backup/export/restore changes.
Phase 29F does not approve backup file format changes.
Phase 29F does not approve restore overwrite behavior changes.
Phase 29F does not approve storage migration.
Phase 29F does not approve sync/cloud/account/auth/backend.
Phase 29F does not approve telemetry/analytics.
