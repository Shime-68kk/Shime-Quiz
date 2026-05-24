# Phase 31F — Data Safety UX Internal Visibility Gate

## Status tokens

```text
PHASE31F_DATA_SAFETY_UX_INTERNAL_VISIBILITY_STATUS: COMPLETED_INTERNAL_VISIBILITY_GATE
PHASE31F_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE31F_DATA_SAFETY_UX_INTERNAL_VISIBILITY_DECISION: PASS_TO_PHASE31G_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION
PHASE31F_VISIBILITY_SCOPE: INTERNAL_VISIBILITY_GATE_ONLY_NO_RUNTIME_VISIBILITY_CHANGE
PHASE31F_MANUAL_BROWSER_EVIDENCE_STATUS: NOT_PROVIDED_NOT_CLAIMED
PHASE31G_DATA_SAFETY_UX_INTERNAL_VISIBILITY_IMPLEMENTATION_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Scope

Phase 31F is an internal visibility gate phase. It evaluates whether the Phase 31C/31D/31E default-off Data Safety UX prototype may proceed to a controlled default-off internal visibility implementation, and under what constraints.

Phase 31F is docs/testing/evidence/release/planning/static-validator/CI-only.

- No runtime source changes.
- No unit test changes.
- No e2e changes.
- No production imports.
- No restore execution.
- No backup/export/restore behavior changes.
- No backup file format changes.
- No restore overwrite behavior changes.
- No storage driver changes.
- No migrations.
- No telemetry/analytics.
- No sync/cloud/account/auth/backend.
- No production-visible UI changes.
- No route/navigation/settings/library/dashboard changes.
- No new implementation.
- No BETA_READY approval.
- No public production readiness approval.
- No broad beta release approval.
- No ordinary-user limited settings visibility approval.

Phase 31F does not change runtime visibility. The Data Safety UX prototype remains hidden/default-off after Phase 31F.

## Inputs from Phase 31E

From Phase 31E:
- Controlled visibility gate doc: `docs/testing/phase31e-data-safety-ux-controlled-visibility-gate.md`
- Release summary: `docs/release/phase31e-data-safety-ux-controlled-visibility-summary.md`
- Phase 31F seed: `docs/planning/phase31f-data-safety-ux-internal-visibility-seed.md`

Phase 31E tokens:

```text
PHASE31E_DATA_SAFETY_UX_CONTROLLED_VISIBILITY_STATUS: COMPLETED_CONTROLLED_VISIBILITY_GATE
PHASE31E_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE31E_DATA_SAFETY_UX_VISIBILITY_DECISION: PASS_TO_DEFAULT_OFF_INTERNAL_VISIBILITY
PHASE31E_VISIBILITY_SCOPE: VISIBILITY_GATE_ONLY_NO_RUNTIME_VISIBILITY_CHANGE
PHASE31E_MANUAL_BROWSER_EVIDENCE_STATUS: NOT_PROVIDED_NOT_CLAIMED
PHASE31F_DATA_SAFETY_UX_INTERNAL_VISIBILITY_SEED_STATUS: PREPARED_PLANNING_SEED
```

Key findings carried forward from Phase 31E:
- Phase 31D static/unit/build/validator evidence: PASS.
- Manual browser evidence was NOT provided and NOT claimed in Phase 31D or Phase 31E.
- No real user testing was conducted.
- No restore rehearsal with real data.
- BETA_READY was not approved.
- Limited settings visibility to ordinary users was not approved.
- Runtime visibility was not changed in Phase 31E.

## Internal visibility definition

Internal visibility means developer/tester-only visibility behind explicit internal/default-off control.

Internal visibility does NOT mean:
- Ordinary-user visibility in production.
- Limited settings visibility to ordinary users.
- Any change to default runtime behavior.
- Any change visible without an explicit internal flag/config.

An explicit internal flag/config is required before any internal visibility can be implemented. The flag must be non-default and must not surface to production users.

## Internal visibility gate method

Phase 31F evaluates internal visibility readiness by reviewing:
1. Phase 31E controlled visibility decision and evidence scope.
2. Manual browser evidence status (the key gap from Phase 31D/31E).
3. Internal-only visibility definition and scope boundaries.
4. Explicit internal flag/config requirement.
5. Ordinary-user visibility boundary (not approved).
6. No runtime visibility change in Phase 31F.
7. No storage/network/backup side effects.
8. Rollback requirement.
9. BETA_READY absence.
10. Sync/cloud/backend absence.

This gate produces an internal visibility decision. It does not implement any visibility change. Any approved internal visibility must be implemented in a separate Phase 31G gate.

## Internal visibility decision table

| Internal visibility item | Source | Evidence reviewed | Status | Limitation | Decision impact | Visibility allowed | Visibility not allowed |
|---|---|---|---|---|---|---|---|
| Phase 31E pass-to-default-off-internal-visibility | Phase 31E gate doc | Phase 31E gate PASS | CONFIRMED | Docs/planning only; no runtime change | Supports Phase 31F gate opening | Internal planning only | Immediate implementation |
| manual browser evidence status | Phase 31D/31E gate | NOT_PROVIDED_NOT_CLAIMED | MISSING | No browser rendering confirmed for any section | Blocks ordinary-user and limited-settings visibility | None | Ordinary-user visibility; limited settings visibility |
| default-off prototype evidence | Phase 31C/31D static/unit | Static/unit/build/validator PASS | CONFIRMED_STATIC_ONLY | Browser not verified; rendering unconfirmed | Supports internal planning progression | Continue default-off | Production exposure |
| internal-only visibility definition | Phase 31F gate | Scope review | DEFINED | Developer/tester scope only; non-default flag required | Sets narrow scope boundary | Developer/tester behind explicit flag | Ordinary-user; broad settings panel |
| explicit internal flag/config requirement | Phase 31F gate | Scope review | REQUIRED | Must be non-default; must not surface to production users | Implementation gate for Phase 31G | Behind explicit flag only | Without explicit flag/config |
| no ordinary-user visibility | Phase 31F gate | Scope review | BLOCKED | Browser evidence missing; ordinary-user gate not met | Prevents production exposure | None at this stage | All ordinary-user visibility |
| no runtime visibility change in Phase 31F | Phase 31F gate | Scope review | CONFIRMED | Docs/CI only | No behavior change | Docs/planning only | Any runtime visibility change |
| no storage/network/backup side effects | Phase 31C/31D static/unit | Static/unit | CONFIRMED | None identified | Safe for internal planning | Prototype inspection | Any side-effect implementation |
| rollback requirement | Phase 31F gate | Scope review | REQUIRED | Flag disable must restore baseline without data loss | Required for any Phase 31G implementation | Behind rollback-safe non-default flag | Irreversible or data-loss visibility |
| BETA_READY absence | All prior phases | All phase validators | NOT_APPROVED | BETA_READY requires a separate explicit gate | Limits scope ceiling | LIMITED_BETA_CANDIDATE only | BETA_READY status |
| sync/cloud/backend absence | All prior phases | All phase validators | NOT_PRESENT | No sync/backend component in prototype | Safe from external dependencies | Prototype only | Sync/cloud/backend exposure |

## Manual browser evidence boundary

Manual browser evidence remains `NOT_PROVIDED_NOT_CLAIMED`.

Manual browser evidence for the Phase 31C Data Safety UX prototype was NOT provided and NOT claimed in Phase 31D, Phase 31E, or Phase 31F. The nine static UI sections have not been verified rendering correctly in a real browser.

This limitation does not block Phase 31F from passing to an internal-only implementation planning gate (Phase 31G), because Phase 31G is a separate implementation/prototype gate requiring its own evidence collection. However, this limitation does block:
- Ordinary-user limited settings visibility.
- Any claim of verified browser rendering.
- Any claim of copy boundary compliance in a real browser.

Manual browser evidence must be collected as part of Phase 31G before any runtime visibility change is approved.

## Allowed internal visibility lane

The allowed lane for Phase 31F is:

**Default-off internal visibility implementation planning** — pass to Phase 31G to design and prototype an internal-only visibility mechanism behind an explicit non-default flag. Phase 31G must collect missing browser evidence and make its own explicit decision before implementing any visibility change.

Phase 31F does not implement this. Phase 31F only approves the planning gate.

## Ordinary-user visibility boundary

Ordinary-user limited settings visibility is not approved.

No ordinary-user can be given access to the Data Safety UX prototype without:
1. Manual browser evidence collected and reviewed.
2. Copy boundary compliance verified in a real browser.
3. A separate explicit ordinary-user visibility gate with full evidence.
4. No regressions in existing Settings panels verified in a real browser.

Phase 31F does not approve any ordinary-user visibility now or in Phase 31G. Phase 31G must not approve ordinary-user visibility without its own explicit gate.

## Internal visibility decision options

Phase 31F evaluated the following internal visibility decision options:

```text
HOLD_INTERNAL_VISIBILITY
NEEDS_MANUAL_BROWSER_EVIDENCE
PASS_TO_PHASE31G_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION
```

- `HOLD_INTERNAL_VISIBILITY`: Evidence is insufficient, regressions found, copy boundaries not met, or scope risks exceed acceptable limits. Hold all internal visibility until resolved.
- `NEEDS_MANUAL_BROWSER_EVIDENCE`: Manual browser evidence is still missing and must be collected before any Phase 31G implementation can be planned.
- `PASS_TO_PHASE31G_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION`: Phase 31E evidence passed. No active regressions or copy violations found at the static/unit level. Pass to Phase 31G as a separate implementation/prototype gate requiring its own evidence collection and decision.

## Chosen internal visibility decision

```text
PHASE31F_DATA_SAFETY_UX_INTERNAL_VISIBILITY_DECISION: PASS_TO_PHASE31G_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION
```

Phase 31F passes only to a separate Phase 31G implementation/prototype gate. Phase 31G is a separate gate and is not automatically approved.

## Decision rationale

Phase 31E passed the controlled visibility gate and confirmed `PASS_TO_DEFAULT_OFF_INTERNAL_VISIBILITY`. Phase 31D static/unit/build/validator evidence passed. No active regressions or copy violations were found at the static or unit level.

Manual browser evidence remains NOT_PROVIDED_NOT_CLAIMED. This is the primary gap. However, this gap does not prevent Phase 31F from passing to a separate internal-only planning/implementation gate (Phase 31G), because:
- Phase 31G is itself a full gate requiring its own browser evidence collection before any runtime visibility change.
- The prototype is safely hidden/default-off with no side effects.
- No ordinary-user exposure occurs at this stage.
- Phase 31F does not change runtime visibility.

`PASS_TO_PHASE31G_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION` is the appropriate decision because:
- Phase 31E passed the controlled visibility gate.
- Static evidence supports safe progression to internal planning.
- Phase 31G is a separate gate — no automatic approval is given.
- Phase 31G must collect all missing browser evidence before approving any implementation.

`NEEDS_MANUAL_BROWSER_EVIDENCE` is not chosen because:
- Phase 31F is an internal visibility gate, not an evidence collection phase.
- Phase 31G is the phase that will collect browser evidence before implementation.
- Holding Phase 31F on browser evidence when Phase 31G is the appropriate collection phase would add unnecessary delay without safety benefit, given that no runtime change occurs in Phase 31F.

`HOLD_INTERNAL_VISIBILITY` is not chosen because:
- No active regressions or copy violations were found at the static/unit level.
- No safety concerns prevent passing to a planning/implementation gate.

## What Phase 31F supports

- Internal visibility gate decision completed.
- Phase 31E controlled visibility decision confirmed.
- Manual browser evidence limitation preserved and documented.
- Phase 31G internal visibility implementation seed prepared.
- LIMITED_BETA_CANDIDATE confirmed as highest approved readiness status.
- Docs/static-validator/CI only — no runtime changes.

## What Phase 31F does not approve

Phase 31F does not approve BETA_READY.
Phase 31F does not approve public production readiness.
Phase 31F does not approve guaranteed data-loss prevention.
Phase 31F does not approve restore execution.
Phase 31F does not approve production restore rehearsal.
Phase 31F does not approve real learner data restore rehearsal.
Phase 31F does not approve runtime backup/export/restore behavior changes.
Phase 31F does not approve backup file format changes.
Phase 31F does not approve restore overwrite behavior changes.
Phase 31F does not approve storage migration.
Phase 31F does not approve sync/cloud/account/auth/backend.
Phase 31F does not approve telemetry/analytics.
Phase 31F does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 31F does not approve BYOC/WebDAV/P2P/device-transfer implementation.
Phase 31F does not approve limited settings visibility to ordinary users.
Phase 31F does not approve any runtime visibility change.
Phase 31F does not approve Phase 31G automatically.

## Required gates before implementation

Before Phase 31G can approve any internal visibility implementation:

1. Manual browser evidence must be collected and reviewed — all nine UI sections must be verified as rendering correctly in a real browser.
2. All action buttons must be verified as visibly disabled in a real browser.
3. Copy boundaries must be verified in a real browser (no forbidden claims visible).
4. Settings page must be verified unchanged when prototype is disabled (default state).
5. No regressions in existing Settings panels (FSRS, EduGen) must be verified.
6. No console errors or layout breakage must be verified.
7. An explicit Phase 31G planning output must be produced with a separate decision.
8. Internal user group definition must be documented (who sees the flag, how).
9. The internal flag must be confirmed as non-default and not surfaced to production users.
10. Rollback plan must be confirmed: flag disable restores baseline without data loss.

## Required gates before ordinary-user visibility

Before any ordinary-user or limited settings visibility is approved:

1. All required gates before implementation (above) must be met.
2. A separate explicit ordinary-user visibility gate must be opened and passed.
3. Manual browser evidence must be reviewed at that gate.
4. Copy boundary compliance must be confirmed in a real browser.
5. No regressions in existing Settings panels confirmed.
6. Ordinary-user visibility is NOT approved by Phase 31F or Phase 31G by default.

## Open limitations

- Manual browser evidence is NOT_PROVIDED_NOT_CLAIMED — the nine UI sections have not been verified rendering in a real browser.
- No real user testing has been conducted.
- No restore rehearsal with real data.
- BETA_READY has not been approved.
- Limited settings visibility to ordinary users is not approved.
- All nine static UI sections exist as code constructs but have not been verified rendering in a real browser.

No broad validation has been performed. Phase 31F is an internal visibility gate only.

## Claim boundary

Phase 31F does not claim:
- Verified browser rendering of any UI section.
- Copy boundary compliance in a real browser.
- Stress-tested readiness.
- Broad validation completeness.
- BETA_READY approval.
- Public production readiness.
- Guaranteed data-loss prevention.
- Restore execution guarantees.
- Production restore rehearsal.
- Real learner data restore rehearsal.
- Storage migration.
- Sync/cloud/account/auth/backend readiness.
- Telemetry/analytics approval.
- BYOC/WebDAV/P2P/device-transfer readiness.
- Ordinary-user visibility approval.
- Phase 31G automatic approval.

## Next recommended phase

Next recommended phase: Phase 31G — Data Safety UX Internal Visibility Implementation

Phase 31G is a separate implementation/prototype gate and is not automatically approved.
Phase 31F confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 31F does not approve BETA_READY.
Phase 31F does not approve public production readiness.
Phase 31F does not approve guaranteed data-loss prevention.
Phase 31F does not approve restore execution.
Phase 31F does not approve production restore rehearsal.
Phase 31F does not approve real learner data restore rehearsal.
Phase 31F does not approve runtime backup/export/restore behavior changes.
Phase 31F does not approve backup file format changes.
Phase 31F does not approve restore overwrite behavior changes.
Phase 31F does not approve storage migration.
Phase 31F does not approve sync/cloud/account/auth/backend.
Phase 31F does not approve telemetry/analytics.
Phase 31F does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 31F does not approve BYOC/WebDAV/P2P/device-transfer implementation.
Phase 31F does not approve limited settings visibility to ordinary users.
Phase 31F does not change runtime visibility.
