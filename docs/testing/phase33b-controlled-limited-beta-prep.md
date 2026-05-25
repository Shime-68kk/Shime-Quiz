# Phase 33B — Controlled Limited Beta Prep

## Status tokens

```text
PHASE33B_CONTROLLED_LIMITED_BETA_PREP_STATUS: COMPLETED_CONTROLLED_LIMITED_BETA_PREP
PHASE33B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE33B_CONTROLLED_LIMITED_BETA_PREP_DECISION: PASS_TO_PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW
PHASE33B_PREP_SCOPE: CONTROLLED_LIMITED_BETA_PREP_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE33B_LIMITATION_DISCLOSURE_STATUS: LIMITATIONS_DISCLOSED_FOR_CONTROLLED_PREP
PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED
```

## Scope

Phase 33B is the Controlled Limited Beta Prep gate. It receives the Phase 33A stabilization
decision (`PASS_TO_PHASE33B_CONTROLLED_LIMITED_BETA_PREP`) and prepares the concrete
communications, disclosure checklists, and review templates needed for a controlled limited
beta rollout — if and when such a rollout is approved in a subsequent gate.

Phase 33B is docs/testing/release/planning/static-validator/CI-only.
No runtime behavior changes, no source changes, no unit test changes, no e2e test changes,
no dependency changes are included.

Phase 33B confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 33B does not approve BETA_READY.
Phase 33B does not approve public production readiness.

## Inputs from Phase 33A

```text
PHASE33A_LIMITED_BETA_CANDIDATE_STABILIZATION_STATUS: COMPLETED_STABILIZATION_PLANNING
PHASE33A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE33A_LIMITED_BETA_CANDIDATE_STABILIZATION_DECISION: PASS_TO_PHASE33B_CONTROLLED_LIMITED_BETA_PREP
PHASE33A_STABILIZATION_SCOPE: PLANNING_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE33A_LIMITATION_CARRYFORWARD_STATUS: LIMITATIONS_DISCLOSED_AND_TRACKED
PHASE33B_CONTROLLED_LIMITED_BETA_PREP_SEED_STATUS: PREPARED_PLANNING_SEED
```

Prior phase gate traceability:
- Phase 30B: `PASS_LIMITED_BETA_CANDIDATE`
- Phase 30C: `NEEDS_MORE_EVIDENCE_FOR_BETA_READY` (hold — not lifted)
- Phase 31J: `PASS_TO_LIMITED_INTERNAL_VISIBILITY` (Data Safety UX internal only)
- Phase 32C: conservative blocked-lane interpretation
- Phase 32D: claim/copy cleanup — legacy SHIP wording bounded as historical
- Phase 32E: input review — `PASS_TO_PHASE32F_BETA_READY_REDECISION`
- Phase 32F: formal Beta Ready re-decision — `PASS_LIMITED_BETA_READY_CANDIDATE_ONLY`
- Phase 33A: limited beta candidate stabilization — `PASS_TO_PHASE33B_CONTROLLED_LIMITED_BETA_PREP`

Limitations carried forward from Phase 33A (originating in Phase 32F):
- Restore rehearsal browser lane: `BLOCKED_DEFAULT_OFF` — not production restore proof.
- Adapter-awareness browser lane: `BLOCKED_DEFAULT_OFF` — not production adapter proof.
- Generated/test stress evidence: smoke-level only (3-item fixture) — not production-grade.
- Rollback/removal evidence: simulation-only — not a guaranteed rollback proof.
- No real learner data evidence.
- No public production readiness evidence.
- No guaranteed data-loss prevention proof.
- Ordinary-user Data Safety UX visibility: not approved.
- No sync/cloud/account/auth/backend evidence present or intended.
- Phase 30C Beta Ready hold not lifted.

## Prep method

Phase 33B conducts a controlled limited beta prep using:
1. Full limitation review from Phase 33A stabilization.
2. Definition of participant boundary and access constraints.
3. Structured limitation disclosure checklist for any controlled beta participant.
4. No-public-production, no-Beta-Ready, and no-data-loss-guarantee wording boundary review.
5. No cloud/sync/backend/account/auth claim boundary review.
6. Restore/adapter blocked-default-off follow-up plan.
7. Stress/rollback follow-up plan.
8. Data Safety UX internal-only status confirmation.
9. Release/PR note template for controlled limited beta candidate.
10. Phase 33C seed preparation.

The prep does not introduce new runtime code, new tests, new source changes, or new evidence
collection. It evaluates the existing readiness state and prepares communication and disclosure
materials within the bounded LIMITED_BETA_CANDIDATE readiness claim.

## Controlled limited beta prep table

| Prep surface | Input from Phase 33A | Prep action | Remaining limitation | Decision impact | Claim allowed | Claim not allowed |
|---|---|---|---|---|---|---|
| Limited beta participant boundary | LIMITED_BETA_CANDIDATE confirmed; internal/controlled only | Define participant scope: internal controlled access only; structured access grant and disclosure requirement | Not a public beta or production rollout | Supports controlled internal limited beta preparation only | Controlled internal limited beta candidate evaluation | Public beta, broad release, public production, open access |
| Limitation disclosure checklist | All limitations carried forward from Phase 33A | Create structured checklist of all limitations; mandatory acknowledgment before any participant access | All limitations remain unresolved | Cannot grant access without disclosed limitation acknowledgment | Disclosed limitations checklist completed | Undisclosed or implied-resolved limitation claims |
| No public production wording | Phase 32D cleanup confirmed; conservative claim posture | Publish wording boundary: no public production, no production-ready, no broad-release language in any communication | Ongoing monitoring requirement | Supports conservative claim posture | LIMITED_BETA_CANDIDATE language only | Public production, production-ready, broad beta release |
| No Beta Ready wording | Phase 30C hold not lifted; BETA_READY not approved by 32F or 33A | Publish wording boundary: no BETA_READY in any communication; Phase 30C hold stands | BETA_READY not approved; Phase 30C hold stands | BETA_READY remains not approved | LIMITED_BETA_CANDIDATE status language | BETA_READY, Beta Ready approval, Phase 30C hold lifted |
| No data-loss guarantee wording | No guaranteed data-loss prevention proof | Publish wording boundary: no data-loss guarantee language; disclosure of absence required for beta participants | No guaranteed data-loss prevention proof | Cannot support data-loss guarantee claim | Document absence; required disclosure for participants | Data-loss guarantee, data safety assurance |
| No cloud/sync/backend/account/auth claim | Explicitly out of scope from Phase 33A | Publish wording boundary: no sync, cloud, account, auth, backend language | Out of scope — no evidence present or intended | Cannot approve any sync/cloud/backend/auth/account feature | Document out-of-scope boundary | Sync, cloud, account, auth, backend approval or implied availability |
| Restore/adapter blocked-default-off follow-up | BLOCKED_DEFAULT_OFF lanes from Phase 32F; carried forward through 33A | Document blocked status; define resolution path: production evidence OR formal de-scope gate | Lanes remain BLOCKED_DEFAULT_OFF; not production proof | Cannot approve restore execution or adapter-awareness production proof | Blocked-lane documentation; follow-up gate plan | Production restore proof, production adapter proof, de-scope without dedicated gate |
| Stress/rollback follow-up | Smoke-level only (3-item fixture); simulation-only rollback | Document smoke-level and simulation baseline; plan production-representative evidence for future gate | Stress and rollback evidence remain limited at time of Phase 33B | Cannot support stress-tested readiness or rollback guarantee claim | Smoke baseline documented; simulation baseline documented | Production-grade stress readiness, guaranteed rollback proof |
| Data Safety UX internal-only status | Phase 31J PASS_TO_LIMITED_INTERNAL_VISIBILITY; ordinary-user visibility not approved | Confirm internal-only status; define gate requirement for any visibility change | Ordinary-user visibility remains not approved | Cannot approve ordinary-user UX | Internal visibility documented | Ordinary-user visibility approval, default-on UX |
| Release/PR note template for controlled limited beta candidate | Phase 32D claim/copy cleanup; conservative claim posture confirmed | Create template that uses only LIMITED_BETA_CANDIDATE language, discloses all limitations, avoids any higher readiness claim | Template is non-binding; each release requires independent claim review | Template supports compliant communication only | LIMITED_BETA_CANDIDATE disclosure template | BETA_READY template, production-ready template, data-loss-safe template |
| Phase 33C prep review | Phase 33B prep gate | Prepare Phase 33C seed with review constraints, decision options, and required review surfaces | Phase 33C is a separate review gate; not automatically approved | Enables Phase 33C to begin its review independently | Phase 33C seed prepared | Phase 33C automatic approval |

## Participant boundary

The controlled limited beta participant boundary is defined as follows:

**Who qualifies:**
- Internal controlled access only — no public or open access.
- Participants must be explicitly designated before any access is granted.
- No participant may be granted access without first completing the limitation disclosure
  checklist acknowledgment.

**How access is granted:**
- Access is granted only through an explicit, individually tracked designation.
- No automated or self-serve access grant mechanism is in place or approved.
- Each participant designation must record: participant identifier, access date, limitation
  disclosure acknowledgment, and scope of access.

**Scope of access:**
- Limited to the application in its current LIMITED_BETA_CANDIDATE state.
- No production data migration authority is granted.
- No restore execution authority is granted.
- No Data Safety UX access beyond what is available through internal-only channels.

**Required disclosures before access:**
- All limitations listed in the limitation disclosure checklist below must be acknowledged.
- No claim of production readiness, Beta Ready status, or data-loss guarantee may be implied
  during the access grant process.

Phase 33B does not approve public beta access, open access, or broad release.

## Limitation disclosure checklist

The following limitations must be disclosed to and acknowledged by every controlled limited
beta participant before access is granted. No limitation may be omitted or described as resolved.

- [ ] Restore rehearsal browser lane is `BLOCKED_DEFAULT_OFF`. Not production restore proof.
      No restore execution authority is granted. No production restore rehearsal has been
      conducted with real learner data.
- [ ] Adapter-awareness browser lane is `BLOCKED_DEFAULT_OFF`. Not production adapter proof.
      The adapter-awareness model has not been verified in a production browser environment.
- [ ] Stress evidence is smoke-level only (3-item fixture). Not production-grade. The
      application has not been stress-tested with production data volumes.
- [ ] Rollback/removal evidence is simulation-only. Not a guaranteed rollback proof.
      No live rollback against real learner data has been executed.
- [ ] No real learner data evidence. All testing used generated or synthetic data.
- [ ] No public production readiness evidence. The application is not approved for public
      production deployment.
- [ ] No guaranteed data-loss prevention. The application may lose data. Participants must
      maintain independent backups of all data they consider important.
- [ ] Ordinary-user Data Safety UX visibility is not approved. Data Safety UX features are
      available internally only.
- [ ] No sync, cloud, account, auth, or backend features are in scope or approved.
- [ ] Phase 30C Beta Ready hold has not been lifted. BETA_READY status has not been approved.

All items above must be acknowledged before access is granted.
Failure to disclose any item constitutes a claim boundary violation.

## No public production wording

No communication related to this controlled limited beta may use the following language
or any language with equivalent meaning:

**Prohibited terms and phrases:**
- "production ready" / "production-ready"
- "ready for production"
- "public beta" / "public release"
- "broad beta release" / "broad release"
- "BETA_READY" (as a status claim)
- "fully tested" / "thoroughly tested" with production-scope implication
- "data safe" / "data loss prevented" / "no data loss guaranteed"
- "restore tested" / "backup verified in production"
- "stress tested" with production-scope implication

**Required alternative framing:**
- "controlled internal limited beta candidate"
- "internal evaluation only"
- "not production ready"
- "all limitations disclosed"
- "LIMITED_BETA_CANDIDATE status only"

Phase 33B does not approve public production readiness.

## No Beta Ready wording

No communication related to this controlled limited beta may use the following language
or any language with equivalent meaning:

**Prohibited terms and phrases:**
- "BETA_READY" (as an approved status)
- "Beta Ready" / "beta ready"
- "ready for broader testing"
- "Phase 30C hold lifted"
- "beta approved" / "beta cleared"
- Any language implying that BETA_READY has been approved

**Required alternative framing:**
- "LIMITED_BETA_CANDIDATE" (the approved readiness status)
- "Phase 30C Beta Ready hold remains in effect"
- "BETA_READY not approved"

Phase 33B does not approve BETA_READY.
The Phase 30C hold (`NEEDS_MORE_EVIDENCE_FOR_BETA_READY`) has not been lifted.

## No data-loss guarantee wording

No communication related to this controlled limited beta may claim or imply data-loss
prevention or a data safety guarantee.

**Prohibited terms and phrases:**
- "data loss prevented" / "no data loss"
- "data is safe" / "your data is safe"
- "backup guaranteed" / "restore guaranteed"
- "data-loss guarantee" / "data safety assurance"
- Any language implying that data cannot be lost during use

**Required disclosure:**
Every communication with controlled limited beta participants must include a clear statement
that no guaranteed data-loss prevention is in place and that participants must maintain
independent backups of all data they consider important.

Phase 33B does not approve guaranteed data-loss prevention.

## No cloud/sync/backend/account/auth claim

No communication related to this controlled limited beta may claim or imply cloud, sync,
account, auth, or backend capability.

**Prohibited terms and phrases:**
- "cloud sync" / "cloud backup"
- "account required" / "account enabled"
- "syncs across devices" / "device sync"
- "backend" / "server-side" with availability claim
- "BYOC" / "WebDAV" / "P2P" / "device transfer"

**Required framing:**
- Explicitly local-first only.
- No sync, cloud, account, auth, or backend features are in scope.

Phase 33B does not approve sync/cloud/account/auth/backend.
Phase 33B does not approve BYOC/WebDAV/P2P/device-transfer implementation.

## Restore and adapter follow-up

The restore rehearsal browser lane (`BLOCKED_DEFAULT_OFF`) is carried forward from Phase 33A.
Phase 33B does not resolve or de-scope this lane.

The adapter-awareness browser lane (`BLOCKED_DEFAULT_OFF`) is carried forward from Phase 33A.
Phase 33B does not resolve or de-scope this lane.

**Current status at Phase 33B:**
- Restore rehearsal browser lane: `BLOCKED_DEFAULT_OFF` — not production restore proof.
- Adapter-awareness browser lane: `BLOCKED_DEFAULT_OFF` — not production adapter proof.

**Resolution path required before either lane may be considered resolved:**
- Option A: Provide production-grade browser evidence for the lane in a dedicated gate.
- Option B: Formally de-scope the lane with explicit written rationale in a dedicated gate.

Neither option may be enacted implicitly. A dedicated gate with explicit documentation
is required for either path.

Phase 33B does not approve restore execution.
Phase 33B does not approve production restore rehearsal.
Phase 33B does not approve real learner data restore rehearsal.
Phase 33B does not approve production adapter-awareness verification.

## Stress and rollback follow-up

**Current status at Phase 33B:**
- Stress evidence: smoke-level only (3-item fixture, not production data volume).
- Rollback/removal evidence: simulation-only — not a guaranteed rollback proof.

**Follow-up plan for stress evidence:**
- A production-representative stress evidence collection run is required.
- The run must use a realistic data volume representative of expected real-world usage.
- Until such evidence is collected, the smoke-level baseline is the only documented baseline.

**Follow-up plan for rollback evidence:**
- A live rollback evidence collection run against representative data is required.
- Until such evidence is collected, the simulation baseline is the only documented baseline.

Phase 33B does not accept smoke-level stress evidence as production-grade.
Phase 33B does not accept simulation-only rollback evidence as a rollback guarantee.

## Data Safety UX internal-only status

Phase 31G–31J established internal-only Data Safety UX visibility. Ordinary-user visibility
was not approved and remains not approved.

Phase 33B confirms:
- Data Safety UX is visible internally only.
- Ordinary-user Data Safety UX visibility requires a separate dedicated gate.
- No action in Phase 33B changes the ordinary-user visibility status.
- Any future change to ordinary-user visibility requires an explicit gate decision.

Phase 33B does not approve ordinary-user Data Safety UX visibility.
Phase 33B does not approve limited settings visibility to ordinary users.

## Release/PR note template

The following template is provided for PR descriptions and release notes for a controlled
limited beta candidate. It must be reviewed before every use to confirm it is accurate
and no claim boundary violations are present.

---

**TEMPLATE — Controlled Limited Beta Candidate**
**For internal review only. Not for public use.**

---

**Status:** LIMITED_BETA_CANDIDATE (internal controlled access only)

**What this is:** An internal controlled limited beta candidate evaluation build.
This is NOT a public release. This is NOT Beta Ready. This is NOT production ready.

**Readiness boundary:**
- Highest approved readiness: `LIMITED_BETA_CANDIDATE`
- BETA_READY: NOT APPROVED
- Public production readiness: NOT APPROVED
- Guaranteed data-loss prevention: NOT APPROVED

**Known limitations (must be disclosed to all participants):**
- Restore rehearsal browser lane: BLOCKED_DEFAULT_OFF — not production restore proof
- Adapter-awareness browser lane: BLOCKED_DEFAULT_OFF — not production adapter proof
- Stress evidence: smoke-level only — not production-grade
- Rollback evidence: simulation-only — not a guaranteed rollback proof
- No real learner data evidence
- No public production readiness evidence
- No guaranteed data-loss prevention — maintain independent backups
- Data Safety UX: internal only — not visible to ordinary users
- No sync/cloud/account/auth/backend features in scope
- Phase 30C Beta Ready hold not lifted

**Scope of this release:**
- [Describe specific changes included — must not include runtime/source changes for Phase 33B]

**What this does NOT include:**
- No BETA_READY approval
- No public production deployment
- No data-loss guarantee
- No restore execution
- No sync/cloud/backend changes

**Next step:** Phase 33C — Controlled Limited Beta Prep Review (separate gate; not automatically approved)

---

This template must not be used to imply any readiness status higher than LIMITED_BETA_CANDIDATE.
Every use of this template requires a pre-publication claim boundary review.

## Chosen prep decision

```text
PHASE33B_CONTROLLED_LIMITED_BETA_PREP_DECISION: PASS_TO_PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW
```

Phase 33B does not approve BETA_READY.
Phase 33B does not approve public production readiness.
LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
All unresolved limitations are carried forward.

## Decision rationale

All eleven required prep surfaces have been addressed in this preparation document:

1. **Limited beta participant boundary** — internal/controlled access only; structured
   designation and disclosure requirement defined.
2. **Limitation disclosure checklist** — all Phase 33A limitations enumerated in a
   mandatory checklist; must be acknowledged before any access grant.
3. **No public production wording** — prohibited terms and required framing defined;
   conservative claim posture confirmed.
4. **No Beta Ready wording** — prohibited terms and required framing defined; Phase 30C
   hold confirmed as not lifted.
5. **No data-loss guarantee wording** — prohibited terms and required disclosure defined;
   participant backup requirement stated.
6. **No cloud/sync/backend/account/auth claim** — boundary confirmed; explicitly out of
   scope.
7. **Restore/adapter blocked-default-off follow-up** — lanes confirmed as `BLOCKED_DEFAULT_OFF`;
   resolution paths defined (production evidence or formal de-scope gate).
8. **Stress/rollback follow-up** — smoke-level and simulation baselines documented;
   production-representative runs planned for future gate.
9. **Data Safety UX internal-only status** — internal-only confirmed; ordinary-user gate
   remains closed; change requires dedicated gate.
10. **Release/PR note template** — template created using only LIMITED_BETA_CANDIDATE
    language; disclosures embedded; pre-publication review required.
11. **Phase 33C seed** — Phase 33C seed prepared with required sections, token, decision
    options, and review constraints.

Given that all eleven prep surfaces are addressed and no new blockers have been discovered,
`PASS_TO_PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW` is the appropriate decision.
It enables Phase 33C to independently review the Phase 33B prep materials and make its own
decision. It does not approve BETA_READY or any higher readiness status.

## What Phase 33B supports

- Preparation of a structured participant boundary for controlled internal limited beta access.
- Creation of a mandatory limitation disclosure checklist for beta participants.
- Establishment of no-public-production, no-Beta-Ready, no-data-loss-guarantee wording
  boundaries.
- Definition of a no-cloud/sync/backend/account/auth claim boundary.
- Follow-up plans for restore/adapter blocked-default-off lanes and stress/rollback evidence.
- Confirmation of Data Safety UX internal-only status.
- Creation of a release/PR note template using only LIMITED_BETA_CANDIDATE language.
- Preparation of the Phase 33C Controlled Limited Beta Prep Review seed.

## What Phase 33B does not approve

Phase 33B does not approve BETA_READY.
Phase 33B does not approve public production readiness.
Phase 33B does not approve guaranteed data-loss prevention.
Phase 33B does not approve restore execution.
Phase 33B does not approve production restore rehearsal.
Phase 33B does not approve real learner data restore rehearsal.
Phase 33B does not approve runtime backup/export/restore behavior changes.
Phase 33B does not approve backup file format changes.
Phase 33B does not approve restore overwrite behavior changes.
Phase 33B does not approve storage migration.
Phase 33B does not approve sync/cloud/account/auth/backend.
Phase 33B does not approve telemetry/analytics.
Phase 33B does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 33B does not approve BYOC/WebDAV/P2P/device-transfer implementation.
Phase 33B does not approve limited settings visibility to ordinary users.

## Claim boundary

Allowed claims at LIMITED_BETA_CANDIDATE readiness after Phase 33B prep:
- Application is a controlled internal limited beta candidate for evaluation.
- All limitations disclosed as listed in the limitation disclosure checklist.
- Data Safety UX is available internally only.
- Study scheduling includes experimental FSRS (default-off).
- Participant access is controlled and individually granted.
- No guaranteed data-loss prevention — independent backups required.

Claims not allowed:
- BETA_READY.
- Beta Ready (approved).
- Production ready.
- Public release.
- Broad beta release.
- Guaranteed data-loss prevention.
- Production restore safety (not proven).
- Stress-tested readiness.
- Real learner data validated.
- Adapter-awareness production proven.
- Rollback guaranteed.
- Sync/cloud/backend/account/auth available.
- Phase 33B approves any of the above.

## Next recommended phase

```text
Next recommended phase: Phase 33C — Controlled Limited Beta Prep Review
Phase 33C is a separate controlled limited beta prep review gate and is not automatically approved.
Phase 33B confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 33B does not approve BETA_READY.
Phase 33B does not approve public production readiness.
Phase 33B does not approve guaranteed data-loss prevention.
Phase 33B does not approve restore execution.
Phase 33B does not approve production restore rehearsal.
Phase 33B does not approve real learner data restore rehearsal.
Phase 33B does not approve runtime backup/export/restore behavior changes.
Phase 33B does not approve backup file format changes.
Phase 33B does not approve restore overwrite behavior changes.
Phase 33B does not approve storage migration.
Phase 33B does not approve sync/cloud/account/auth/backend.
Phase 33B does not approve telemetry/analytics.
Phase 33B does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 33B does not approve BYOC/WebDAV/P2P/device-transfer implementation.
Phase 33B does not approve limited settings visibility to ordinary users.
```
